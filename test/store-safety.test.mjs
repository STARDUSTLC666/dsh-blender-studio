import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, readdir, stat } from 'node:fs/promises'
import { join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { unzipSync } from 'fflate'
import { BlenderStore, validateAssetUpload } from '../lib/store.js'
import {
  defaultProjectFields,
  validateProjectFields,
  MAX_ACTIVE_PROJECTS,
  MAX_PROJECT_ASSETS,
  MAX_PROJECT_ARTIFACTS,
  MAX_CUSTOM_SCRIPT_BYTES,
  MAX_PROJECT_JSON_BYTES,
  MAX_SCRIPT_CHECKPOINTS,
} from '../lib/types.js'

const testRoot = dirname(fileURLToPath(import.meta.url))

async function makeStore(t) {
  const root = await mkdtemp(join(testRoot, '.store-fixture-'))
  const store = new BlenderStore(root)
  t.after(async () => {
    const rel = relative(resolve(testRoot), resolve(root))
    assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel))
    await rm(root, { recursive: true, force: true })
  })
  return { root, store }
}

const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
const JPG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
const WEBP_BYTES = (() => {
  const b = Buffer.alloc(24)
  b.write('RIFF', 0, 'ascii')
  b.writeUInt32LE(16, 4)
  b.write('WEBP', 8, 'ascii')
  b.write('VP8L', 12, 'ascii')
  return b
})()
const HDR_BYTES = Buffer.from('#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 1 +X 1\n\x00\x00\x00\x00', 'binary')
const EXR_BYTES = Buffer.from([0x76, 0x2f, 0x31, 0x01, 0x02, 0x00, 0x00, 0x00])
const GLB_BYTES = (() => {
  const b = Buffer.alloc(16)
  b.write('glTF', 0, 'ascii')
  b.writeUInt32LE(2, 4)
  b.writeUInt32LE(16, 8)
  return b
})()
const GLTF_BYTES = Buffer.from(JSON.stringify({ asset: { version: '2.0' }, scenes: [] }))
const OBJ_BYTES = Buffer.from('# cube\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n')
const FBX_BYTES = Buffer.from('Kaydara FBX Binary  \x00\x1a\x00', 'binary')
const STL_ASCII_BYTES = Buffer.from('solid tri\nfacet normal 0 0 1\nendsolid tri\n')
const BLEND_BYTES = Buffer.from('BLENDER-v403REND0000', 'ascii')

const baseFields = defaultProjectFields({
  template: 'product-studio',
  title: 'Flagship Watch Studio',
  headline: 'CHRONO X',
  engine: 'EEVEE',
  samples: 32,
})

test('BlenderStore CRUD, optimistic revision conflict (409), and field validation', async (t) => {
  assert.ok(new BlenderStore().root.endsWith('dsh-blender-studio'), 'default store root uses dsh-blender-studio')
  const { store, root } = await makeStore(t)
  const created = await store.create(baseFields)
  assert.equal(created.revision, 1)
  assert.equal(created.title, 'Flagship Watch Studio')
  assert.equal(created.archived, false)

  const fetched = await store.get(created.id)
  assert.equal(fetched.id, created.id)
  assert.equal(fetched.headline, 'CHRONO X')

  // Competing concurrent updates: exactly one wins, the other gets 409 CONFLICT
  const other = new BlenderStore(root)
  const settled = await Promise.allSettled([
    store.update(created.id, created.revision, { title: 'Window One' }),
    other.update(created.id, created.revision, { title: 'Window Two' }),
  ])
  assert.equal(settled.filter((r) => r.status === 'fulfilled').length, 1)
  const rejected = settled.find((r) => r.status === 'rejected')
  assert.equal(rejected.reason.code, 'CONFLICT')
  assert.equal(rejected.reason.status, 409)

  const after = await other.get(created.id)
  assert.equal(after.revision, 2)
  assert.ok(after.title === 'Window One' || after.title === 'Window Two')

  // Field validator guards
  for (const [bad, code] of [
    [{ ...baseFields, title: '' }, 'TITLE_INVALID'],
    [{ ...baseFields, title: 'x'.repeat(73) }, 'TITLE_INVALID'],
    [{ ...baseFields, description: 'd'.repeat(601) }, 'DESCRIPTION_TOO_LONG'],
    [{ ...baseFields, headline: 'h'.repeat(49) }, 'HEADLINE_TOO_LONG'],
    [{ ...baseFields, template: '__proto__' }, 'TEMPLATE_INVALID'],
    [{ ...baseFields, samples: 2 }, 'SAMPLES_INVALID'],
    [{ ...baseFields, samples: 2048 }, 'SAMPLES_INVALID'],
    [{ ...baseFields, frameStart: 10, frameEnd: 5 }, 'FRAMES_INVALID'],
    [{ ...baseFields, frameStart: 1, frameEnd: 700 }, 'FRAMES_INVALID'],
    [{ ...baseFields, accentColor: 'red' }, 'COLOR_INVALID'],
    [{ ...baseFields, customScript: 'a'.repeat(MAX_CUSTOM_SCRIPT_BYTES + 1024) }, 'SCRIPT_TOO_LARGE'],
  ]) {
    assert.throws(() => validateProjectFields(bad), (err) => err.code === code && err.status === 400, code)
  }

  // v0.2.0 raised script/project/checkpoint/artifact limits
  assert.equal(MAX_CUSTOM_SCRIPT_BYTES, 256 * 1024)
  assert.ok(MAX_PROJECT_JSON_BYTES >= 1024 * 1024, 'MAX_PROJECT_JSON_BYTES must be >= 1 MB')
  assert.equal(MAX_PROJECT_ARTIFACTS, 12)
  assert.equal(MAX_SCRIPT_CHECKPOINTS, 10)
  // 200 KB custom script must be accepted cleanly
  const bigScript = '# ' + 'x'.repeat(200 * 1024)
  assert.equal(validateProjectFields({ ...baseFields, scriptMode: 'custom', customScript: bigScript }).customScript.length, bigScript.length)
})

