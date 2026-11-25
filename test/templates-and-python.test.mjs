import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import {
  BLENDER_TEMPLATES,
  generateRunnerHarness,
  generateSceneScript,
} from '../lib/templates.js'
import {
  BLENDER_EXEMPLARS,
  getExemplar,
  listExemplarSummaries,
} from '../lib/exemplars.js'
import { checkScriptSafety } from '../lib/bridge.js'
import {
  buildBlenderChildEnv,
  parseBlenderProgressLine,
  parseSceneSummaryFromOutput,
} from '../lib/runner.js'
import {
  BLENDER_EXPORT_FORMATS,
  BLENDER_TEMPLATE_IDS,
  defaultProjectFields,
  SCENE_JSON_MARKER,
} from '../lib/types.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const ADDON_PATH = join(ROOT, 'blender', 'dsh_blender_bridge.py')

function findPythonBinary() {
  for (const bin of ['python', 'python3', 'py']) {
    const res = spawnSync(bin, ['--version'], { encoding: 'utf8', shell: false })
    if (res.status === 0) return bin
  }
  return null
}

function makeProject(overrides = {}) {
  return {
    id: '11111111-2222-4333-8444-555555555555',
    revision: 1,
    created: '2026-11-23T00:00:00Z',
    updated: '2026-11-23T00:00:00Z',
    archived: false,
    assets: [
      {
        id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        name: 'studio.hdr',
        file: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee.hdr',
        kind: 'hdri',
        ext: 'hdr',
        size: 1024,
        created: '2026-11-23T00:00:00Z',
      },
    ],
    artifacts: [],
    ...defaultProjectFields(overrides),
  }
}

test('BLENDER_TEMPLATES exposes all 8 templates (including architectural-pavilion & procedural-abstract) with bilingual metadata', () => {
  assert.equal(BLENDER_TEMPLATE_IDS.length, 8)
  assert.ok(BLENDER_TEMPLATE_IDS.includes('architectural-pavilion'))
  assert.ok(BLENDER_TEMPLATE_IDS.includes('procedural-abstract'))
  assert.deepEqual(
    BLENDER_TEMPLATES.map((t) => t.id),
    [...BLENDER_TEMPLATE_IDS],
  )
  for (const tpl of BLENDER_TEMPLATES) {
    assert.ok(tpl.zh.length > 0, `${tpl.id} missing zh label`)
    assert.ok(tpl.en.length > 0, `${tpl.id} missing en label`)
    assert.ok(tpl.description.length > 0, `${tpl.id} missing zh description`)
    assert.ok(tpl.descriptionEn.length > 0, `${tpl.id} missing en description`)
  }
})

