import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'
import { BlenderWorkbench, installBlenderWorkbench } from '../lib/workbench.js'
import { BlenderBridgeClient } from '../lib/bridge.js'
import { defaultProjectFields, SCENE_JSON_MARKER } from '../lib/types.js'

const testRoot = dirname(fileURLToPath(import.meta.url))

// Minimal valid 1280x720 PNG header + payload bytes
const MOCK_PNG = (() => {
  const buf = Buffer.alloc(64)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0)
  buf.writeUInt32BE(13, 8)
  buf.write('IHDR', 12, 'ascii')
  buf.writeUInt32BE(1280, 16)
  buf.writeUInt32BE(720, 20)
  return buf
})()

const MOCK_MP4 = (() => {
  const buf = Buffer.alloc(4096, 0x22)
  buf.write('ftyp', 4, 'ascii')
  buf.write('isom', 8, 'ascii')
  return buf
})()

const MOCK_GLB = (() => {
  const buf = Buffer.alloc(128)
  buf.write('glTF', 0, 'ascii')
  buf.writeUInt32LE(2, 4)
  buf.writeUInt32LE(128, 8)
  return buf
})()

const MOCK_HDR = Buffer.from('#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 1 +X 1\n\x00\x00\x00\x00', 'binary')
const MOCK_BLEND = Buffer.from('BLENDER-v403REND00000000', 'ascii')

const MOCK_SCENE_SUMMARY = {
  capturedAt: '2026-11-23T12:00:00Z',
  blenderVersion: '4.3.2',
  engine: 'BLENDER_EEVEE_NEXT',
  objectCount: 6,
  meshCount: 3,
  lightCount: 2,
  cameraCount: 1,
  totalPolygons: 512,
  activeCamera: 'DSH_Camera',
  materials: ['Mat_Hero_Body', 'Mat_Studio_Stage'],
  collections: ['Scene Collection', 'DSH_Hero'],
  objects: [
    { name: 'Product_Body', type: 'MESH', location: [0, 0, 1.0], dimensions: [1.2, 1.2, 1.4], vertices: 256, polygons: 512 },
    { name: 'DSH_Camera', type: 'CAMERA', location: [4.2, -4.7, 3.0] },
  ],
  qc: {
    score: 96,
    grade: 'A',
    issues: [],
  },
}

const MOCK_BAD_QC_SUMMARY = {
  ...MOCK_SCENE_SUMMARY,
  qc: {
    score: 40,
    grade: 'D',
    issues: [
      { code: 'NO_CAMERA', severity: 'error', message: 'Scene has no active camera' },
      { code: 'UNASSIGNED_MATERIAL', severity: 'warn', message: 'Hero has no material', object: 'Product_Body' },
    ],
  },
}