test('BlenderStore archive/restore preserves assets & runs and enforces max 30 active slot limit', async (t) => {
  const { store } = await makeStore(t)
  const first = await store.create({ ...baseFields, title: 'Archived Candidate' })
  const withAsset = await store.upload(first.id, first.revision, 'env.hdr', HDR_BYTES)

  // Stale revision rejected on archive
  await assert.rejects(
    store.archive(first.id, first.revision, false),
    (err) => err.code === 'CONFLICT' && err.status === 409,
  )

  const archived = await store.archive(first.id, withAsset.revision, false)
  assert.equal(archived.archived, true)
  assert.equal((await store.list(false)).length, 0)
  assert.equal((await store.list(true)).length, 1)

  // Fill up to 30 active projects
  for (let i = 0; i < MAX_ACTIVE_PROJECTS; i++) {
    await store.create({ ...baseFields, title: `Active Project ${i}` })
  }
  assert.equal((await store.list(false)).length, MAX_ACTIVE_PROJECTS)

  // 31st create blocked with PROJECT_LIMIT (409)
  await assert.rejects(
    store.create({ ...baseFields, title: 'Overflow' }),
    (err) => err.code === 'PROJECT_LIMIT' && err.status === 409,
  )

  // Restore also blocked when at 30 active; archived project stays intact
  await assert.rejects(
    store.archive(first.id, withAsset.revision, true),
    (err) => err.code === 'PROJECT_LIMIT' && err.status === 409,
  )
  assert.equal((await store.get(first.id, true)).assets.length, 1)

  // Archive one active project, then restore succeeds and keeps asset bytes intact
  const activeOne = (await store.list(false))[0]
  await store.archive(activeOne.id, activeOne.revision, false)
  const restored = await store.archive(first.id, withAsset.revision, true)
  assert.equal(restored.archived, false)
  assert.equal((await store.list(false)).length, MAX_ACTIVE_PROJECTS)
  assert.deepEqual(await store.assetBytes(first.id, restored.assets[0]), HDR_BYTES)
})