test('generated scene scripts include Blender 3.6–5.x compatibility guards, DSH_KIT v2 (24 helpers), Cycles GPU auto-config, auto-wired assets, Cycles OIDN, and QC-3D audit', () => {
  const dshKitHelpers = [
    // v0.2.0 core 16 helpers
    'def dsh_bevel(',
    'def dsh_smooth(',
    'def dsh_array_radial(',
    'def dsh_tube_along_points(',
    'def dsh_ground_assembly(',
    'def dsh_frame_camera_to_assembly(',
    'def dsh_mat_car_paint(',
    'def dsh_mat_carbon_fiber(',
    'def dsh_mat_brushed_metal(',
    'def dsh_mat_tinted_glass(',
    'def dsh_mat_rubber_tire(',
    'def dsh_mat_emissive_led(',
    'def dsh_mat_matte_armor(',
    'def dsh_setup_hero_studio(',
    'def dsh_setup_compositor(',
    'def dsh_add_dof(',
    // v0.3.0 DSH_KIT v2 engineering helpers (+8 = 24 total)
    'def dsh_loft_profile(',
    'def dsh_bolt_ring(',
    'def dsh_wheel_assembly(',
    'def dsh_louver_panel(',
    'def dsh_mat_anodized_metal(',
    'def dsh_mat_heat_blued_titanium(',
    'def dsh_mat_copper_gold(',
    'def dsh_render_clay_override(',
  ]
  assert.equal(dshKitHelpers.length, 24)

  for (const template of BLENDER_TEMPLATE_IDS) {
    const project = makeProject({
      template,
      title: `Scene "Quoted" 'Single' \\ ${template}`,
      headline: `HEAD "3D" ${template}`,
      description: 'Line 1\nLine 2',
      engine: template === 'architectural-pavilion' ? 'CYCLES' : 'EEVEE',
    })
    project.assets.push(
      {
        id: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
        name: 'custom-hero.glb',
        file: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff.glb',
        kind: 'model',
        ext: 'glb',
        size: 2048,
        created: '2026-11-24T00:00:00Z',
      },
      {
        id: 'cccccccc-dddd-4eee-8fff-111111111111',
        name: 'albedo.png',
        file: 'cccccccc-dddd-4eee-8fff-111111111111.png',
        kind: 'texture',
        ext: 'png',
        size: 1024,
        created: '2026-11-24T00:00:00Z',
      },
    )
    const script = generateSceneScript(project, '/tmp/dsh-assets')
    assert.match(script, /import bpy/)
    assert.match(script, /BLENDER_EEVEE_NEXT/)
    assert.match(script, /BLENDER_EEVEE/)
    assert.match(script, /Specular IOR Level/)
    assert.match(script, /Coat Weight/)
    assert.match(script, /Transmission Weight/)
    assert.match(script, /Subsurface Weight/)
    assert.match(script, /AgX/)
    assert.match(script, /Filmic/)
    assert.match(script, /OPENIMAGEDENOISE/)
    assert.match(script, /use_adaptive_sampling/)
    assert.match(script, /def dsh_configure_cycles_device\(/)
    assert.match(script, /OPTIX/)
    assert.match(script, /DSH_ASSET_PATHS/)
    assert.match(script, /ShaderNodeTexEnvironment/)
    assert.match(script, /dsh_auto_place_uploaded_models/)
    for (const qcCode of [
      'EMPTY_SCENE',
      'NO_CAMERA',
      'NO_LIGHTS',
      'UNASSIGNED_MATERIAL',
      'FLAT_UNBEVELED_PRIMITIVE',
      'FLOATING_HERO',
      'OFF_FRAME_HERO',
      'HIGH_POLYCOUNT',
    ]) {
      assert.ok(script.includes(qcCode), `generated script missing QC-3D code ${qcCode}`)
    }
    for (const fnSig of dshKitHelpers) {
      assert.ok(script.includes(fnSig), `generated script missing DSH_KIT helper ${fnSig}`)
    }
    assert.ok(script.includes(SCENE_JSON_MARKER))
    assert.match(script, /def dsh_build_template\(\):/)
    if (template === 'grease-pencil-2d') {
      assert.match(script, /grease_pencils_v3/)
      assert.match(script, /grease_pencils/)
      assert.match(script, /frame\.drawing/)
    }
    if (template === 'procedural-abstract') {
      assert.match(script, /GeometryNodeTree/)
      assert.match(script, /interface\.new_socket/)
    }
  }

  // Custom script mode omits template build, injects custom bpy code, AND still provides DSH_KIT
  const customProject = makeProject({
    scriptMode: 'custom',
    customScript: 'mat = dsh_mat_car_paint("Paint", "#E11D48")\nprint("custom-scene-ok")\n',
  })
  const customScript = generateSceneScript(customProject, '/tmp/dsh-assets')
  assert.match(customScript, /print\("custom-scene-ok"\)/)
  assert.doesNotMatch(customScript, /dsh_build_template\(\)/)
  for (const fnSig of dshKitHelpers) {
    assert.ok(customScript.includes(fnSig), `custom script preamble missing DSH_KIT helper ${fnSig}`)
  }
})

test('generateRunnerHarness supports all modes and zero-Pillow 2x2 contact sheet stitching', () => {
  const project = makeProject({ template: 'product-studio' })

  const still = generateRunnerHarness('preview_still', {
    project,
    assetsDir: '/tmp/assets',
    outputPath: '/tmp/runs/r1/render.png',
    computeDevice: 'gpu',
  })
  assert.match(still, /bpy\.ops\.render\.render\(write_still=True\)/)
  assert.match(still, /dsh_emit_scene_summary\(\)/)
  assert.match(still, /\\"computeDevice\\":\\"gpu\\"/)

  const stillCpu = generateRunnerHarness('preview_still', {
    project,
    assetsDir: '/tmp/assets',
    outputPath: '/tmp/runs/r1/render.png',
    computeDevice: 'cpu',
  })
  assert.match(stillCpu, /\\"computeDevice\\":\\"cpu\\"/)

  const contact = generateRunnerHarness('contact_sheet', {
    project,
    assetsDir: '/tmp/assets',
    outputPath: '/tmp/runs/r1/contact_sheet.png',
  })
  assert.match(contact, /"front"/)
  assert.match(contact, /"three_quarter"/)
  assert.match(contact, /"top"/)
  assert.match(contact, /"active"/)
  assert.match(contact, /bpy\.data\.images\.new\("DSH_Contact_Sheet"/)
  assert.doesNotMatch(contact, /\bfrom PIL\b|\bimport PIL\b/i, 'contact sheet must not require Pillow')

  const anim = generateRunnerHarness('render_animation', {
    project,
    assetsDir: '/tmp/assets',
    outputPath: '/tmp/runs/r1/animation.mp4',
  })
  assert.match(anim, /FFMPEG/)
  assert.match(anim, /MPEG4/)
  assert.match(anim, /H264/)
  assert.match(anim, /animation=True/)
  assert.match(anim, /falling back to PNG/)

  for (const format of BLENDER_EXPORT_FORMATS) {
    const exp = generateRunnerHarness('export_model', {
      project,
      assetsDir: '/tmp/assets',
      outputPath: `/tmp/runs/r1/model.${format}`,
      format,
    })
    assert.match(exp, /dsh_emit_scene_summary\(\)/)
    if (format === 'glb') assert.match(exp, /export_scene\.gltf/)
    if (format === 'fbx') assert.match(exp, /export_scene\.fbx/)
    if (format === 'obj') assert.match(exp, /wm\.obj_export[\s\S]*export_scene\.obj/)
    if (format === 'stl') assert.match(exp, /wm\.stl_export[\s\S]*export_mesh\.stl/)
    if (format === 'blend') assert.match(exp, /save_as_mainfile/)
  }

  const inspect = generateRunnerHarness('inspect_scene', { project, assetsDir: '/tmp/assets' })
  assert.match(inspect, /dsh_emit_scene_summary\(\)/)

  const runScript = generateRunnerHarness('run_script', {
    project,
    assetsDir: '/tmp/assets',
    overrideCode: 'x = 1 + 1\nprint(x)',
  })
  assert.match(runScript, /x = 1 \+ 1/)
  assert.match(runScript, /dsh_emit_scene_summary\(\)/)
})

test('Python ast.parse verifies blender/dsh_blender_bridge.py and every generated scene & harness script', (t) => {
  const pythonBin = findPythonBinary()
  if (!pythonBin) {
    t.skip('No python interpreter available on PATH')
    return
  }

  const addonCode = readFileSync(ADDON_PATH, 'utf8')
  assert.match(addonCode, /BRIDGE_HOST\s*=\s*"127\.0\.0\.1"/)
  assert.match(addonCode, /bpy\.app\.timers/)
  assert.match(addonCode, /def register\(\):/)
  assert.match(addonCode, /def unregister\(\):/)
  assert.match(addonCode, /"qc"/)
  assert.match(addonCode, /OFF_FRAME_HERO/)
  for (const cmd of ['"ping"', '"scene_info"', '"execute"', '"viewport_capture"', '"load_script"']) {
    assert.ok(addonCode.includes(cmd), `addon missing handler ${cmd}`)
  }

  const scripts = [{ name: 'blender/dsh_blender_bridge.py', code: addonCode }]
  const modes = ['preview_still', 'contact_sheet', 'render_animation', 'inspect_scene', 'run_script', 'build_blend']

  for (const template of BLENDER_TEMPLATE_IDS) {
    const project = makeProject({
      template,
      title: `中文与 "Quotes" 'Test' ${template}`,
      headline: `3D LOGO ${template}`,
      cameraPreset: template === 'motion-data' ? 'turntable' : 'three_quarter',
    })
    scripts.push({ name: `scene:${template}`, code: generateSceneScript(project, 'C:\\temp\\assets') })
    for (const mode of modes) {
      scripts.push({
        name: `harness:${template}:${mode}`,
        code: generateRunnerHarness(mode, {
          project,
          assetsDir: 'C:\\temp\\assets',
          outputPath: `C:\\temp\\out\\${mode}.out`,
          overrideCode: mode === 'run_script' ? 'print("ok")' : undefined,
        }),
      })
    }
    for (const format of BLENDER_EXPORT_FORMATS) {
      scripts.push({
        name: `export:${template}:${format}`,
        code: generateRunnerHarness('export_model', {
          project,
          assetsDir: 'C:\\temp\\assets',
          outputPath: `C:\\temp\\out\\model.${format}`,
          format,
        }),
      })
    }
  }

  const checker = [
    'import ast, json, sys',
    'items = json.loads(sys.stdin.buffer.read().decode("utf-8"))',
    'errors = []',
    'for item in items:',
    '    try:',
    '        ast.parse(item["code"], filename=item["name"])',
    '    except SyntaxError as exc:',
    '        errors.append(f"{item[\'name\']}:{exc.lineno}: {exc.msg}")',
    'if errors:',
    '    sys.stderr.buffer.write(("\\n".join(errors)).encode("utf-8"))',
    '    sys.exit(1)',
    'sys.stdout.buffer.write(f"OK:{len(items)}\\n".encode("utf-8"))',
  ].join('\n')

  const res = spawnSync(pythonBin, ['-c', checker], {
    input: Buffer.from(JSON.stringify(scripts), 'utf8'),
    encoding: 'utf8',
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
    env: {
      ...process.env,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
    },
  })
  assert.equal(res.status, 0, `Python ast.parse failed:\n${res.stderr}\n${res.stdout}`)
  assert.equal(res.stdout.trim(), `OK:${scripts.length}`)
})

test('BlenderRunner helpers scrub secrets, parse progress lines, and extract scene JSON summaries', () => {
  const oldSecret = process.env.DEEPSEEK_API_KEY
  process.env.DEEPSEEK_API_KEY = 'sk-super-secret-value'
  try {
    const env = buildBlenderChildEnv('/tmp/dsh-blender-studio-root')
    assert.equal(env.DEEPSEEK_API_KEY, undefined, 'must not leak API keys to Blender child env')
    assert.equal(env.PYTHONNOUSERSITE, '1')
    assert.ok(env.HOME?.includes('blender-home'))
  } finally {
    if (oldSecret === undefined) delete process.env.DEEPSEEK_API_KEY
    else process.env.DEEPSEEK_API_KEY = oldSecret
  }

  const p1 = parseBlenderProgressLine('Fra:12 Mem:42.50M | Sample 16/32', 1, 48)
  assert.ok(p1.progress >= 20 && p1.progress <= 35)
  assert.match(p1.stage ?? '', /12.*16\/32/)

  const p2 = parseBlenderProgressLine("Saved: '/tmp/runs/1/render.png'", 1, 1)
  assert.equal(p2.savedFile, '/tmp/runs/1/render.png')

  const p3 = parseBlenderProgressLine('__DSH_STAGE__=渲染四视角 (2/4): three_quarter', 1, 1)
  assert.equal(p3.stage, '渲染四视角 (2/4): three_quarter')

  const parsedSummary = parseSceneSummaryFromOutput(
    `some log\n${SCENE_JSON_MARKER}{"capturedAt":"2026-11-23T00:00:00Z","blenderVersion":"4.3.2","engine":"BLENDER_EEVEE_NEXT","objectCount":5,"meshCount":2,"lightCount":2,"cameraCount":1,"totalPolygons":120,"materials":[],"collections":[],"objects":[]}\ndone`,
  )
  assert.equal(parsedSummary?.objectCount, 5)
  assert.equal(parsedSummary?.blenderVersion, '4.3.2')
})

test('BLENDER_EXEMPLARS v0.3.0: 4 pro engineering exemplars pass summary/lookup/404, checkScriptSafety(), and Python ast.parse', (t) => {
  const expectedIds = [
    'aero-x900-turbofan',
    'apex-09-racecar',
    'vanguard-h145x-helicopter',
    'kuka-6axis-robot-arm',
  ]
  assert.equal(BLENDER_EXEMPLARS.length, 4)
  assert.deepEqual(
    BLENDER_EXEMPLARS.map((e) => e.id),
    expectedIds,
  )

  const summaries = listExemplarSummaries()
  assert.equal(summaries.length, 4)
  for (const s of summaries) {
    assert.ok(s.titleZh.length > 0 && s.titleEn.length > 0)
    assert.ok(s.summaryZh.length > 0 && s.summaryEn.length > 0)
    assert.ok(s.estimatedPolys.length > 0)
    assert.equal('script' in s, false, 'summary must omit heavy script payload')
    assert.equal('fields' in s, false, 'summary must omit fields payload')
  }

  assert.throws(
    () => getExemplar('non-existent-exemplar'),
    (err) => err.code === 'EXEMPLAR_NOT_FOUND' && err.status === 404,
  )

  const scriptsToParse = []
  for (const id of expectedIds) {
    const ex = getExemplar(id)
    assert.equal(ex.id, id)
    assert.ok(ex.script.length > 5000, `${id} script must be substantial engineering bpy code`)
    const safety = checkScriptSafety(ex.script)
    assert.equal(safety.safe, true, `${id} failed checkScriptSafety: ${JSON.stringify(safety.findings)}`)
    const proj = makeProject({ ...ex.fields, scriptMode: 'custom', customScript: ex.script })
    scriptsToParse.push({ name: `exemplar-raw:${id}`, code: ex.script })
    scriptsToParse.push({ name: `exemplar-scene:${id}`, code: generateSceneScript(proj, 'C:\\temp\\assets') })
  }

  const pythonBin = findPythonBinary()
  if (!pythonBin) return
  const checker = [
    'import ast, json, sys',
    'items = json.loads(sys.stdin.buffer.read().decode("utf-8"))',
    'errors = []',
    'for item in items:',
    '    try:',
    '        ast.parse(item["code"], filename=item["name"])',
    '    except SyntaxError as exc:',
    '        errors.append(f"{item[\'name\']}:{exc.lineno}: {exc.msg}")',
    'if errors:',
    '    sys.stderr.buffer.write(("\\n".join(errors)).encode("utf-8"))',
    '    sys.exit(1)',
    'sys.stdout.buffer.write(f"OK:{len(items)}\\n".encode("utf-8"))',
  ].join('\n')
  const res = spawnSync(pythonBin, ['-c', checker], {
    input: Buffer.from(JSON.stringify(scriptsToParse), 'utf8'),
    encoding: 'utf8',
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
  })
  assert.equal(res.status, 0, `Exemplar Python ast.parse failed:\n${res.stderr}\n${res.stdout}`)
  assert.equal(res.stdout.trim(), `OK:${scriptsToParse.length}`)
})