async function startMockBridgeServer(t) {
  const calls = []
  const server = createServer((socket) => {
    let buf = ''
    socket.on('data', (chunk) => {
      buf += chunk.toString('utf8')
      let idx
      while ((idx = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, idx).trim()
        buf = buf.slice(idx + 1)
        if (!line) continue
        const req = JSON.parse(line)
        calls.push(req)
        let result
        switch (req.command) {
          case 'ping':
            result = {
              blenderVersion: '4.3.2',
              sceneName: 'LiveStudio',
              engine: 'BLENDER_EEVEE_NEXT',
              frameCurrent: 1,
              objectCount: 6,
            }
            break
          case 'scene_info':
            result = MOCK_SCENE_SUMMARY
            break
          case 'execute':
            result = { stdout: 'bridge-exec-ok', stderr: '', sceneSummary: MOCK_SCENE_SUMMARY }
            break
          case 'viewport_capture':
            result = {
              mime: 'image/png',
              base64: MOCK_PNG.toString('base64'),
              width: req.params?.width ?? 960,
              height: req.params?.height ?? 540,
            }
            break
          case 'load_script':
            result = { stdout: 'synced ' + String(req.params?.projectTitle ?? ''), stderr: '', sceneSummary: MOCK_SCENE_SUMMARY }
            break
          default:
            socket.write(JSON.stringify({ id: req.id, ok: false, result: null, error: { code: 'BRIDGE_PROTOCOL_ERROR', message: 'Unknown' } }) + '\n')
            continue
        }
        socket.write(JSON.stringify({ id: req.id, ok: true, result, error: null }) + '\n')
      }
    })
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  return { port: server.address().port, calls }
}

async function createWorkbenchFixture(t, extra = {}) {
  const root = await mkdtemp(join(testRoot, '.wb-fixture-'))
  const launchedGuis = []
  let executorBehavior = extra.executorBehavior ?? 'succeed'
  let mockSummary = extra.sceneSummary ?? MOCK_SCENE_SUMMARY
  const seenScripts = []

  const executor = async (req) => {
    seenScripts.push(req.scriptContent || '')
    req.onLine?.('Fra:1 Mem:24.00M | Sample 16/32')
    req.onProgress?.(50, '渲染第 1 帧 · 采样 16/32')

    if (executorBehavior === 'hang') {
      await new Promise((resolveRun, rejectRun) => {
        const timer = setTimeout(resolveRun, 10_000)
        req.signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(timer)
            const err = new Error('Blender 任务已取消。')
            err.code = 'JOB_CANCELLED'
            rejectRun(err)
          },
          { once: true },
        )
      })
    }

    if (executorBehavior === 'fail') {
      req.onLine?.('RuntimeError: synthetic mock crash')
      const err = new Error('Blender CLI failed')
      err.code = 'CLI_FAILED'
      throw err
    }

    const code = req.scriptContent || ''
    if (code.includes('render.png')) {
      await writeFile(join(req.cwd, 'render.png'), MOCK_PNG)
    } else if (code.includes('contact_sheet.png')) {
      await writeFile(join(req.cwd, 'contact_sheet.png'), MOCK_PNG)
    } else if (code.includes('animation.mp4')) {
      await writeFile(join(req.cwd, 'animation.mp4'), MOCK_MP4)
    } else if (code.includes('model.glb')) {
      await writeFile(join(req.cwd, 'model.glb'), MOCK_GLB)
    } else if (code.includes('scene.blend')) {
      await writeFile(join(req.cwd, 'scene.blend'), MOCK_BLEND)
    }

    return {
      exitCode: 0,
      lines: ['Fra:1 Mem:24.00M | Sample 32/32', 'Saved output'],
      stdout: `mock-blender-stdout\n${SCENE_JSON_MARKER}${JSON.stringify(mockSummary)}`,
      stderr: '',
      sceneSummary: mockSummary,
      savedFiles: [],
      durationMs: 42,
    }
  }

  const fetchImpl = async (url) => {
    const u = String(url)
    if (u.startsWith('https://api.polyhaven.com/assets?t=hdris')) {
      return new Response(
        JSON.stringify({
          studio_small_09: {
            name: 'Studio Small 09',
            categories: ['studio'],
            tags: ['softbox'],
            authors: ['PolyHaven'],
            download_count: 50000,
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }
    if (u === 'https://api.polyhaven.com/files/studio_small_09') {
      return new Response(
        JSON.stringify({
          hdri: { '1k': { hdr: { url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr' } } },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }
    if (u.startsWith('https://dl.polyhaven.org/')) {
      return new Response(MOCK_HDR, { status: 200 })
    }
    return new Response('not found', { status: 404 })
  }

  const workbench = new BlenderWorkbench({
    root,
    skipSystemScan: true,
    extraCandidates: [{ path: '/mock/blender-4.3', source: 'standard' }],
    prober: async (execPath) =>
      execPath === '/mock/blender-4.3'
        ? { ok: true, stdout: 'Blender 4.3.2\n' }
        : { ok: false, stdout: '', error: 'ENOENT' },
    executor,
    fetchImpl,
    bridge: extra.bridge,
    trashPath: extra.trashPath,
    launchGui: async (executable, blendFile) => {
      launchedGuis.push({ executable, blendFile })
      return { pid: 4242, executable, blendFile }
    },
  })

  t.after(async () => {
    workbench.dispose()
    for (let i = 0; i < 60 && workbench.listJobs().some((j) => j.state === 'running'); i++) {
      await new Promise((r) => setTimeout(r, 15))
    }
    const rel = relative(resolve(testRoot), resolve(root))
    assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel))
    await rm(root, { recursive: true, force: true })
  })

  const post = (body, extraHeaders = {}) =>
    workbench.fetch(
      new Request('http://dsh.test' + workbench.route, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-dsh-blender-studio': '1',
          ...extraHeaders,
        },
        body: JSON.stringify(body),
      }),
    )

  return {
    root,
    workbench,
    post,
    launchedGuis,
    seenScripts,
    setBehavior: (b) => {
      executorBehavior = b
    },
    setSceneSummary: (s) => {
      mockSummary = s
    },
  }
}

test('BlenderWorkbench HTTP API: CSRF guard, GET addon/asset/artifact (Range 206)/source ZIP, POST CRUD & upload', async (t) => {
  const { workbench, post } = await createWorkbenchFixture(t)

  // 1. CSRF / Origin checks (including DSH Desktop dsh-app://app + Sec-Fetch-Site: cross-site)
  assert.equal(
    (
      await workbench.fetch(
        new Request('http://dsh.test' + workbench.route, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'list' }),
        }),
      )
    ).status,
    403,
    'missing x-dsh-blender-studio header must return 403',
  )
  const evilOriginRes = await post({ action: 'list' }, { origin: 'https://evil.example' })
  assert.equal(evilOriginRes.status, 403)
  assert.equal((await evilOriginRes.json()).code, 'ORIGIN_FORBIDDEN')

  const crossSiteRes = await post({ action: 'list' }, { origin: 'http://dsh.test', 'sec-fetch-site': 'cross-site' })
  assert.equal(crossSiteRes.status, 403, 'non-desktop cross-site request must return 403 ORIGIN_FORBIDDEN')
  assert.equal((await crossSiteRes.json()).code, 'ORIGIN_FORBIDDEN')

  assert.equal(
    (await post({ action: 'list' }, { origin: 'dsh-app://app', host: '127.0.0.1:8181', 'sec-fetch-site': 'cross-site' })).status,
    200,
    'desktop dsh-app://app origin with Sec-Fetch-Site: cross-site must be allowed',
  )

  // 2. GET ?kind=addon returns dsh_blender_bridge.py
  const addonRes = await workbench.fetch(new Request(`http://dsh.test${workbench.route}?kind=addon`))
  assert.equal(addonRes.status, 200)
  assert.match(addonRes.headers.get('content-type') || '', /text\/x-python/)
  assert.match(addonRes.headers.get('content-disposition') || '', /dsh_blender_bridge\.py/)
  assert.match(await addonRes.text(), /DSHBridgeServer/)

  // 3. POST create, list, get, update, generatedScript
  const createRes = await post({
    action: 'create',
    fields: defaultProjectFields({ title: 'API Product Scene', template: 'product-studio' }),
  })
  assert.equal(createRes.status, 200)
  const created = (await createRes.json()).value
  assert.equal(created.revision, 1)

  const listJson = await (await post({ action: 'list' })).json()
  assert.equal(listJson.ok, true)
  assert.equal(listJson.value.projects.length, 1)
  assert.equal(listJson.value.environment.ready, true)

  const updRes = await post({
    action: 'update',
    id: created.id,
    revision: created.revision,
    fields: { title: 'Updated Studio', samples: 48 },
  })
  assert.equal(updRes.status, 200)
  const updated = (await updRes.json()).value
  assert.equal(updated.revision, 2)
  assert.equal(updated.samples, 48)

  // Stale revision update -> 409 CONFLICT
  const staleRes = await post({ action: 'update', id: created.id, revision: 1, fields: { title: 'Stale' } })
  assert.equal(staleRes.status, 409)
  assert.equal((await staleRes.json()).code, 'CONFLICT')

  const genRes = await (await post({ action: 'generatedScript', id: created.id })).json()
  assert.equal(genRes.ok, true)
  assert.match(genRes.value.script, /import bpy/)
  assert.equal(genRes.value.safety.safe, true)

  // 4. Streaming POST /upload + GET ?kind=asset with Range 206 & 416 + GET ?kind=source ZIP
  const uploadRes = await workbench.fetch(
    new Request(`http://dsh.test${workbench.route}/upload`, {
      method: 'POST',
      headers: {
        'x-dsh-blender-studio': '1',
        'x-project-id': created.id,
        'x-project-revision': String(updated.revision),
        'x-file-name': encodeURIComponent('lighting.hdr'),
      },
      body: MOCK_HDR,
    }),
  )
  assert.equal(uploadRes.status, 200)
  const withAsset = (await uploadRes.json()).value
  assert.equal(withAsset.assets.length, 1)
  const asset = withAsset.assets[0]

  const assetRange = await workbench.fetch(
    new Request(`http://dsh.test${workbench.route}?kind=asset&id=${created.id}&asset=${asset.id}`, {
      headers: { range: 'bytes=0-9' },
    }),
  )
  assert.equal(assetRange.status, 206)
  assert.equal(await assetRange.text(), '#?RADIANCE')

  const invalidRange = await workbench.fetch(
    new Request(`http://dsh.test${workbench.route}?kind=asset&id=${created.id}&asset=${asset.id}`, {
      headers: { range: 'bytes=999999-' },
    }),
  )
  assert.equal(invalidRange.status, 416)

  const zipRes = await workbench.fetch(new Request(`http://dsh.test${workbench.route}?kind=source&id=${created.id}`))
  assert.equal(zipRes.status, 200)
  assert.equal(zipRes.headers.get('content-type'), 'application/zip')
  assert.match(zipRes.headers.get('content-disposition') || '', /dsh-blender-studio-/)
  const files = unzipSync(new Uint8Array(await zipRes.arrayBuffer()))
  assert.ok(files['project.json'] && files['scene.py'] && files['README.txt'])
  assert.ok(files[`assets/${asset.file}`])

  // 5. Archive requires confirmed: true, then restore succeeds
  assert.equal((await post({ action: 'archive', id: created.id, revision: withAsset.revision })).status, 400)
  assert.equal(
    (await post({ action: 'archive', id: created.id, revision: withAsset.revision, confirmed: true })).status,
    200,
  )
  assert.equal(
    (await post({ action: 'restore', id: created.id, revision: withAsset.revision, confirmed: true })).status,
    200,
  )
})

test('BlenderWorkbench HTTP API: mock Blender CLI jobs, Range artifact streaming, cancellation, failure recovery, Bridge & Poly Haven', async (t) => {
  const mockBridge = await startMockBridgeServer(t)
  const bridgeClient = new BlenderBridgeClient({ host: '127.0.0.1', port: mockBridge.port })
  const { workbench, post, setBehavior, launchedGuis } = await createWorkbenchFixture(t, { bridge: bridgeClient })

  const proj = (
    await (
      await post({
        action: 'create',
        fields: defaultProjectFields({ title: 'Render Pipeline Test', template: 'motion-data' }),
      })
    ).json()
  ).value

  // 1. preview_still -> PNG artifact with dimensions & sceneSummary
  const stillJob = (await (await post({ action: 'preview_still', id: proj.id, revision: proj.revision })).json()).value
  const stillDone = await workbench.waitForJob(stillJob.id)
  assert.equal(stillDone.state, 'done')
  assert.equal(stillDone.progress, 100)
  assert.equal(stillDone.artifactKind, 'still')
  assert.equal(stillDone.sceneSummary?.objectCount, 6)

  const stillArtRes = await workbench.fetch(
    new Request(`http://dsh.test${workbench.route}?kind=artifact&id=${proj.id}&artifact=${stillDone.artifactId}&download=1`),
  )
  assert.equal(stillArtRes.status, 200)
  assert.equal(stillArtRes.headers.get('content-type'), 'image/png')
  assert.match(stillArtRes.headers.get('content-disposition') || '', /attachment/)

  // 2. contact_sheet + render_animation (Range 206) + export_model (glb) + inspect_scene
  const csDone = await workbench.waitForJob(
    (await (await post({ action: 'contact_sheet', id: proj.id, revision: proj.revision })).json()).value.id,
  )
  assert.equal(csDone.state, 'done')
  assert.equal(csDone.artifactKind, 'contact_sheet')

  const animDone = await workbench.waitForJob(
    (await (await post({ action: 'render_animation', id: proj.id, revision: proj.revision })).json()).value.id,
  )
  assert.equal(animDone.state, 'done')
  const mp4Range = await workbench.fetch(
    new Request(`http://dsh.test${workbench.route}?kind=artifact&id=${proj.id}&artifact=${animDone.artifactId}`, {
      headers: { range: 'bytes=4-7' },
    }),
  )
  assert.equal(mp4Range.status, 206)
  assert.equal(await mp4Range.text(), 'ftyp')

  const glbDone = await workbench.waitForJob(
    (await (await post({ action: 'export_model', id: proj.id, revision: proj.revision, format: 'glb' })).json()).value.id,
  )
  assert.equal(glbDone.state, 'done')
  assert.equal(glbDone.artifactKind, 'glb')

  const inspDone = await workbench.waitForJob(
    (await (await post({ action: 'inspect_scene', id: proj.id, revision: proj.revision })).json()).value.id,
  )
  assert.equal(inspDone.state, 'done')
  assert.equal(inspDone.sceneSummary?.totalPolygons, 512)

  // 3. run_script safety guard & allowUnsafe override
  const unsafeRes = await post({
    action: 'run_script',
    id: proj.id,
    revision: proj.revision,
    code: 'import os\nos.system("echo pwn")',
  })
  assert.equal(unsafeRes.status, 400)
  assert.equal((await unsafeRes.json()).code, 'SCRIPT_UNSAFE')

  const allowedJob = (
    await (
      await post({
        action: 'run_script',
        id: proj.id,
        revision: proj.revision,
        code: 'import os\nos.system("echo safe-override")',
        allowUnsafe: true,
      })
    ).json()
  ).value
  const allowedDone = await workbench.waitForJob(allowedJob.id)
  assert.equal(allowedDone.state, 'done')
  assert.match(allowedDone.scriptOutput || '', /mock-blender-stdout/)

  // 4. Cancellation & single-slot conflict + failure recovery cleanup
  setBehavior('hang')
  const longJob = (await (await post({ action: 'preview_still', id: proj.id, revision: proj.revision })).json()).value
  const conflictRes = await post({ action: 'preview_still', id: proj.id, revision: proj.revision })
  assert.equal(conflictRes.status, 409)
  assert.equal((await conflictRes.json()).code, 'JOB_CONFLICT')

  const cancelRes = await post({ action: 'cancel', job: longJob.id })
  assert.equal(cancelRes.status, 200)
  const cancelled = await workbench.waitForJob(longJob.id)
  assert.equal(cancelled.state, 'cancelled')

  setBehavior('fail')
  const failJob = (await (await post({ action: 'preview_still', id: proj.id, revision: proj.revision })).json()).value
  const failed = await workbench.waitForJob(failJob.id)
  assert.equal(failed.state, 'failed')
  assert.equal(failed.artifactId, undefined)
  await assert.rejects(stat(join(await workbench.store.path(proj.id), 'runs', failJob.id)), /ENOENT/)

  // 5. Recovery after failure: open_gui builds .blend and launches GUI
  setBehavior('succeed')
  const guiRes = await (await post({ action: 'open_gui', id: proj.id, revision: proj.revision })).json()
  assert.equal(guiRes.ok, true)
  assert.equal(guiRes.value.launched, true)
  assert.equal(guiRes.value.built, true)
  assert.equal(launchedGuis.length, 1)

  // 6. Live Bridge HTTP endpoints
  assert.equal((await (await post({ action: 'bridge_status' })).json()).value.connected, true)
  assert.equal((await (await post({ action: 'bridge_scene' })).json()).value.objectCount, 6)
  assert.equal(
    (await (await post({ action: 'bridge_execute', code: 'import bpy\nprint(1)' })).json()).value.stdout,
    'bridge-exec-ok',
  )
  assert.equal((await (await post({ action: 'bridge_viewport', width: 640, height: 360 })).json()).value.width, 640)
  assert.equal((await (await post({ action: 'bridge_sync', id: proj.id })).json()).value.projectId, proj.id)

  // 7. Poly Haven disabled by default -> 403; enabled via configure -> search + import succeeds
  assert.equal((await post({ action: 'polyhaven_search', query: 'studio', type: 'hdris' })).status, 403)
  assert.equal((await post({ action: 'configure', polyHavenEnabled: true })).status, 200)
  const phSearch = await (await post({ action: 'polyhaven_search', query: 'studio', type: 'hdris' })).json()
  assert.equal(phSearch.value.items.length, 1)
  const phImport = await (
    await post({
      action: 'polyhaven_import',
      id: proj.id,
      revision: proj.revision,
      assetId: 'studio_small_09',
      assetType: 'hdris',
      resolution: '1k',
    })
  ).json()
  assert.equal(phImport.ok, true)
  assert.equal(phImport.value.asset.kind, 'hdri')
  assert.equal(phImport.value.asset.source, 'polyhaven')
})

test('all 6 Agent tools register cleanly, execute end-to-end, render human-readable outputs, and dispose cleanly', async (t) => {
  const mockBridge = await startMockBridgeServer(t)
  const bridgeClient = new BlenderBridgeClient({ host: '127.0.0.1', port: mockBridge.port })
  const { workbench } = await createWorkbenchFixture(t, { bridge: bridgeClient })

  const tools = new Map()
  const routes = []
  const disposers = []

  const ctx = {
    skills: { register: () => () => {} },
    tools: {
      register(def) {
        assert.ok(def.output?.schema && typeof def.output.render === 'function', `${def.name} requires structured output + renderer`)
        tools.set(def.name, def)
        return () => tools.delete(def.name)
      },
    },
    connection: {
      fetch: {
        register(route) {
          routes.push(route)
          return () => routes.splice(routes.indexOf(route), 1)
        },
      },
    },
    inject(_deps, fn) {
      fn(ctx)
    },
    on(event, fn) {
      if (event === 'dispose') disposers.push(fn)
    },
  }

  installBlenderWorkbench(ctx, {
    workbench,
    checkSkillsHealth: async () => ({
      ok: true,
      plugin: 'dsh-blender-studio',
      skills: [{ name: 'blender-bpy-scripting', ok: true, code: 'ready', detail: 'ok', file: 'SKILL.md', fileOk: true, registered: true, registryChecked: true, reloadRequired: false }],
    }),
  })

  assert.deepEqual(
    [...tools.keys()],
    ['blender_health', 'blender_project', 'blender_render', 'blender_script', 'blender_bridge', 'blender_assets'],
  )
  assert.equal(routes.length, 2)

  // 1. blender_health
  const healthTool = tools.get('blender_health')
  const healthVal = await healthTool.execute({})
  assert.equal(healthVal.ok, true)
  assert.equal(healthVal.blenderReady, true)
  assert.equal(healthVal.bridgeConnected, true)
  assert.match(healthTool.output.render({}, healthVal)[0].text, /4\.3\.2/)

  // 2. blender_project (create, list, update_script, inspect_scene)
  const projTool = tools.get('blender_project')
  const created = await projTool.execute({
    action: 'create',
    fields: { title: 'Agent Created Scene', template: 'logo-3d', headline: 'AI 3D' },
  })
  assert.equal(created.revision, 1)
  assert.match(projTool.output.render({}, created)[0].text, /Agent Created Scene/)

  const withScript = await projTool.execute({
    action: 'update_script',
    id: created.id,
    revision: created.revision,
    scriptMode: 'custom',
    customScript: 'import bpy\nprint("agent-script")',
  })
  assert.equal(withScript.revision, 2)
  assert.equal(withScript.safety.safe, true)
  assert.match(projTool.output.render({}, withScript)[0].text, /通过/)

  const listed = await projTool.execute({ action: 'list' })
  assert.equal(listed.projects.length, 1)
  assert.match(projTool.output.render({}, listed)[0].text, new RegExp(created.id))

  // 3. blender_render (preview_still -> job -> artifactPath)
  const renderTool = tools.get('blender_render')
  const started = await renderTool.execute({ action: 'preview_still', id: created.id, revision: withScript.revision })
  assert.match(renderTool.output.render({}, started)[0].text, new RegExp(started.id))
  await workbench.waitForJob(started.id)
  const polled = await renderTool.execute({ action: 'job', job: started.id })
  assert.equal(polled.state, 'done')
  assert.ok(polled.artifactPath, 'completed job returns resolved artifactPath')
  assert.match(renderTool.output.render({}, polled)[0].text, /render\.png/)

  // 4. blender_script (validate, run_headless, run_bridge)
  const scriptTool = tools.get('blender_script')
  const badCheck = await scriptTool.execute({ action: 'validate', code: 'import subprocess\nsubprocess.run(["id"])' })
  assert.equal(badCheck.safe, false)
  assert.match(scriptTool.output.render({}, badCheck)[0].text, /subprocess/)

  const headlessRun = await scriptTool.execute({
    action: 'run_headless',
    id: created.id,
    revision: withScript.revision,
    code: 'import bpy\nprint("hello-headless")',
  })
  const headlessDone = await workbench.waitForJob(headlessRun.id)
  assert.equal(headlessDone.state, 'done')
  assert.match(scriptTool.output.render({}, headlessDone)[0].text, /mock-blender-stdout/)

  const bridgeRun = await scriptTool.execute({ action: 'run_bridge', code: 'import bpy\nprint("hello-bridge")' })
  assert.equal(bridgeRun.stdout, 'bridge-exec-ok')
  assert.match(scriptTool.output.render({}, bridgeRun)[0].text, /bridge-exec-ok/)

  // 5. blender_bridge (status, get_addon_info, scene_info, viewport_capture, sync_project, open_gui)
  const bridgeTool = tools.get('blender_bridge')
  const addonInfo = await bridgeTool.execute({ action: 'get_addon_info' })
  assert.match(addonInfo.downloadUrl, /\?kind=addon$/)
  assert.match(bridgeTool.output.render({}, addonInfo)[0].text, /dsh_blender_bridge\.py/)

  const vp = await bridgeTool.execute({ action: 'viewport_capture', width: 640, height: 360 })
  assert.equal(vp.mime, 'image/png')
  assert.match(bridgeTool.output.render({}, vp)[0].text, /640×360/)

  const synced = await bridgeTool.execute({ action: 'sync_project', id: created.id })
  assert.equal(synced.projectId, created.id)
  assert.match(bridgeTool.output.render({}, synced)[0].text, /已同步/)

  const gui = await bridgeTool.execute({ action: 'open_gui', id: created.id, revision: withScript.revision })
  assert.equal(gui.launched, true)
  assert.match(bridgeTool.output.render({}, gui)[0].text, /4242/)

  // 6. blender_assets (enable Poly Haven -> search_polyhaven -> import_polyhaven -> list -> remove)
  await workbench.configureSettings({ polyHavenEnabled: true })
  const assetsTool = tools.get('blender_assets')
  const found = await assetsTool.execute({ action: 'search_polyhaven', query: 'studio', type: 'hdris' })
  assert.equal(found.items.length, 1)
  assert.match(assetsTool.output.render({}, found)[0].text, /studio_small_09/)

  const imported = await assetsTool.execute({
    action: 'import_polyhaven',
    id: created.id,
    revision: withScript.revision,
    assetId: 'studio_small_09',
    assetType: 'hdris',
  })
  assert.equal(imported.asset.kind, 'hdri')
  assert.match(assetsTool.output.render({}, imported)[0].text, /Studio|studio_small_09/i)

  const assetList = await assetsTool.execute({ action: 'list', id: created.id })
  assert.equal(assetList.assets.length, 1)
  assert.match(assetsTool.output.render({}, assetList)[0].text, /1 个/)

  const afterRemove = await assetsTool.execute({
    action: 'remove',
    id: created.id,
    revision: imported.project.revision,
    asset: imported.asset.id,
  })
  assert.equal(afterRemove.assets.length, 0)

  // Disposal removes all 6 tools and both HTTP routes
  for (const fn of disposers) fn()
  assert.equal(tools.size, 0)
  assert.equal(routes.length, 0)
})

test('v0.2.0 HTTP API & Agent tools: duplicate, script checkpoints, 512 KB POST cap, chained pipeline (qualityTier + abortOnQcError), and QC-3D output.render', async (t) => {
  const mockBridge = await startMockBridgeServer(t)
  const bridgeClient = new BlenderBridgeClient({ host: '127.0.0.1', port: mockBridge.port })
  const { workbench, post, seenScripts, setSceneSummary } = await createWorkbenchFixture(t, { bridge: bridgeClient })

  // 1. Create + large 200 KB customScript saved via 512 KB POST JSON cap
  const largeScript = 'import bpy\n# ' + 'A'.repeat(200 * 1024) + '\nprint("large-v1")\n'
  const createRes = await post({
    action: 'create',
    fields: defaultProjectFields({
      title: 'Turbofan Masterpiece',
      template: 'procedural-abstract',
      engine: 'EEVEE',
      samples: 32,
      scriptMode: 'custom',
      customScript: largeScript,
    }),
  })
  assert.equal(createRes.status, 200, '200 KB customScript must fit within 512 KB POST body cap')
  const created = (await createRes.json()).value

  // 2. Duplicate via HTTP action
  const dupRes = await post({ action: 'duplicate', id: created.id, title: 'Turbofan Clone' })
  assert.equal(dupRes.status, 200)
  const dup = (await dupRes.json()).value
  assert.notEqual(dup.id, created.id)
  assert.equal(dup.title, 'Turbofan Clone')

  // 3. Checkpoints via HTTP actions (save_checkpoint + update + restore_checkpoint)
  const cpSavedRes = await post({
    action: 'save_checkpoint',
    id: created.id,
    revision: created.revision,
    note: 'Baseline v1',
  })
  assert.equal(cpSavedRes.status, 200)
  const afterSaveCp = (await cpSavedRes.json()).value
  const baselineCp = afterSaveCp.checkpoints.find((c) => c.note === 'Baseline v1')
  assert.ok(baselineCp)

  const editedRes = await post({
    action: 'update',
    id: created.id,
    revision: afterSaveCp.revision,
    fields: { customScript: 'import bpy\nprint("large-v2")\n' },
  })
  assert.equal(editedRes.status, 200)
  const afterEdit = (await editedRes.json()).value
  assert.match(afterEdit.customScript, /large-v2/)

  const restoredRes = await post({
    action: 'restore_checkpoint',
    id: created.id,
    revision: afterEdit.revision,
    checkpointId: baselineCp.id,
  })
  assert.equal(restoredRes.status, 200)
  const afterRestore = (await restoredRes.json()).value
  assert.match(afterRestore.customScript, /large-v1/)

  // 4. Chained 4-stage pipeline with qualityTier: 'beauty' (must NOT mutate saved EEVEE/32 fields)
  seenScripts.length = 0
  const pipeStart = await post({
    action: 'pipeline',
    id: created.id,
    revision: afterRestore.revision,
    includeContactSheet: true,
    renderKind: 'still',
    exportFormat: 'glb',
    qualityTier: 'beauty',
    abortOnQcError: true,
  })
  assert.equal(pipeStart.status, 200)
  const pipeJob = (await pipeStart.json()).value
  assert.equal(pipeJob.kind, 'pipeline')
  const pipeDone = await workbench.waitForJob(pipeJob.id)
  assert.equal(pipeDone.state, 'done')
  assert.equal(Boolean(pipeDone.pipeline?.stoppedEarly), false)
  assert.equal(pipeDone.pipeline?.qc?.score, 96)
  assert.equal(pipeDone.pipeline?.qc?.grade, 'A')
  assert.ok(pipeDone.pipeline?.contactSheetId, 'pipeline produced contact_sheet artifact')
  assert.ok(pipeDone.pipeline?.primaryRenderId, 'pipeline produced primary still artifact')
  assert.ok(pipeDone.pipeline?.modelArtifactId, 'pipeline produced GLB model artifact')
  assert.equal(pipeDone.pipeline?.artifactIds.length, 3)

  // Verify non-mutating qualityTier override (beauty ran CYCLES 64 spp, saved project remains EEVEE 32)
  assert.ok(seenScripts.some((s) => s.includes('"CYCLES"') || s.includes('CYCLES')), 'beauty tier ran CYCLES')
  const latestProj = await workbench.store.get(created.id)
  assert.equal(latestProj.engine, 'EEVEE', 'pipeline qualityTier must not mutate saved engine')
  assert.equal(latestProj.samples, 32, 'pipeline qualityTier must not mutate saved samples')

  // 5. Pipeline abortOnQcError: true stops early cleanly when inspect_scene returns QC error
  setSceneSummary(MOCK_BAD_QC_SUMMARY)
  const abortStart = await post({
    action: 'pipeline',
    id: created.id,
    revision: latestProj.revision,
    includeContactSheet: true,
    renderKind: 'still',
    exportFormat: 'glb',
    abortOnQcError: true,
  })
  assert.equal(abortStart.status, 200)
  const abortDone = await workbench.waitForJob((await abortStart.json()).value.id)
  assert.equal(abortDone.state, 'done')
  assert.equal(abortDone.pipeline?.stoppedEarly, true)
  assert.equal(abortDone.pipeline?.artifactIds.length, 0)
  assert.equal(abortDone.pipeline?.qc?.grade, 'D')
  assert.match(abortDone.pipeline?.stopReason || '', /NO_CAMERA|QC-3D|错误|error/i)

  // 6. Agent tools v0.2.0: QC-3D output.render across blender_project, blender_render (pipeline), blender_script, blender_bridge
  setSceneSummary(MOCK_SCENE_SUMMARY)
  const tools = new Map()
  const ctx = {
    skills: { register: () => () => {} },
    tools: { register(def) { tools.set(def.name, def); return () => tools.delete(def.name) } },
    connection: { fetch: { register: () => () => {} } },
    inject(_d, fn) { fn(ctx) },
    on() {},
  }
  installBlenderWorkbench(ctx, { workbench })

  const projTool = tools.get('blender_project')
  const dupToolRes = await projTool.execute({ action: 'duplicate', id: created.id, title: 'Tool Duplicated' })
  assert.equal(dupToolRes.title, 'Tool Duplicated')
  const cpToolRes = await projTool.execute({ action: 'save_checkpoint', id: dupToolRes.id, revision: dupToolRes.revision, note: 'Tool CP' })
  assert.ok(cpToolRes.checkpoints.some((c) => c.note === 'Tool CP'))

  const renderTool = tools.get('blender_render')
  const toolPipeStart = await renderTool.execute({
    action: 'pipeline',
    id: created.id,
    revision: latestProj.revision,
    qualityTier: 'draft',
    includeContactSheet: true,
    renderKind: 'still',
    exportFormat: 'glb',
  })
  await workbench.waitForJob(toolPipeStart.id)
  const toolPipePolled = await renderTool.execute({ action: 'job', job: toolPipeStart.id })
  const toolPipeText = renderTool.output.render({}, toolPipePolled)[0].text
  assert.match(toolPipeText, /QC-3D/)
  assert.match(toolPipeText, /96\/100/)

  const bridgeTool = tools.get('blender_bridge')
  const liveScene = await bridgeTool.execute({ action: 'scene_info' })
  const bridgeSceneText = bridgeTool.output.render({}, liveScene)[0].text
  assert.match(bridgeSceneText, /QC-3D/)
  assert.match(bridgeSceneText, /96\/100/)

  const scriptTool = tools.get('blender_script')
  const scriptRun = await scriptTool.execute({ action: 'run_bridge', code: 'import bpy\nprint("qc")' })
  const scriptRunText = scriptTool.output.render({}, scriptRun)[0].text
  assert.match(scriptRunText, /QC-3D/)
})

test('BlenderWorkbench trash action moves archived/active projects to Recycle Bin with confirmation, revision & running-job guards, and stale folders return 404 PROJECT_NOT_FOUND', async (t) => {
  const trashed = []
  const trashPath = async (targetPath) => {
    trashed.push(targetPath)
    await rm(targetPath, { recursive: true, force: true })
    return { moved: true }
  }
  const { workbench, post, setBehavior } = await createWorkbenchFixture(t, { trashPath })
  const p1 = (await (await post({ action: 'create', fields: defaultProjectFields({ title: 'Archived 3D Scene' }) })).json()).value
  const p2 = (await (await post({ action: 'create', fields: defaultProjectFields({ title: 'Active 3D Scene' }) })).json()).value
  const p3 = (await (await post({ action: 'create', fields: defaultProjectFields({ title: 'Externally Deleted Scene' }) })).json()).value

  assert.equal((await post({ action: 'archive', id: p1.id, revision: p1.revision, confirmed: true })).status, 200)

  // Reject unconfirmed, wrong revision, invalid id
  assert.equal((await post({ action: 'trash', id: p1.id, revision: p1.revision, archived: true })).status, 400)
  assert.equal((await post({ action: 'trash', id: p1.id, revision: p1.revision + 1, archived: true, confirmed: true })).status, 409)
  assert.equal((await post({ action: 'trash', id: '../../outside', revision: 1, archived: true, confirmed: true })).status, 400)
  assert.equal(trashed.length, 0)

  // Archived project trash succeeds
  const archivedDir = await workbench.store.path(p1.id, true)
  const res1 = await post({ action: 'trash', id: p1.id, revision: p1.revision, archived: true, confirmed: true })
  assert.equal(res1.status, 200)
  assert.deepEqual(trashed, [archivedDir])
  assert.equal((await workbench.store.list(true)).length, 0)

  // Blocked while a Blender job is running, succeeds after cancellation
  setBehavior('hang')
  const runningJob = (await (await post({ action: 'preview_still', id: p2.id, revision: p2.revision })).json()).value
  const blocked = await post({ action: 'trash', id: p2.id, revision: p2.revision, archived: false, confirmed: true })
  assert.equal(blocked.status, 409)
  workbench.cancelJob(runningJob.id)
  await workbench.waitForJob(runningJob.id)

  const activeDir = await workbench.store.path(p2.id, false)
  const res2 = await post({ action: 'trash', id: p2.id, revision: p2.revision, archived: false, confirmed: true })
  assert.equal(res2.status, 200)
  assert.equal(trashed.at(-1), activeDir)

  // Externally deleted project vanishes from list and returns 404 PROJECT_NOT_FOUND on stale open/trash
  const goneDir = await workbench.store.path(p3.id, false)
  await rm(goneDir, { recursive: true, force: true })
  const staleGet = await post({ action: 'get', id: p3.id })
  assert.equal(staleGet.status, 404)
  assert.equal((await staleGet.json()).code, 'PROJECT_NOT_FOUND')
  const staleTrash = await post({ action: 'trash', id: p3.id, revision: p3.revision, archived: false, confirmed: true })
  assert.equal(staleTrash.status, 404)
  const listed = await (await post({ action: 'list' })).json()
  assert.deepEqual(listed.value.projects, [])
  assert.equal(listed.value.corruptedCount, undefined)
})
