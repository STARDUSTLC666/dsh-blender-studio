import assert from 'node:assert/strict'
import { createServer as createTcpServer } from 'node:net'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import {
  BlenderWorkbench,
  BUILTIN_WORKFLOW_RECIPES,
  formatBlenderFailureDiagnostic,
  generateRunnerHarness,
  generateSceneScript,
  installBlenderWorkbench,
  isCyclesGpuCrashError,
  toLosslessJson,
  validateWorkflowReplayOverrides,
  validateWorkflowStep,
} from '../lib/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLIENT_BUNDLE = join(__dirname, '..', 'lib', 'client.js')

const VALID_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0xf3, 0xff, 0x61,
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
  0xae, 0x42, 0x60, 0x82,
])
const VALID_GLB = Buffer.concat([Buffer.from('glTF'), Buffer.alloc(32, 0)])

// Mirror DeepSeek Harness @deepseek-ai/dsh-util-values lossless JSON contract strictly
function assertLosslessJson(value, path = 'root') {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} must be finite number`)
    assert.ok(!Object.is(value, -0), `${path} must not be -0`)
    return
  }
  assert.equal(typeof value, 'object', `${path} must be JSON value, got ${typeof value}`)
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      assert.ok(i in value, `${path}[${i}] must not be sparse`)
      assertLosslessJson(value[i], `${path}[${i}]`)
    }
    return
  }
  const proto = Object.getPrototypeOf(value)
  assert.ok(proto === Object.prototype || proto === null, `${path} must be plain object`)
  for (const key of Reflect.ownKeys(value)) {
    assert.equal(typeof key, 'string', `${path} has non-string key`)
    assert.notEqual(value[key], undefined, `${path}.${key} must not be undefined`)
    assertLosslessJson(value[key], `${path}.${key}`)
  }
}

async function createTempDir(prefix) {
  return mkdtemp(join(tmpdir(), prefix))
}

test('toLosslessJson sanitizes undefined, -0, NaN/Infinity, sparse arrays, and cyclic refs strictly for DSH runtime', () => {
  const cyclic = { a: 1 }
  cyclic.self = cyclic
  const input = {
    ok: true,
    negZero: -0,
    nanVal: Number.NaN,
    infVal: Number.POSITIVE_INFINITY,
    undefKey: undefined,
    nested: { keep: 'yes', drop: undefined, fn: () => {} },
    arr: [1, undefined, -0, Number.NaN],
    big: 42n,
    cyclic,
  }
  const cleaned = toLosslessJson(input)
  assertLosslessJson(cleaned)
  assert.equal('undefKey' in cleaned, false)
  assert.equal('drop' in cleaned.nested, false)
  assert.equal('fn' in cleaned.nested, false)
  assert.equal(Object.is(cleaned.negZero, 0), true)
  assert.equal(cleaned.nanVal, null)
  assert.equal(cleaned.infVal, null)
  assert.deepEqual(cleaned.arr, [1, null, 0, null])
  assert.equal(cleaned.big, '42')
  assert.equal(cleaned.cyclic.self, null)
})

test('formatBlenderFailureDiagnostic preserves full Python tracebacks and maps run.py line numbers to customScript lines', () => {
  const fakeScript = [
    '# preamble line 1',
    '# preamble line 2',
    '# --- Custom bpy Script ---',
    'import bpy',
    'parts = {}',
    'print(parts["CAM_Body_Leather"])',
  ].join('\n')
  const logLines = [
    'Blender 5.3.0',
    'Traceback (most recent call last):',
    '  File "C:\\tmp\\run.py", line 6, in <module>',
    '    print(parts["CAM_Body_Leather"])',
    '          ~~~~~^^^^^^^^^^^^^^^^^^^^',
    "KeyError: 'CAM_Body_Leather'",
    'Blender quit',
  ]
  const diag = formatBlenderFailureDiagnostic(logLines, fakeScript)
  assert.match(diag, /Traceback \(most recent call last\):/)
  assert.match(diag, /line 6, in <module>/)
  assert.match(diag, /KeyError: 'CAM_Body_Leather'/)
  assert.match(diag, /customScript 第 3 行（run\.py L6）: print\(parts\["CAM_Body_Leather"\]\)/)
})

test('product-scale framing fixes & scale-aware dsh_setup_hero_studio remove 3.8m/0.95m/0.5m distance floors', () => {
  const project = {
    id: '11111111-1111-4111-8111-111111111111',
    revision: 1,
    created: '2026-11-27T00:00:00.000Z',
    updated: '2026-11-27T00:00:00.000Z',
    template: 'product-studio',
    title: 'Macro Camera Test',
    description: '',
    headline: 'M-1',
    engine: 'CYCLES',
    samples: 32,
    aspect: 'landscape',
    resolutionScale: 100,
    fps: 24,
    frameStart: 1,
    frameEnd: 24,
    cameraPreset: 'three_quarter',
    lightingPreset: 'dramatic_rim',
    materialPreset: 'brushed_metal',
    accentColor: '#B91C1C',
    transparentBg: false,
    lensMm: 50,
    exposure: 0,
    clayMode: false,
    scriptMode: 'custom',
    customScript: 'dsh_setup_hero_studio("dark_cyclorama", "#B91C1C", scale=0.1)\n',
    assets: [],
    artifacts: [],
  }
  const scenePy = generateSceneScript(project, './assets', { computeDevice: 'cpu' })
  assert.match(scenePy, /def dsh_setup_hero_studio\(style="dark_cyclorama", accent_color="#4176e6", scale=1\.0\):/)
  assert.match(scenePy, /dsh_set_bsdf\(cbsdf, \["Coat Weight", "Clearcoat"\], 0\.0\)/)
  assert.match(scenePy, /top_light\.data\.shape = "DISK"/)
  assert.match(scenePy, /radius = max\(0\.01, 0\.5 \* math\.sqrt/)
  assert.match(scenePy, /clip_start = max\(0\.001, min\(0\.05, radius \* 0\.02\)\)/)
  assert.match(scenePy, /str\(DSH_PROJECT\.get\("computeDevice", "auto"\)\)\.strip\(\)\.lower\(\) == "cpu"/)

  const csPy = generateRunnerHarness('contact_sheet', {
    project,
    assetsDir: './assets',
    outputPath: './contact_sheet.png',
    enforceRenderProfile: true,
  })
  assert.match(csPy, /bounding_radius = max\(0\.01, 0\.5 \* math\.sqrt/)
  assert.doesNotMatch(csPy, /max\(bounding_radius \* 2\.75 \* fov_scale, 3\.8\)/)
  assert.match(csPy, /qc_cam_data\.clip_start = max\(0\.001, min\(0\.05, bounding_radius \* 0\.02\)\)/)
  assert.match(csPy, /\\"enforceRenderProfile\\":true/)
  assert.match(csPy, /def dsh_enforce_render_profile\(scene\):/)
})

test('Cycles GPU crash automatically falls back to CPU under computeDevice=auto, while qualityTier applies to preview_still & contact_sheet', async () => {
  const dir = await createTempDir('dsh-bl-gpu-fb-')
  try {
    const fakeExe = join(dir, 'blender-fake.exe')
    await writeFile(fakeExe, 'fake')
    const calls = []
    const workbench = new BlenderWorkbench({
      root: dir,
      skipSystemScan: true,
      extraCandidates: [{ path: fakeExe, source: 'config' }],
      prober: async () => ({ ok: true, stdout: 'Blender 5.3.0\n' }),
      gpuProber: async () => ({ available: true, backend: 'OPTIX', devices: ['RTX 4060'] }),
      executor: async req => {
        const script = req.scriptContent || ''
        const isCpu = script.includes('\\"computeDevice\\":\\"cpu\\"')
        const isEevee = script.includes('\\"engine\\":\\"EEVEE\\"')
        calls.push({ isCpu, isEevee, scriptPath: req.scriptPath })
        if (!isCpu && !isEevee && calls.length === 1) {
          throw new Error('RuntimeError: Error: Illegal address in CUDA queue copy_from_device (integrator_shade_surface)')
        }
        const outMatch = /_dsh_out = ("[^"]+")|_dsh_render_contact_sheet\(("[^"]+")/.exec(script)
        const outPath = outMatch ? JSON.parse(outMatch[1] || outMatch[2]) : ''
        if (outPath) await writeFile(outPath, VALID_PNG)
        return {
          exitCode: 0,
          lines: ['ok'],
          stdout: 'ok',
          stderr: '',
          savedFiles: outPath ? [outPath] : [],
          durationMs: 25,
          sceneSummary: {
            capturedAt: new Date().toISOString(),
            blenderVersion: '5.3.0',
            engine: isEevee ? 'BLENDER_EEVEE' : 'CYCLES',
            objectCount: 3,
            meshCount: 2,
            lightCount: 1,
            cameraCount: 1,
            totalPolygons: 640,
            activeCamera: 'CAM_Hero',
            materials: ['Mat_Hero'],
            collections: ['DSH_Hero'],
            objects: [
              { name: 'Studio_Cyclorama_Floor', type: 'MESH', location: [0, 0, -0.05], dimensions: [24, 24, 0.1] },
              { name: 'CAM_Body', type: 'MESH', location: [0, 0, 0.08], dimensions: [0.18, 0.16, 0.15] },
            ],
            qc: { score: 100, grade: 'A', issues: [] },
          },
        }
      },
    })

    assert.equal(isCyclesGpuCrashError(new Error('Illegal address in CUDA queue copy_from_device')), true)
    assert.equal(isCyclesGpuCrashError(new Error("KeyError: 'CAM_Body'")), false)

    const tools = new Map()
    installBlenderWorkbench(
      {
        tools: { register: def => { tools.set(def.name, def); return () => tools.delete(def.name) } },
        connection: { fetch: { register: () => () => {} } },
      },
      { workbench },
    )

    // Create a CYCLES project
    const created = await tools.get('blender_project').execute({
      action: 'create',
      fields: { title: 'Camera Fallback Test', engine: 'CYCLES', samples: 64, scriptMode: 'custom', customScript: 'import bpy\nprint("hi")\n' },
    })
    assertLosslessJson(created)

    // 1. preview_still under CYCLES auto fails first on GPU -> auto-retries on CPU -> succeeds!
    const stillJob = await tools.get('blender_render').execute({
      action: 'preview_still',
      id: created.id,
      revision: created.revision,
      wait: true,
    })
    assertLosslessJson(stillJob)
    assert.equal(stillJob.state, 'done')
    assert.equal(calls.length, 2)
    assert.equal(calls[0].isCpu, false)
    assert.equal(calls[1].isCpu, true)
    const renderedText = tools.get('blender_render').output.render({}, stillJob)[0].text
    assert.match(renderedText, /read_image/)
    // Hero-only bounds exclude 24m Studio_Cyclorama_Floor!
    assert.match(renderedText, /主体包围尺寸（估算）：X 0\.18m × Y 0\.16m × Z 0\.15m/)

    // 2. contact_sheet with qualityTier='draft' actually uses EEVEE 16spp 50% (not CYCLES!)
    const csJob = await tools.get('blender_render').execute({
      action: 'contact_sheet',
      id: created.id,
      revision: created.revision,
      qualityTier: 'draft',
      wait: true,
    })
    assertLosslessJson(csJob)
    assert.equal(csJob.state, 'done')
    assert.equal(calls[2].isEevee, true)

    workbench.dispose()
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('Agent ergonomics (get_exemplar, blender_script read) + complete Workflow Recording, Recipes, Export/Import & Replay end-to-end', async () => {
  const dir = await createTempDir('dsh-bl-wf-')
  try {
    const fakeExe = join(dir, 'blender-fake.exe')
    await writeFile(fakeExe, 'fake')
    const executedScripts = []
    const workbench = new BlenderWorkbench({
      root: dir,
      skipSystemScan: true,
      extraCandidates: [{ path: fakeExe, source: 'config' }],
      prober: async () => ({ ok: true, stdout: 'Blender 5.3.0\n' }),
      gpuProber: async () => ({ available: false, backend: 'CPU', devices: [] }),
      executor: async req => {
        const script = req.scriptContent || ''
        executedScripts.push(script)
        const outMatch = /_dsh_out = ("[^"]+")|_dsh_render_contact_sheet\(("[^"]+")|_dsh_render_multi_shots\(("[^"]+")/.exec(script)
        if (outMatch?.[3]) {
          const outDir = JSON.parse(outMatch[3])
          for (const s of ['hero_3q', 'low_dramatic', 'macro_dof', 'side_profile', 'top_plan']) {
            if (script.includes(`\\"${s}\\"`) || script.includes(`"${s}"`)) {
              await writeFile(join(outDir, `shot_${s}.png`), VALID_PNG)
            }
          }
        } else if (outMatch) {
          const outPath = JSON.parse(outMatch[1] || outMatch[2])
          await writeFile(outPath, outPath.endsWith('.glb') ? VALID_GLB : VALID_PNG)
        }
        return {
          exitCode: 0,
          lines: ['ok'],
          stdout: 'ok',
          stderr: '',
          savedFiles: [],
          durationMs: 18,
          sceneSummary: {
            capturedAt: new Date().toISOString(),
            blenderVersion: '5.3.0',
            engine: 'BLENDER_EEVEE',
            objectCount: 4,
            meshCount: 2,
            lightCount: 1,
            cameraCount: 1,
            totalPolygons: 1200,
            activeCamera: 'CAM_Main',
            materials: ['Mat_Main'],
            collections: ['DSH_Hero'],
            objects: [{ name: 'Hero_Obj', type: 'MESH', location: [0, 0, 0.5], dimensions: [1, 1, 1] }],
            qc: { score: 98, grade: 'A', issues: [] },
          },
        }
      },
    })

    const tools = new Map()
    installBlenderWorkbench(
      {
        tools: { register: def => { tools.set(def.name, def); return () => tools.delete(def.name) } },
        connection: { fetch: { register: () => () => {} } },
      },
      { workbench },
    )

    // 1. All 7 tools including blender_workflow & blender_health return lossless JSON
    const health = await tools.get('blender_health').execute({})
    assertLosslessJson(health)
    assert.equal(health.blenderReady, true)

    // 2. Read-only get_exemplar + seamless slug fallback on `get`
    const ex1 = await tools.get('blender_project').execute({ action: 'get_exemplar', exemplarId: 'chronograph-tourbillon-watch' })
    assertLosslessJson(ex1)
    assert.ok(ex1.script.length > 5000)
    const exText = tools.get('blender_project').output.render({}, ex1)[0].text
    assert.match(exText, /CHRONO-X1/)
    assert.match(exText, /脚本 \d+ 行 \/ \d+ chars/)

    const ex2 = await tools.get('blender_project').execute({ action: 'get', id: 'chronograph-tourbillon-watch' })
    assertLosslessJson(ex2)
    assert.equal(ex2.id, 'chronograph-tourbillon-watch')

    // 3. Create project, update lookdev twice, patch script, inspect & render -> all recorded automatically!
    const p1 = await tools.get('blender_project').execute({
      action: 'create',
      fields: {
        title: 'Workflow Source Project',
        engine: 'EEVEE',
        samples: 16,
        scriptMode: 'custom',
        customScript: 'import bpy\nCOLOR = "#112233"\nEXPOSURE = 0.0\nprint(COLOR, EXPOSURE)\n',
      },
    })
    assertLosslessJson(p1)
    const p1Text = tools.get('blender_project').output.render({}, p1)[0].text
    assert.match(p1Text, /当前修订号 revision：1/)
    assert.match(p1Text, /Lookdev：accentColor=.*clayMode=false/)

    // Read script by line range and by pattern
    const readRange = await tools.get('blender_script').execute({ action: 'read', id: p1.id, startLine: 2, endLine: 4 })
    assertLosslessJson(readRange)
    assert.match(readRange.content, /2: COLOR = "#112233"/)
    const readPattern = await tools.get('blender_script').execute({ action: 'read', id: p1.id, pattern: 'EXPOSURE' })
    assertLosslessJson(readPattern)
    assert.equal(readPattern.matches.length, 2)

    const p2 = await tools.get('blender_project').execute({
      action: 'update',
      id: p1.id,
      revision: p1.revision,
      fields: { accentColor: '#E11D48', lensMm: 75 },
    })
    const p3 = await tools.get('blender_project').execute({
      action: 'update',
      id: p1.id,
      revision: p2.revision,
      fields: { exposure: 0.4 },
    })
    const p4 = await tools.get('blender_script').execute({
      action: 'patch',
      id: p1.id,
      revision: p3.revision,
      find: 'EXPOSURE = 0.0',
      replace: 'EXPOSURE = 0.4',
      note: 'Raise script exposure',
    })
    const insp = await tools.get('blender_project').execute({
      action: 'inspect_scene',
      id: p1.id,
      revision: p4.revision,
      wait: true,
    })
    assertLosslessJson(insp)
    const exp = await tools.get('blender_render').execute({
      action: 'export_model',
      id: p1.id,
      revision: p4.revision,
      format: 'glb',
      wait: true,
    })
    assertLosslessJson(exp)

    // 4. Inspect recorded workflow history
    const wfTool = tools.get('blender_workflow')
    const hist = await wfTool.execute({ action: 'history', id: p1.id })
    assertLosslessJson(hist)
    assert.equal(hist.recordingEnabled, true)
    assert.deepEqual(
      hist.events.map(e => e.kind),
      ['project_init', 'lookdev_update', 'lookdev_update', 'script_patch', 'inspect_scene', 'export_model'],
    )
    assert.match(wfTool.output.render({}, hist)[0].text, /录制历史/)

    // 5. Save reusable recipe from history (with coalesceLookdev: true -> merges the 2 lookdev updates into 1!)
    const saved = await wfTool.execute({
      action: 'save_from_history',
      id: p1.id,
      name: 'My Reusable Lookdev & GLB Flow',
      coalesceLookdev: true,
      includeScriptPatches: true,
    })
    assertLosslessJson(saved)
    assert.deepEqual(
      saved.recipe.steps.map(s => s.kind),
      ['lookdev_update', 'script_patch', 'inspect_scene', 'export_model'],
    )
    assert.deepEqual(saved.recipe.steps[0].params.fields, {
      accentColor: '#E11D48',
      lensMm: 75,
      exposure: 0.4,
    })

    // 6. List recipes includes user recipe + all 4 built-in AAA recipes
    const listed = await wfTool.execute({ action: 'list' })
    assertLosslessJson(listed)
    assert.equal(listed.workflows.length, 1 + BUILTIN_WORKFLOW_RECIPES.length)

    // 7. Export JSON & re-import as a portable copy
    const exported = await wfTool.execute({ action: 'export', workflowId: saved.recipe.id })
    assertLosslessJson(exported)
    assert.equal(exported.recipe.schemaVersion, 1)
    const imported = await wfTool.execute({ action: 'import', recipe: exported.json })
    assertLosslessJson(imported)
    assert.notEqual(imported.recipe.id, saved.recipe.id)
    assert.equal(imported.recipe.steps.length, 4)

    // 8. Built-in recipe cannot be deleted; user recipe can be deleted with confirmed: true
    await assert.rejects(
      () => wfTool.execute({ action: 'delete', workflowId: 'clay-silhouette-audit', confirmed: true }),
      err => err.code === 'WORKFLOW_BUILTIN_READONLY',
    )
    const del = await wfTool.execute({ action: 'delete', workflowId: imported.recipe.id, confirmed: true })
    assertLosslessJson(del)
    assert.equal(del.deleted, true)

    // 9. Replay saved recipe onto a SECOND target project (dryRun first, then live replay with wait: true & overrides!)
    const targetProj = await tools.get('blender_project').execute({
      action: 'create',
      fields: {
        title: 'Target Project For Replay',
        engine: 'EEVEE',
        samples: 16,
        scriptMode: 'custom',
        customScript: 'import bpy\nEXPOSURE = 0.0\nprint(EXPOSURE)\n',
      },
    })
    const dry = await wfTool.execute({
      action: 'replay',
      workflowId: saved.recipe.id,
      id: targetProj.id,
      dryRun: true,
    })
    assertLosslessJson(dry)
    assert.equal(dry.dryRun, true)
    assert.equal(dry.workflowReplay.totalSteps, 4)

    const replayed = await wfTool.execute({
      action: 'replay',
      workflowId: saved.recipe.id,
      id: targetProj.id,
      overrides: { accentColor: '#10B981' },
      wait: true,
    })
    assertLosslessJson(replayed)
    assert.equal(replayed.state, 'done')
    assert.equal(replayed.workflowReplay.completedSteps, 4)
    assert.equal(replayed.workflowReplay.failedSteps, 0)
    assert.equal(replayed.workflowReplay.artifactIds.length, 1)

    const targetAfter = await workbench.store.get(targetProj.id)
    assert.equal(targetAfter.accentColor, '#10B981')
    assert.equal(targetAfter.lensMm, 75)
    assert.equal(targetAfter.exposure, 0.4)
    assert.match(targetAfter.customScript, /EXPOSURE = 0\.4/)
    // Replay records a single workflow_replay summary event (not recursive duplicates!)
    assert.equal(targetAfter.workflowHistory.filter(e => e.kind === 'workflow_replay').length, 1)

    // 9b. Replay built-in recipe WITHOUT lookdev_update step must still enforce qualityTier + Lookdev overrides!
    const scriptsBeforeOverride = executedScripts.length
    const overrideReplay = await wfTool.execute({
      action: 'replay',
      workflowId: 'aaa-product-lookdev-pack',
      id: targetProj.id,
      overrides: { qualityTier: 'draft', clayMode: true, exposure: 0.45 },
      wait: true,
    })
    assertLosslessJson(overrideReplay)
    assert.equal(overrideReplay.state, 'done')
    const replayRenderScripts = executedScripts.slice(scriptsBeforeOverride)
    assert.ok(replayRenderScripts.length >= 3)
    // Contact sheet / shots steps must carry enforceRenderProfile=true + EEVEE + clayMode=true + exposure=0.45
    const enforcedScripts = replayRenderScripts.filter(s => s.includes('\\"enforceRenderProfile\\":true'))
    assert.ok(enforcedScripts.length >= 2)
    assert.ok(
      enforcedScripts.every(
        s =>
          s.includes('\\"engine\\":\\"EEVEE\\"') &&
          s.includes('\\"clayMode\\":true') &&
          s.includes('\\"exposure\\":0.45'),
      ),
    )
    // render_shots step must also expose artifactPath & shot list in summary
    const shotStep = overrideReplay.workflowReplay.steps.find(s => s.kind === 'render_shots')
    assert.ok(shotStep?.artifactPath)

    // 10. Pause recording stops recording new events; clear_history clears cleanly
    const paused = await wfTool.execute({ action: 'toggle_recording', enabled: false })
    assertLosslessJson(paused)
    assert.equal(paused.recordingEnabled, false)
    const beforeCount = (await workbench.store.get(targetProj.id)).workflowHistory.length
    await tools.get('blender_project').execute({
      action: 'update',
      id: targetProj.id,
      revision: targetAfter.revision,
      fields: { exposure: 0.8 },
    })
    assert.equal((await workbench.store.get(targetProj.id)).workflowHistory.length, beforeCount)

    const resumed = await wfTool.execute({ action: 'toggle_recording', enabled: true })
    assert.equal(resumed.recordingEnabled, true)

    const latestTarget = await workbench.store.get(targetProj.id)
    const cleared = await wfTool.execute({
      action: 'clear_history',
      id: targetProj.id,
      revision: latestTarget.revision,
      confirmed: true,
    })
    assertLosslessJson(cleared)
    assert.equal(cleared.workflowHistory.length, 0)

    workbench.dispose()
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('Workbench UI renders new Workflow tab cleanly in jsdom (timeline, built-in recipes, save/dry-run/export/import)', async () => {
  const bundleCode = await readFile(CLIENT_BUNDLE, 'utf8')
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://127.0.0.1:3000/',
    pretendToBeVisual: true,
  })
  const prevWindow = globalThis.window
  const prevDocument = globalThis.document
  const prevNavigator = globalThis.navigator
  const prevFetch = globalThis.fetch
  const prevActEnv = globalThis.IS_REACT_ACT_ENVIRONMENT
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })

  const sampleProject = {
    id: '22222222-2222-4222-8222-222222222222',
    revision: 3,
    created: '2026-11-27T00:00:00.000Z',
    updated: '2026-11-27T00:00:00.000Z',
    template: 'product-studio',
    title: 'UI Workflow Test',
    description: '',
    headline: 'WF',
    engine: 'EEVEE',
    samples: 16,
    aspect: 'landscape',
    resolutionScale: 100,
    fps: 24,
    frameStart: 1,
    frameEnd: 24,
    cameraPreset: 'three_quarter',
    lightingPreset: 'studio_3point',
    materialPreset: 'ceramic_gloss',
    accentColor: '#3B82F6',
    transparentBg: false,
    lensMm: 50,
    exposure: 0,
    clayMode: false,
    scriptMode: 'template',
    customScript: '',
    assets: [],
    artifacts: [],
    checkpoints: [],
    workflowHistory: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        seq: 1,
        timestamp: '2026-11-27T00:00:00.000Z',
        kind: 'lookdev_update',
        source: 'agent',
        status: 'ok',
        label: '调整 Lookdev（lensMm）',
        revision: 2,
        params: { fields: { lensMm: 75 } },
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        seq: 2,
        timestamp: '2026-11-27T00:01:00.000Z',
        kind: 'inspect_scene',
        source: 'ui',
        status: 'ok',
        label: 'QC-3D 场景体检',
        revision: 3,
        durationMs: 1200,
        summary: 'QC-3D 100/A',
      },
    ],
  }

  const wfSummaries = BUILTIN_WORKFLOW_RECIPES.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    tags: r.tags,
    builtin: true,
    stepCount: r.steps.length,
    stepKinds: r.steps.map(s => s.kind),
    created: r.created,
    updated: r.updated,
  }))

  let savedCalled = false
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body || '{}'))
    if (body.action === 'list') {
      return new Response(
        JSON.stringify({
          ok: true,
          value: {
            projects: [sampleProject],
            archivedProjects: [],
            workflows: wfSummaries,
            workflowRecordingEnabled: true,
            environment: {
              ready: true,
              active: { path: 'blender', version: '5.3.0', major: 5, minor: 3, source: 'config', eeveeEngine: 'BLENDER_EEVEE', greasePencilApi: 'gpv3' },
              detected: [],
              configuredPath: 'blender',
              computeDevice: 'auto',
              bridge: { host: '127.0.0.1', port: 9876, hasToken: false, connected: false },
              polyHavenEnabled: false,
              node: 'v24',
              platform: 'win32',
              hint: '',
            },
            jobs: [],
          },
        }),
      )
    }
    if (body.action === 'workflow_list') {
      return new Response(JSON.stringify({ ok: true, value: { workflows: wfSummaries, recordingEnabled: true } }))
    }
    if (body.action === 'workflow_save_from_history') {
      savedCalled = true
      return new Response(JSON.stringify({ ok: true, value: { recipe: { id: '55555555-5555-4555-8555-555555555555', name: body.name, steps: [] }, summary: wfSummaries[0] } }))
    }
    if (body.action === 'workflow_replay' && body.dryRun) {
      return new Response(
        JSON.stringify({
          ok: true,
          value: {
            dryRun: true,
            workflowReplay: {
              workflowId: body.workflowId,
              workflowName: wfSummaries[0].name,
              dryRun: true,
              totalSteps: 4,
              completedSteps: 0,
              failedSteps: 0,
              skippedSteps: 4,
              artifactIds: [],
              steps: [{ stepId: 's1', index: 1, kind: 'inspect_scene', label: 'QC-3D', status: 'skipped', durationMs: 0, summary: '预演' }],
            },
          },
        }),
      )
    }
    return new Response(JSON.stringify({ ok: true, value: {} }))
  }

  let root
  try {
    let loadedMod
    dom.window.__ModuleLoader__ = {
      load(mod) {
        loadedMod = mod.factory(id => {
          if (id === 'react') return React
          throw new Error(`unexpected require: ${id}`)
        })
      },
    }
    dom.window.eval(bundleCode)

    let Component
    loadedMod.apply({
      slots: {
        inject: (_name, cb) => cb(),
        register: (_meta, comp) => {
          Component = comp
          return () => {}
        },
      },
      locale: { current: 'zh-CN' },
    })
    assert.ok(Component)

    const container = dom.window.document.getElementById('root')
    root = createRoot(container)
    await act(async () => {
      root.render(React.createElement(Component, { workbench: true }))
    })
    await act(async () => {
      await new Promise(r => setTimeout(r, 40))
    })

    // Click Workflow tab in library view
    const wfTab = [...dom.window.document.querySelectorAll('[role="tab"]')].find(el => /工作流/.test(el.textContent || ''))
    assert.ok(wfTab, 'Workflow tab should exist')
    await act(async () => {
      wfTab.click()
    })
    await act(async () => {
      await new Promise(r => setTimeout(r, 20))
    })

    const panel = dom.window.document.querySelector('[data-workflow-panel="true"]')
    assert.ok(panel, 'Workflow panel should render')
    assert.match(panel.textContent || '', /旗舰产品棚拍 Lookdev 全套/)
    assert.match(panel.textContent || '', /白模轮廓与四视角体检流/)
    assert.match(panel.textContent || '', /导入工作流配方 JSON/)
    assert.equal(savedCalled, false)
  } finally {
    if (root) {
      await act(async () => {
        root.unmount()
      })
    }
    globalThis.window = prevWindow
    globalThis.document = prevDocument
    Object.defineProperty(globalThis, 'navigator', { value: prevNavigator, configurable: true })
    globalThis.fetch = prevFetch
    globalThis.IS_REACT_ACT_ENVIRONMENT = prevActEnv
    dom.window.close()
  }
})

test('Workflow hardening: non-destructive clay-silhouette-audit, strict overrides/step validation, 70-char fallback name, pipeline artifactPaths & concurrency', async () => {
  const dir = await createTempDir('dsh-bl-wf-hard-')
  try {
    const fakeExe = join(dir, 'blender-fake.exe')
    await writeFile(fakeExe, 'fake')
    let forceQcFail = true
    const seenScripts = []
    const wb = new BlenderWorkbench({
      root: dir,
      skipSystemScan: true,
      extraCandidates: [{ path: fakeExe, source: 'config' }],
      prober: async () => ({ ok: true, stdout: 'Blender 5.3.0\n' }),
      gpuProber: async () => ({ available: false, backend: 'CPU', devices: [] }),
      executor: async req => {
        const script = req.scriptContent || ''
        seenScripts.push(script)
        const outMatch = /_dsh_out = ("[^"]+")|_dsh_render_contact_sheet\(("[^"]+")|_dsh_render_multi_shots\(("[^"]+")/.exec(script)
        if (outMatch?.[3]) {
          const outDir = JSON.parse(outMatch[3])
          for (const s of ['hero_3q', 'side_profile', 'top_plan', 'low_dramatic', 'macro_dof']) {
            if (script.includes(`\\"${s}\\"`) || script.includes(`"${s}"`)) {
              await writeFile(join(outDir, `shot_${s}.png`), VALID_PNG)
            }
          }
        } else if (outMatch) {
          const outPath = JSON.parse(outMatch[1] || outMatch[2])
          await writeFile(outPath, outPath.endsWith('.glb') ? VALID_GLB : VALID_PNG)
        }
        return {
          exitCode: 0,
          lines: ['ok'],
          stdout: 'ok',
          stderr: '',
          savedFiles: [],
          durationMs: 12,
          sceneSummary: {
            capturedAt: new Date().toISOString(),
            blenderVersion: '5.3.0',
            engine: 'BLENDER_EEVEE',
            objectCount: 2,
            meshCount: 1,
            lightCount: 1,
            cameraCount: forceQcFail ? 0 : 1,
            totalPolygons: 500,
            activeCamera: forceQcFail ? '' : 'CAM',
            materials: ['Mat_Main'],
            collections: ['DSH_Hero'],
            objects: [{ name: 'Hero', type: 'MESH', location: [0, 0, 0.5], dimensions: [1, 1, 1] }],
            qc: forceQcFail
              ? { score: 20, grade: 'F', issues: [{ code: 'NO_CAMERA', severity: 'error', message: 'Missing camera' }] }
              : { score: 100, grade: 'A', issues: [] },
          },
        }
      },
    })

    // 1. clay-silhouette-audit NEVER leaks clayMode: true onto project.json on QC failure OR success!
    const p1 = await wb.store.create({ title: 'Clay Safety Project', clayMode: false, accentColor: '#3B82F6' })
    const failedJob = await wb.replayWorkflow('clay-silhouette-audit', p1.id)
    const doneFail = await wb.waitForJob(failedJob.id)
    assert.equal(doneFail.state, 'failed')
    const afterFail = await wb.store.get(p1.id)
    assert.equal(afterFail.clayMode, false)
    assert.equal(afterFail.revision, p1.revision)

    forceQcFail = false
    seenScripts.length = 0
    const okJob = await wb.replayWorkflow('clay-silhouette-audit', p1.id)
    const doneOk = await wb.waitForJob(okJob.id)
    assert.equal(doneOk.state, 'done')
    assert.equal(doneOk.workflowReplay.completedSteps, 3)
    const afterOk = await wb.store.get(p1.id)
    assert.equal(afterOk.clayMode, false)
    assert.equal(afterOk.revision, p1.revision)
    // Inspect stage should NOT have clayMode=true; contact_sheet & render_shots stages MUST have clayMode=true!
    assert.equal(seenScripts.length, 3)
    assert.equal(seenScripts[0].includes('\\"clayMode\\":true'), false)
    assert.equal(seenScripts[1].includes('\\"clayMode\\":true'), true)
    assert.equal(seenScripts[2].includes('\\"clayMode\\":true'), true)
    assert.ok(doneOk.workflowReplay.steps[2].artifactPaths?.length === 3)

    // 2. Strict overrides validation rejects bad values synchronously in BOTH dryRun & live replay
    assert.throws(() => validateWorkflowReplayOverrides({ accentColor: 'ZZZZZZ' }), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowReplayOverrides({ lensMm: 999 }), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowReplayOverrides({ exposure: 10 }), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowReplayOverrides({ clayMode: 'yes' }), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowReplayOverrides({ qualityTier: 'ultra' }), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowReplayOverrides({ exportFormat: 'usdz' }), e => e.code === 'WORKFLOW_INVALID')
    await assert.rejects(
      () => wb.replayWorkflow('rapid-eevee-delivery', p1.id, { dryRun: true, overrides: { qualityTier: 'ultra' } }),
      e => e.code === 'WORKFLOW_INVALID',
    )

    // 3. Strict validateWorkflowStep rejects bad bridge params, out-of-range frame, and frameEnd < frameStart
    assert.throws(() => validateWorkflowStep({ kind: 'bridge_set_camera', params: {} }, 0), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowStep({ kind: 'bridge_set_camera', params: { lensMm: 9999 } }, 0), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowStep({ kind: 'bridge_transform_object', params: { name: 'Cube' } }, 0), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowStep({ kind: 'bridge_set_material', params: { materialName: 'M', color: '#FFFFFF', metallic: 2 } }, 0), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowStep({ kind: 'lookdev_update', params: { fields: { frameStart: 100, frameEnd: 10 } } }, 0), e => e.code === 'WORKFLOW_INVALID')
    assert.throws(() => validateWorkflowStep({ kind: 'preview_still', params: { frame: -5 } }, 0), e => e.code === 'WORKFLOW_INVALID')

    // 4. workflow_save_from_history handles 70-char project title & whitespace-only name safely (<=72 chars)
    const longProj = await wb.store.create({ title: 'A'.repeat(70) })
    await wb.recordWorkflowEvent(longProj.id, { kind: 'inspect_scene', source: 'ui', status: 'ok', label: 'QC' })
    const resFallback = await wb.fetch(
      new Request('http://127.0.0.1/api/dsh-blender-studio/workbench', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-dsh-blender-studio': '1' },
        body: JSON.stringify({ action: 'workflow_save_from_history', id: longProj.id, name: '   ' }),
      }),
    )
    assert.equal(resFallback.status, 200)
    const savedLong = await resFallback.json()
    assert.equal(savedLong.ok, true)
    assert.ok(savedLong.value.recipe.name.length <= 72)

    // 5. pipeline step inside workflow_replay forwards frame, populates artifactPath/artifactPaths, and keeps clayMode off export_model
    seenScripts.length = 0
    const pipeRecipe = await wb.workflows.save({
      name: 'Pipeline Frame & Path Check',
      steps: [
        {
          kind: 'pipeline',
          params: { includeContactSheet: true, renderKind: 'still', exportFormat: 'glb', qualityTier: 'draft', frame: 12 },
        },
      ],
    })
    const pipeJob = await wb.replayWorkflow(pipeRecipe.id, p1.id, {
      overrides: { clayMode: true, accentColor: '#10B981' },
    })
    const donePipe = await wb.waitForJob(pipeJob.id)
    assert.equal(donePipe.state, 'done')
    const pipeStep = donePipe.workflowReplay.steps[0]
    assert.ok(pipeStep.artifactPath && pipeStep.artifactPath.endsWith('.png'))
    assert.equal(pipeStep.artifactPaths?.length, 3)
    // Export stage (4th script: qc, contact_sheet, still, export) must carry accentColor=#10B981 but clayMode=false!
    const exportScript = seenScripts.at(-1)
    assert.ok(exportScript.includes('#10B981'))
    assert.equal(exportScript.includes('\\"clayMode\\":true'), false)
    // Contact sheet & still scripts must use frame 12!
    assert.ok(seenScripts[1].includes(', 12)'))
    assert.ok(seenScripts[2].includes('_dsh_scene.frame_set(12)'))

    // 6. Parallel appendWorkflowEvent & parallel workflow.save() do not lose events or break locks
    await Promise.all(
      Array.from({ length: 8 }, (_, idx) =>
        wb.store.appendWorkflowEvent(p1.id, {
          kind: 'inspect_scene',
          source: 'agent',
          status: 'ok',
          label: `Concurrent QC ${idx + 1}`,
        }),
      ),
    )
    const pConcurrent = await wb.store.get(p1.id)
    const seqs = pConcurrent.workflowHistory.map(e => e.seq)
    assert.equal(new Set(seqs).size, seqs.length, 'Every concurrent event must receive a unique monotonic seq')
    assert.ok(pConcurrent.workflowHistory.filter(e => e.label.startsWith('Concurrent QC')).length === 8)

    wb.dispose()
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('Live Bridge TCP socket workflow recording, full replay, and mid-replay disconnect handling', async () => {
  const dir = await createTempDir('dsh-bl-wf-bridge-')
  const rpcCalls = []
  let disconnectAfter = Infinity

  const server = createTcpServer(socket => {
    let buf = ''
    socket.on('data', chunk => {
      buf += chunk.toString('utf8')
      let nl
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim()
        buf = buf.slice(nl + 1)
        if (!line) continue
        const req = JSON.parse(line)
        rpcCalls.push({ command: req.command, params: req.params })
        if (rpcCalls.length > disconnectAfter) {
          socket.destroy()
          return
        }
        const summary = {
          capturedAt: new Date().toISOString(),
          blenderVersion: '5.3.0',
          engine: 'BLENDER_EEVEE',
          objectCount: 2,
          meshCount: 1,
          lightCount: 1,
          cameraCount: 1,
          totalPolygons: 320,
          activeCamera: 'Camera',
          materials: ['Mat_Body'],
          collections: ['DSH_Hero'],
          objects: [{ name: 'Hero_Cube', type: 'MESH', location: [0, 0, 0.5], dimensions: [1, 1, 1] }],
          qc: { score: 100, grade: 'A', issues: [] },
        }
        let result = { sceneSummary: summary }
        if (req.command === 'set_camera') {
          result = { camera: { name: 'Camera', lensMm: req.params.lensMm ?? 50, location: req.params.location ?? [0, -3, 1], useDof: false }, sceneSummary: summary }
        } else if (req.command === 'transform_object') {
          result = { object: { name: req.params.name, type: 'MESH', location: req.params.location ?? [0, 0, 0], rotationDeg: req.params.rotationDeg ?? [0, 0, 0], scale: req.params.scale ?? [1, 1, 1] }, sceneSummary: summary }
        } else if (req.command === 'set_material_color') {
          result = { material: { name: req.params.materialName, color: req.params.color, metallic: req.params.metallic ?? 0, roughness: req.params.roughness ?? 0.3 }, sceneSummary: summary }
        }
        socket.write(JSON.stringify({ id: req.id, ok: true, result }) + '\n')
      }
    })
  })

  await new Promise(r => server.listen(0, '127.0.0.1', r))
  const port = server.address().port

  try {
    const wb = new BlenderWorkbench({ root: dir, skipSystemScan: true })
    await wb.configureSettings({ bridgeHost: '127.0.0.1', bridgePort: port })
    const tools = new Map()
    installBlenderWorkbench(
      {
        tools: { register: def => { tools.set(def.name, def); return () => tools.delete(def.name) } },
        connection: { fetch: { register: () => () => {} } },
      },
      { workbench: wb },
    )

    const proj = await tools.get('blender_project').execute({
      action: 'create',
      fields: { title: 'Bridge Workflow Demo', accentColor: '#3B82F6' },
    })

    // Record 4 live Bridge steps via blender_bridge tool
    await tools.get('blender_bridge').execute({ action: 'sync_project', id: proj.id })
    await tools.get('blender_bridge').execute({ action: 'set_camera', id: proj.id, lensMm: 85, dofFstop: 2.8 })
    await tools.get('blender_bridge').execute({ action: 'transform_object', id: proj.id, name: 'Hero_Cube', location: [0.2, 0, 0.5], rotationDeg: [0, 0, 15] })
    await tools.get('blender_bridge').execute({ action: 'set_material', id: proj.id, materialName: 'Mat_Body', color: '#E11D48', metallic: 0.9, roughness: 0.2 })

    const wfTool = tools.get('blender_workflow')
    const hist = await wfTool.execute({ action: 'history', id: proj.id })
    assert.deepEqual(
      hist.events.map(e => e.kind),
      ['project_init', 'bridge_sync', 'bridge_set_camera', 'bridge_transform_object', 'bridge_set_material'],
    )

    // Save recorded Bridge steps as a reusable workflow recipe
    const saved = await wfTool.execute({ action: 'save_from_history', id: proj.id, name: 'Live Bridge Studio Flow' })
    assert.equal(saved.recipe.steps.length, 4)

    // Replay all 4 steps against LIVE Bridge server with overrides!
    rpcCalls.length = 0
    const liveReplay = await wfTool.execute({
      action: 'replay',
      workflowId: saved.recipe.id,
      id: proj.id,
      overrides: { accentColor: '#10B981', lensMm: 65 },
      wait: true,
    })
    assertLosslessJson(liveReplay)
    assert.equal(liveReplay.state, 'done')
    assert.equal(liveReplay.workflowReplay.completedSteps, 4)
    assert.equal(liveReplay.workflowReplay.skippedSteps, 0)
    assert.deepEqual(rpcCalls.map(c => c.command), ['load_script', 'set_camera', 'transform_object', 'set_material_color'])
    assert.ok(rpcCalls[0].params.code.includes('#10B981'), 'bridge_sync must forward accentColor override')
    assert.equal(rpcCalls[1].params.lensMm, 65, 'bridge_set_camera must apply lensMm override')
    assert.equal(rpcCalls[3].params.color, '#10B981', 'bridge_set_material must apply accentColor override')

    // Mid-replay disconnect: Bridge drops right after Step 1!
    // (a) skipIfBridgeOffline: true -> Step 1 done, Steps 2-4 skipped, job done!
    rpcCalls.length = 0
    disconnectAfter = 1
    const skipReplay = await wfTool.execute({
      action: 'replay',
      workflowId: saved.recipe.id,
      id: proj.id,
      skipIfBridgeOffline: true,
      wait: true,
    })
    assert.equal(skipReplay.state, 'done')
    assert.equal(skipReplay.workflowReplay.completedSteps, 1)
    assert.equal(skipReplay.workflowReplay.skippedSteps, 3)

    // (b) skipIfBridgeOffline: false + stopOnError: true -> Step 1 done, Step 2 fails, stoppedEarly: true!
    rpcCalls.length = 0
    disconnectAfter = 1
    const failFast = await wfTool.execute({
      action: 'replay',
      workflowId: saved.recipe.id,
      id: proj.id,
      skipIfBridgeOffline: false,
      stopOnError: true,
      wait: true,
    })
    assert.equal(failFast.state, 'failed')
    assert.equal(failFast.workflowReplay.completedSteps, 1)
    assert.equal(failFast.workflowReplay.failedSteps, 1)
    assert.equal(failFast.workflowReplay.stoppedEarly, true)

    // (c) skipIfBridgeOffline: false + stopOnError: false -> Step 1 done, Steps 2-4 fail without early stop!
    rpcCalls.length = 0
    disconnectAfter = 1
    const failAll = await wfTool.execute({
      action: 'replay',
      workflowId: saved.recipe.id,
      id: proj.id,
      skipIfBridgeOffline: false,
      stopOnError: false,
      wait: true,
    })
    assert.equal(failAll.state, 'failed')
    assert.equal(failAll.workflowReplay.completedSteps, 1)
    assert.equal(failAll.workflowReplay.failedSteps, 3)
    assert.notEqual(failAll.workflowReplay.stoppedEarly, true)

    wb.dispose()
  } finally {
    await new Promise(r => server.close(r))
    await rm(dir, { recursive: true, force: true })
  }
})

test('Workflow security, tool schema/json import, non-object overrides, and en-US zero-CJK UI hardening', async () => {
  const dir = await createTempDir('dsh-bl-wf-sec-')
  try {
    const fakeExe = join(dir, 'blender-fake.exe')
    await writeFile(fakeExe, 'fake')
    let executedCount = 0
    const wb = new BlenderWorkbench({
      root: dir,
      skipSystemScan: true,
      extraCandidates: [{ path: fakeExe, source: 'config' }],
      prober: async () => ({ ok: true, stdout: 'Blender 5.3.0\n' }),
      gpuProber: async () => ({ available: false, backend: 'CPU', devices: [] }),
      executor: async req => {
        executedCount++
        const script = req.scriptContent || ''
        const outMatch = /_dsh_out = ("[^"]+")|_dsh_render_contact_sheet\(("[^"]+")/.exec(script)
        if (outMatch) {
          const outPath = JSON.parse(outMatch[1] || outMatch[2])
          await writeFile(outPath, outPath.endsWith('.glb') ? VALID_GLB : VALID_PNG)
        }
        return {
          exitCode: 0,
          lines: ['ok'],
          stdout: 'ok',
          stderr: '',
          savedFiles: [],
          durationMs: 10,
          sceneSummary: {
            capturedAt: new Date().toISOString(),
            blenderVersion: '5.3.0',
            engine: 'BLENDER_EEVEE',
            objectCount: 2,
            meshCount: 1,
            lightCount: 1,
            cameraCount: 1,
            totalPolygons: 240,
            activeCamera: 'CAM',
            materials: ['Mat'],
            collections: ['Hero'],
            objects: [{ name: 'Hero', type: 'MESH', location: [0, 0, 0.5], dimensions: [1, 1, 1] }],
            qc: { score: 100, grade: 'A', issues: [] },
          },
        }
      },
    })

    const tools = new Map()
    installBlenderWorkbench(
      {
        tools: { register: def => { tools.set(def.name, def); return () => tools.delete(def.name) } },
        connection: { fetch: { register: () => () => {} } },
      },
      { workbench: wb },
    )

    // 1. Unsafe customScript MUST be rejected with SCRIPT_UNSAFE on workflow_replay unless allowUnsafe: true
    const unsafeProj = await wb.store.create({
      title: 'Unsafe Script Replay Guard',
      scriptMode: 'custom',
      customScript: 'import os\nos.system("echo blocked")\n',
    })
    const inspectRecipe = await wb.workflows.save({
      name: 'Inspect Safety Check',
      steps: [{ kind: 'inspect_scene', params: {} }],
    })
    await assert.rejects(
      () => wb.replayWorkflow(inspectRecipe.id, unsafeProj.id),
      err => err.code === 'SCRIPT_UNSAFE',
    )
    assert.equal(executedCount, 0, 'Unsafe script must never reach Blender executor when allowUnsafe is false')

    // Even when a harmless lookdev_update precedes a CLI step, per-step safety check still blocks unsafe customScript
    const lookdevThenInspect = await wb.workflows.save({
      name: 'Lookdev Then Inspect',
      steps: [
        { kind: 'lookdev_update', params: { fields: { exposure: 0.2 } } },
        { kind: 'inspect_scene', params: {} },
      ],
    })
    await assert.rejects(
      () => wb.replayWorkflow(lookdevThenInspect.id, unsafeProj.id),
      err => err.code === 'SCRIPT_UNSAFE',
    )
    assert.equal(executedCount, 0)

    // Explicit allowUnsafe: true permits running the trusted local script
    const allowedJob = await wb.replayWorkflow(inspectRecipe.id, unsafeProj.id, { allowUnsafe: true })
    const allowedDone = await wb.waitForJob(allowedJob.id)
    assert.equal(allowedDone.state, 'done')
    assert.equal(executedCount, 1)

    // 2. Tool schemas & ergonomics: blender_workflow.recipe has explicit schema typing, supports `json` alias, and blender_render recommends read_image
    const wfTool = tools.get('blender_workflow')
    for (const [propName, propSchema] of Object.entries(wfTool.parameters.properties)) {
      assert.ok(
        propSchema.type || Array.isArray(propSchema.anyOf),
        `blender_workflow.parameters.properties.${propName} must define JSON Schema type or anyOf`,
      )
    }
    const exported = await wfTool.execute({ action: 'export', workflowId: 'rapid-eevee-delivery' })
    const importedViaJson = await wfTool.execute({ action: 'import', json: exported.json })
    assertLosslessJson(importedViaJson)
    assert.equal(importedViaJson.recipe.steps.length, 4)
    assert.match(tools.get('blender_render').description, /read_image/)
    assert.doesNotMatch(tools.get('blender_render').description, /read_file/)

    // 3. HTTP workflow_replay rejects malformed non-object overrides (string / number) with 400 WORKFLOW_INVALID
    const badOvRes = await wb.fetch(
      new Request('http://127.0.0.1/api/dsh-blender-studio/workbench', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-dsh-blender-studio': '1' },
        body: JSON.stringify({
          action: 'workflow_replay',
          workflowId: 'rapid-eevee-delivery',
          id: unsafeProj.id,
          dryRun: true,
          overrides: 'invalid-string',
        }),
      }),
    )
    assert.equal(badOvRes.status, 400)
    const badOvBody = await badOvRes.json()
    assert.equal(badOvBody.ok, false)
    assert.equal(badOvBody.code, 'WORKFLOW_INVALID')

    // 4. Workbench Workflow UI in en-US has ZERO CJK leakage on built-in recipes/dry-run and disables Save Recipe when only failed events exist
    const bundleCode = await readFile(CLIENT_BUNDLE, 'utf8')
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      url: 'http://127.0.0.1:3000/',
      pretendToBeVisual: true,
    })
    const prevWindow = globalThis.window
    const prevDocument = globalThis.document
    const prevNavigator = globalThis.navigator
    const prevFetch = globalThis.fetch
    const prevActEnv = globalThis.IS_REACT_ACT_ENVIRONMENT
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })

    const wfSummaries = await wb.workflows.list()
    const failedEventProj = {
      id: '99999999-9999-4999-8999-999999999999',
      revision: 1,
      created: '2026-11-27T00:00:00Z',
      updated: '2026-11-27T00:00:00Z',
      template: 'product-studio',
      title: 'English Studio Scene',
      description: '',
      headline: 'EN',
      engine: 'EEVEE',
      samples: 16,
      aspect: 'landscape',
      resolutionScale: 100,
      fps: 24,
      frameStart: 1,
      frameEnd: 24,
      cameraPreset: 'three_quarter',
      lightingPreset: 'studio_3point',
      materialPreset: 'ceramic_gloss',
      accentColor: '#3B82F6',
      transparentBg: false,
      lensMm: 50,
      exposure: 0,
      clayMode: false,
      scriptMode: 'template',
      customScript: '',
      assets: [],
      artifacts: [],
      checkpoints: [],
      workflowHistory: [
        {
          id: '88888888-8888-4888-8888-888888888888',
          seq: 1,
          timestamp: '2026-11-27T00:00:00Z',
          kind: 'preview_still',
          source: 'ui',
          status: 'failed',
          label: '静帧渲染（draft）',
          error: 'Mock failure',
        },
      ],
    }

    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body || '{}'))
      if (body.action === 'list') {
        return new Response(
          JSON.stringify({
            ok: true,
            value: {
              projects: [failedEventProj],
              archivedProjects: [],
              workflows: wfSummaries.filter(w => w.builtin),
              workflowRecordingEnabled: true,
              environment: {
                ready: true,
                active: { path: 'blender', version: '5.3.0', major: 5, minor: 3, source: 'config', eeveeEngine: 'BLENDER_EEVEE', greasePencilApi: 'gpv3' },
                detected: [],
                configuredPath: 'blender',
                computeDevice: 'auto',
                bridge: { host: '127.0.0.1', port: 9876, hasToken: false, connected: false },
                polyHavenEnabled: false,
                node: 'v24',
                platform: 'win32',
                hint: '',
              },
              jobs: [],
            },
          }),
        )
      }
      if (body.action === 'get') return new Response(JSON.stringify({ ok: true, value: failedEventProj }))
      if (body.action === 'workflow_list') {
        return new Response(JSON.stringify({ ok: true, value: { workflows: wfSummaries.filter(w => w.builtin), recordingEnabled: true } }))
      }
      if (body.action === 'workflow_replay' && body.dryRun) {
        return new Response(
          JSON.stringify({
            ok: true,
            value: {
              dryRun: true,
              workflowReplay: {
                workflowId: 'clay-silhouette-audit',
                workflowName: '白模轮廓与四视角体检流',
                dryRun: true,
                totalSteps: 3,
                completedSteps: 0,
                failedSteps: 0,
                skippedSteps: 3,
                artifactIds: [],
                steps: [
                  { stepId: 'step-qc', index: 1, kind: 'inspect_scene', label: 'QC-3D 场景结构与材质体检', status: 'skipped', durationMs: 0, summary: '预演：inspect_scene' },
                ],
              },
            },
          }),
        )
      }
      return new Response(JSON.stringify({ ok: true, value: {} }))
    }

    let root
    try {
      let loadedMod
      dom.window.__ModuleLoader__ = {
        load(mod) {
          loadedMod = mod.factory(id => {
            if (id === 'react') return React
            throw new Error(`unexpected require: ${id}`)
          })
        },
      }
      dom.window.eval(bundleCode)
      const enLocale = { getSnapshot: () => ({ active: 'en-US' }) }
      let Component
      loadedMod.apply({
        locale: enLocale,
        get: () => enLocale,
        slots: {
          inject: (_name, cb) => cb(),
          register: (_meta, comp) => {
            Component = comp
            return () => {}
          },
        },
      })
      root = createRoot(dom.window.document.getElementById('root'))
      await act(async () => { root.render(React.createElement(Component, { workbench: true, locale: enLocale })) })
      await act(async () => { await new Promise(r => setTimeout(r, 40)) })

      // Open project -> switch to Workflow tab -> verify zero CJK + disabled Save Recipe button + zero CJK after Dry Run
      const openBtn = [...dom.window.document.querySelectorAll('button')].find(b => /Open/.test(b.textContent || ''))
      assert.ok(openBtn, 'Open button should exist')
      await act(async () => { openBtn.click() })
      await act(async () => { await new Promise(r => setTimeout(r, 40)) })

      const edWfTab = [...dom.window.document.querySelectorAll('[role="tab"]')].find(el => /Workflow/.test(el.textContent || ''))
      assert.ok(edWfTab, 'Editor Workflow tab should exist')
      await act(async () => { edWfTab.click() })
      await act(async () => { await new Promise(r => setTimeout(r, 30)) })

      const panel = dom.window.document.querySelector('[data-workflow-panel="true"]')
      assert.ok(panel)
      assert.match(panel.textContent || '', /AAA Product Studio Lookdev Pack/)
      assert.match(panel.textContent || '', /Clay Silhouette & 4-View Audit/)
      assert.doesNotMatch(panel.textContent || '', /[\u3400-\u9fff]/, 'en-US Workflow panel must contain zero Chinese characters')

      const saveBtn = [...panel.querySelectorAll('button')].find(b => /Save Recipe/.test(b.textContent || ''))
      assert.equal(saveBtn?.disabled, true, 'Save Recipe button must be disabled when only failed events exist')

      const dryRunBtn = [...panel.querySelectorAll('button')].find(b => /Dry Run/.test(b.textContent || ''))
      assert.ok(dryRunBtn)
      await act(async () => { dryRunBtn.click() })
      await act(async () => { await new Promise(r => setTimeout(r, 30)) })
      const summaryBox = panel.querySelector('[data-workflow-replay-summary="true"]')
      assert.ok(summaryBox)
      assert.doesNotMatch(summaryBox.textContent || '', /[\u3400-\u9fff]/, 'en-US Dry-Run breakdown must contain zero Chinese characters')
    } finally {
      if (root) {
        await act(async () => { root.unmount() })
      }
      globalThis.window = prevWindow
      globalThis.document = prevDocument
      Object.defineProperty(globalThis, 'navigator', { value: prevNavigator, configurable: true })
      globalThis.fetch = prevFetch
      globalThis.IS_REACT_ACT_ENVIRONMENT = prevActEnv
      dom.window.close()
    }

    wb.dispose()
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