test('BlenderStore rejects path traversal and symlinks/junctions on project & asset dirs', async (t) => {
  const { store, root } = await makeStore(t)
  const project = await store.create(baseFields)
  const other = await store.create({ ...baseFields, title: 'Other Project' })

  // Path traversal IDs rejected as ID_INVALID
  for (const badId of ['../../outside', '../projects', 'not-a-uuid', `${project.id}/../other`]) {
    await assert.rejects(store.get(badId), (err) => err.code === 'ID_INVALID' && err.status === 400)
    await assert.rejects(store.path(badId), (err) => err.code === 'ID_INVALID' && err.status === 400)
  }

  // Symlink / junction in assets dir pointing to another project MUST be rejected
  const projectDir = await store.path(project.id)
  const otherDir = await store.path(other.id)
  await symlink(otherDir, join(projectDir, 'assets'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(
    store.upload(project.id, project.revision, 'sneaky.png', PNG_BYTES),
    (err) => err.code === 'STORAGE_UNSAFE' && err.status === 400,
  )
  assert.deepEqual(await readdir(otherDir), ['project.json'])

  // Symlink / junction as project folder itself MUST be rejected
  const fakeId = randomUUID()
  await symlink(otherDir, join(root, 'projects', fakeId), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(
    store.get(fakeId),
    (err) => err.code === 'STORAGE_UNSAFE' && err.status === 400,
  )
})

test('BlenderStore isolates corrupted project folders without blocking list() or create()', async (t) => {
  const { store, root } = await makeStore(t)
  const healthy = await store.create({ ...baseFields, title: 'Healthy Scene' })
  const damaged = await store.create({ ...baseFields, title: 'Will Corrupt' })
  const damagedJsonPath = join(await store.path(damaged.id), 'project.json')
  await writeFile(damagedJsonPath, '{corrupted json')
  // Non-UUID junk directory should be silently ignored
  await mkdir(join(root, 'projects', 'junk-folder-not-uuid'), { recursive: true })

  await assert.rejects(store.get(damaged.id), (err) => err.code === 'PROJECT_CORRUPT' && err.status === 400)
  // Original damaged file is preserved untouched
  assert.equal(await readFile(damagedJsonPath, 'utf8'), '{corrupted json')

  const { projects, corrupted } = await store.listWithWarnings(false)
  assert.deepEqual(projects.map((p) => p.id), [healthy.id])
  assert.equal(corrupted.length, 1)
  assert.equal(corrupted[0].id, damaged.id)

  // Creating new projects still succeeds cleanly
  const next = await store.create({ ...baseFields, title: 'New After Corruption' })
  assert.equal((await store.list(false)).length, 2)
  assert.ok((await store.list(false)).some((p) => p.id === next.id))
})

test('BlenderStore validates magic bytes for all supported 3D/image/HDRI formats and enforces limits', async (t) => {
  const { store } = await makeStore(t)
  let project = await store.create(baseFields)

  // Reject mismatched extension / magic bytes & empty buffer
  assert.throws(() => validateAssetUpload('empty.png', Buffer.alloc(0)), (err) => err.code === 'ASSET_SIZE')
  assert.throws(() => validateAssetUpload('fake.png', Buffer.from('<html>not png</html>')), (err) => err.code === 'ASSET_FORMAT')
  assert.throws(() => validateAssetUpload('fake.glb', Buffer.from('NOT_GLB_HEADER')), (err) => err.code === 'ASSET_FORMAT')
  assert.throws(() => validateAssetUpload('fake.hdr', Buffer.from('NOT_HDR')), (err) => err.code === 'ASSET_FORMAT')
  assert.throws(() => validateAssetUpload('fake.blend', Buffer.from('NOT_BLEND')), (err) => err.code === 'ASSET_FORMAT')
  assert.throws(() => validateAssetUpload('script.py', Buffer.from('import bpy')), (err) => err.code === 'ASSET_FORMAT')

  // Upload all 11 supported formats with sanitized names
  const validUploads = [
    ['../tex/albedo.png', PNG_BYTES, 'texture', 'png'],
    ['photo.jpeg', JPG_BYTES, 'texture', 'jpg'],
    ['cover.webp', WEBP_BYTES, 'texture', 'webp'],
    ['studio.hdr', HDR_BYTES, 'hdri', 'hdr'],
    ['sky.exr', EXR_BYTES, 'hdri', 'exr'],
    ['hero.glb', GLB_BYTES, 'model', 'glb'],
    ['scene.gltf', GLTF_BYTES, 'model', 'gltf'],
    ['mesh.obj', OBJ_BYTES, 'model', 'obj'],
    ['rig.fbx', FBX_BYTES, 'model', 'fbx'],
    ['part.stl', STL_ASCII_BYTES, 'model', 'stl'],
    ['source.blend', BLEND_BYTES, 'blend', 'blend'],
  ]

  for (const [name, bytes, expectedKind, expectedExt] of validUploads) {
    const res = await store.addAsset(project.id, project.revision, name, bytes)
    project = res.project
    assert.equal(res.asset.kind, expectedKind, name)
    assert.equal(res.asset.ext, expectedExt, name)
    assert.match(res.asset.file, new RegExp(`^[0-9a-f-]+\\.${expectedExt}$`))
    assert.ok(!res.asset.name.includes('..') && !res.asset.name.includes('/'))
    assert.deepEqual(await store.assetBytes(project.id, res.asset), bytes)
  }

  // Fill remaining slots up to MAX_PROJECT_ASSETS (24), then 25th fails with ASSET_LIMIT
  while (project.assets.length < MAX_PROJECT_ASSETS) {
    project = await store.upload(project.id, project.revision, `extra_${project.assets.length}.png`, PNG_BYTES)
  }
  await assert.rejects(
    store.upload(project.id, project.revision, 'overflow.png', PNG_BYTES),
    (err) => err.code === 'ASSET_LIMIT' && err.status === 400,
  )

  // Remove asset deletes metadata and disk file
  const victim = project.assets[0]
  const { file: victimFile } = await store.assetPath(project.id, victim.id)
  project = await store.removeAsset(project.id, project.revision, victim.id)
  assert.equal(project.assets.length, MAX_PROJECT_ASSETS - 1)
  await assert.rejects(stat(victimFile), /ENOENT/)
})

test('BlenderStore buildSourceZip produces valid archive with project.json, scene.py, README.txt, assets, and Store-mode for precompressed media', async (t) => {
  const { store } = await makeStore(t)
  let project = await store.create(baseFields)
  project = await store.upload(project.id, project.revision, 'studio.hdr', HDR_BYTES)
  project = await store.upload(project.id, project.revision, 'albedo.png', PNG_BYTES)
  project = await store.upload(project.id, project.revision, 'hero.glb', GLB_BYTES)

  const zipBytes = await store.buildSourceZip(project.id)
  assert.ok(zipBytes.byteLength > 100)
  const files = unzipSync(zipBytes)

  assert.ok(files['project.json'], 'ZIP must include project.json')
  assert.ok(files['scene.py'], 'ZIP must include scene.py')
  assert.ok(files['README.txt'], 'ZIP must include README.txt')
  for (const asset of project.assets) {
    const assetEntry = `assets/${asset.file}`
    assert.ok(files[assetEntry], `ZIP must include ${assetEntry}`)
  }
  assert.deepEqual(Buffer.from(files[`assets/${project.assets[0].file}`]), HDR_BYTES)
  assert.deepEqual(Buffer.from(files[`assets/${project.assets[1].file}`]), PNG_BYTES)
  assert.deepEqual(Buffer.from(files[`assets/${project.assets[2].file}`]), GLB_BYTES)

  // Verify precompressed .png and .glb entries use ZIP Store mode (compression method === 0)
  const buf = Buffer.from(zipBytes)
  const methodsByName = new Map()
  for (let off = 0; off + 30 < buf.length; ) {
    if (buf.readUInt32LE(off) !== 0x04034b50) break
    const method = buf.readUInt16LE(off + 8)
    const compSize = buf.readUInt32LE(off + 18)
    const nameLen = buf.readUInt16LE(off + 26)
    const extraLen = buf.readUInt16LE(off + 28)
    const entryName = buf.subarray(off + 30, off + 30 + nameLen).toString('utf8')
    methodsByName.set(entryName, method)
    off += 30 + nameLen + extraLen + compSize
  }
  assert.equal(methodsByName.get(`assets/${project.assets[1].file}`), 0, '.png asset must use Store mode (level: 0)')
  assert.equal(methodsByName.get(`assets/${project.assets[2].file}`), 0, '.glb asset must use Store mode (level: 0)')

  const parsedJson = JSON.parse(Buffer.from(files['project.json']).toString('utf8'))
  assert.equal(parsedJson.id, project.id)
  assert.equal(parsedJson.title, baseFields.title)

  const scenePy = Buffer.from(files['scene.py']).toString('utf8')
  assert.match(scenePy, /import bpy/)
  assert.match(scenePy, /dsh_build_template/)
})

test('BlenderStore v0.2.0: duplicate(), script checkpoints, upload rollback, and pruneOldRuns retention', async (t) => {
  const { store } = await makeStore(t)

  // 1. Duplicate clones fields & deep-copies assets with new UUIDs without mutating original
  let orig = await store.create({ ...baseFields, template: 'architectural-pavilion', title: 'Pavilion Original' })
  orig = await store.upload(orig.id, orig.revision, 'sky.hdr', HDR_BYTES)
  orig = await store.upload(orig.id, orig.revision, 'hero.glb', GLB_BYTES)

  const cloned = await store.duplicate(orig.id, 'Pavilion Clone')
  assert.notEqual(cloned.id, orig.id)
  assert.equal(cloned.revision, 1)
  assert.equal(cloned.title, 'Pavilion Clone')
  assert.equal(cloned.template, 'architectural-pavilion')
  assert.equal(cloned.assets.length, 2)
  assert.notEqual(cloned.assets[0].id, orig.assets[0].id)
  assert.deepEqual(await store.assetBytes(cloned.id, cloned.assets[0]), HDR_BYTES)
  assert.deepEqual(await store.assetBytes(cloned.id, cloned.assets[1]), GLB_BYTES)
  assert.deepEqual(await store.assetBytes(orig.id, orig.assets[0]), HDR_BYTES)

  // 2. Script checkpoints: auto-capture on customScript update, manual saveCheckpoint, restoreCheckpoint + 409/404 guards
  let p = await store.update(cloned.id, cloned.revision, {
    scriptMode: 'custom',
    customScript: 'import bpy\nprint("v1")\n',
  })
  const p2 = await store.update(p.id, p.revision, {
    customScript: 'import bpy\nprint("v2")\n',
  })
  assert.ok((p2.checkpoints?.length ?? 0) >= 1, 'changing customScript must auto-capture previous snapshot')
  assert.match(p2.checkpoints[0].customScript, /print\("v1"\)/)

  const pSaved = await store.saveCheckpoint(p2.id, p2.revision, 'Before bevel tweak')
  assert.ok(pSaved.checkpoints.some((c) => c.note === 'Before bevel tweak' && c.customScript.includes('v2')))

  const v1Checkpoint = pSaved.checkpoints.find((c) => c.customScript.includes('v1'))
  assert.ok(v1Checkpoint)

  // Stale revision rejected with 409 CONFLICT; unknown checkpoint rejected with 404 CHECKPOINT_NOT_FOUND
  await assert.rejects(
    store.restoreCheckpoint(pSaved.id, pSaved.revision - 1, v1Checkpoint.id),
    (err) => err.code === 'CONFLICT' && err.status === 409,
  )
  await assert.rejects(
    store.restoreCheckpoint(pSaved.id, pSaved.revision, randomUUID()),
    (err) => err.code === 'CHECKPOINT_NOT_FOUND' && err.status === 404,
  )

  const restored = await store.restoreCheckpoint(pSaved.id, pSaved.revision, v1Checkpoint.id)
  assert.match(restored.customScript, /print\("v1"\)/)
  assert.ok(restored.checkpoints.length <= MAX_SCRIPT_CHECKPOINTS)

  // Push >12 checkpoints -> capped at MAX_SCRIPT_CHECKPOINTS (10)
  let cur = restored
  for (let i = 0; i < 12; i++) {
    cur = await store.update(cur.id, cur.revision, { customScript: `import bpy\nprint("iter-${i}")\n` })
  }
  assert.equal(cur.checkpoints.length, MAX_SCRIPT_CHECKPOINTS)

  // 3. Upload rollback: stale revision fails cleanly and leaves ZERO orphan files in assets/
  const assetsDir = join(await store.path(cur.id), 'assets')
  const filesBefore = (await readdir(assetsDir)).sort()
  await assert.rejects(
    store.addAsset(cur.id, cur.revision - 1, 'should-rollback.png', PNG_BYTES),
    (err) => err.code === 'CONFLICT' && err.status === 409,
  )
  assert.deepEqual((await readdir(assetsDir)).sort(), filesBefore, 'failed upload must roll back orphan file on disk')

  // 4. Artifact cap (12) + pruneOldRuns deletes orphaned run folders outside retained set
  const projDir = await store.path(cur.id)
  const orphanRunId = randomUUID()
  await mkdir(join(projDir, 'runs', orphanRunId), { recursive: true })
  await writeFile(join(projDir, 'runs', orphanRunId, 'stale.png'), PNG_BYTES)

  const runIds = []
  let afterArt = cur
  for (let i = 0; i < MAX_PROJECT_ARTIFACTS + 3; i++) {
    const artId = randomUUID()
    runIds.push(artId)
    const rDir = await store.runDir(cur.id, artId)
    await writeFile(join(rDir, 'render.png'), PNG_BYTES)
    afterArt = await store.registerArtifact(cur.id, {
      id: artId,
      kind: 'still',
      revision: cur.revision,
      file: 'render.png',
      mime: 'image/png',
      size: PNG_BYTES.length,
      engine: 'EEVEE',
      samples: 16,
      width: 1280,
      height: 720,
      durationMs: 50,
      created: new Date(Date.now() + i * 1000).toISOString(),
    })
  }
  assert.equal(afterArt.artifacts.length, MAX_PROJECT_ARTIFACTS, 'artifacts capped at 12')
  await assert.rejects(stat(join(projDir, 'runs', orphanRunId)), /ENOENT/, 'orphan run dir pruned')
  await assert.rejects(stat(join(projDir, 'runs', runIds[0])), /ENOENT/, 'evicted oldest artifact run dir pruned')
  await stat(join(projDir, 'runs', runIds.at(-1), 'render.png'))
})
