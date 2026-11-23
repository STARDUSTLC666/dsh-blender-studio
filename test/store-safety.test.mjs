import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, readdir, stat } from 'node:fs/promises'
import { join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { unzipSync } from 'fflate'
import { BlenderStore, validateAssetUpload } from '../lib/store.js'
import { defaultProjectFields, validateProjectFields, MAX_ACTIVE_PROJECTS, MAX_PROJECT_ASSETS } from '../lib/types.js'

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
    [{ ...baseFields, customScript: 'a'.repeat(70 * 1024) }, 'SCRIPT_TOO_LARGE'],
  ]) {
    assert.throws(() => validateProjectFields(bad), (err) => err.code === code && err.status === 400, code)
  }
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

test('BlenderStore buildSourceZip produces valid archive with project.json, scene.py, README.txt, and assets', async (t) => {
  const { store } = await makeStore(t)
  let project = await store.create(baseFields)
  project = await store.upload(project.id, project.revision, 'studio.hdr', HDR_BYTES)

  const zipBytes = await store.buildSourceZip(project.id)
  assert.ok(zipBytes.byteLength > 100)
  const files = unzipSync(zipBytes)

  assert.ok(files['project.json'], 'ZIP must include project.json')
  assert.ok(files['scene.py'], 'ZIP must include scene.py')
  assert.ok(files['README.txt'], 'ZIP must include README.txt')
  const assetEntry = `assets/${project.assets[0].file}`
  assert.ok(files[assetEntry], `ZIP must include ${assetEntry}`)
  assert.deepEqual(Buffer.from(files[assetEntry]), HDR_BYTES)

  const parsedJson = JSON.parse(Buffer.from(files['project.json']).toString('utf8'))
  assert.equal(parsedJson.id, project.id)
  assert.equal(parsedJson.title, baseFields.title)

  const scenePy = Buffer.from(files['scene.py']).toString('utf8')
  assert.match(scenePy, /import bpy/)
  assert.match(scenePy, /dsh_build_template/)
})
