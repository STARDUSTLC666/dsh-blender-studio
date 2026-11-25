import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

const BUNDLE = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

function buildMinimalValidGlb() {
  // 4-vertex tetrahedron (4 triangles) with POSITION, NORMAL, Uint16 INDICES, and baseColorFactor
  const positions = new Float32Array([
    0, 0, 1,
    1, 0, -0.5,
    -0.5, 0.866, -0.5,
    -0.5, -0.866, -0.5,
  ])
  const normals = new Float32Array([
    0, 0, 1,
    0.8, 0, -0.6,
    -0.4, 0.7, -0.6,
    -0.4, -0.7, -0.6,
  ])
  const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3,
    0, 3, 1,
    1, 3, 2,
  ])
  const posBytes = Buffer.from(positions.buffer)
  const normBytes = Buffer.from(normals.buffer)
  const idxBytes = Buffer.from(indices.buffer)
  const binRaw = Buffer.concat([posBytes, normBytes, idxBytes])
  const binPad = (4 - (binRaw.length % 4)) % 4
  const binChunk = Buffer.concat([binRaw, Buffer.alloc(binPad)])

  const gltf = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: 'TetraHero', mesh: 0 }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.92, 0.35, 0.08, 1.0] } }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            material: 0,
          },
        ],
      },
    ],
    buffers: [{ byteLength: binRaw.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes.length },
      { buffer: 0, byteOffset: posBytes.length, byteLength: normBytes.length },
      { buffer: 0, byteOffset: posBytes.length + normBytes.length, byteLength: idxBytes.length },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [-0.5, -0.866, -0.5], max: [1, 0.866, 1] },
      { bufferView: 1, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: 12, type: 'SCALAR' },
    ],
  }
  const jsonRaw = Buffer.from(JSON.stringify(gltf), 'utf8')
  const jsonPad = (4 - (jsonRaw.length % 4)) % 4
  const jsonChunk = Buffer.concat([jsonRaw, Buffer.alloc(jsonPad, 0x20)])

  const totalLen = 12 + 8 + jsonChunk.length + 8 + binChunk.length
  const out = Buffer.alloc(totalLen)
  out.write('glTF', 0, 'ascii')
  out.writeUInt32LE(2, 4)
  out.writeUInt32LE(totalLen, 8)
  let off = 12
  out.writeUInt32LE(jsonChunk.length, off)
  out.writeUInt32LE(0x4e4f534a, off + 4) // JSON
  jsonChunk.copy(out, off + 8)
  off += 8 + jsonChunk.length
  out.writeUInt32LE(binChunk.length, off)
  out.writeUInt32LE(0x004e4942, off + 4) // BIN\0
  binChunk.copy(out, off + 8)
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength)
}

const SYNTHETIC_GLB_AB = buildMinimalValidGlb()

const SAMPLE_EXEMPLARS = [
  {
    id: 'aero-x900-turbofan',
    titleZh: 'AERO-X900 高涵道比剖视涡扇航发',
    titleEn: 'AERO-X900 Cutaway Turbofan Jet Engine',
    summaryZh: '剖视风扇叶片、高压压气机核心与测试台架',
    summaryEn: 'Cutaway turbofan blades, compressor core, and test stand',
    category: 'aerospace',
    engine: 'CYCLES',
    samples: 64,
    aspect: 'landscape',
    estimatedPolys: '~26k polys',
  },
  {
    id: 'apex-09-racecar',
    titleZh: 'APEX-09 Cyber GT 超级赛车',
    titleEn: 'APEX-09 Cyber GT Hypercar',
    summaryZh: '空气动力学车身、锻造轮毂与双色车漆',
    summaryEn: 'Aerodynamic hypercar bodywork, forged wheels, and car paint',
    category: 'vehicle',
    engine: 'CYCLES',
    samples: 64,
    aspect: 'landscape',
    estimatedPolys: '~150k SubD',
  },
  {
    id: 'vanguard-h145x-helicopter',
    titleZh: 'VANGUARD H-145X 双发复合直升机',
    titleEn: 'VANGUARD H-145X Twin-Turbine Helicopter',
    summaryZh: '五叶主旋翼、涵道尾桨与起落架滑橇',
    summaryEn: 'Five-blade main rotor, fenestron tail, and landing skids',
    category: 'aerospace',
    engine: 'CYCLES',
    samples: 64,
    aspect: 'landscape',
    estimatedPolys: '~32k SubD',
  },
  {
    id: 'kuka-6axis-robot-arm',
    titleZh: '6 轴工业机械臂装配工作站',
    titleEn: '6-Axis Industrial Robot Arm Cell',
    summaryZh: '六轴伺服关节、线缆束、气动夹爪与 CNC 分度工作台',
    summaryEn: 'Six articulated servo joints, cable dress pack, pneumatic gripper, and CNC fixture table',
    category: 'robotics',
    engine: 'CYCLES',
    samples: 64,
    aspect: 'landscape',
    estimatedPolys: '~28k SubD',
  },
]

const SAMPLE_PROJECT = {
  id: '11111111-2222-4333-8444-555555555555',
  revision: 2,
  created: '2026-11-23T10:00:00Z',
  updated: '2026-11-23T11:00:00Z',
  archived: false,
  template: 'product-studio',
  title: '陶瓷智能手表棚拍',
  description: '三点光产品展示场景',
  headline: 'CHRONO',
  engine: 'EEVEE',
  samples: 32,
  aspect: 'landscape',
  resolutionScale: 100,
  fps: 24,
  frameStart: 1,
  frameEnd: 48,
  cameraPreset: 'three_quarter',
  lightingPreset: 'studio_3point',
  materialPreset: 'ceramic_gloss',
  accentColor: '#3B82F6',
  transparentBg: false,
  scriptMode: 'template',
  customScript: '',
  assets: [
    {
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      name: 'studio_soft.hdr',
      file: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee.hdr',
      kind: 'hdri',
      ext: 'hdr',
      size: 20480,
      source: 'upload',
      created: '2026-11-23T10:10:00Z',
    },
  ],
  artifacts: [
    {
      id: '99999999-8888-4777-8666-555555555555',
      kind: 'still',
      revision: 2,
      file: 'render.png',
      mime: 'image/png',
      size: 16384,
      engine: 'EEVEE',
      samples: 32,
      width: 1280,
      height: 720,
      durationMs: 1200,
      created: '2026-11-23T10:30:00Z',
    },
    {
      id: '88888888-7777-4666-8555-444444444444',
      kind: 'contact_sheet',
      revision: 1,
      file: 'contact_sheet.png',
      mime: 'image/png',
      size: 24576,
      engine: 'CYCLES',
      samples: 64,
      width: 1284,
      height: 724,
      durationMs: 3200,
      created: '2026-11-23T10:20:00Z',
    },
    {
      id: '77777777-6666-4555-8444-333333333333',
      kind: 'glb',
      format: 'glb',
      revision: 2,
      file: 'model.glb',
      mime: 'model/gltf-binary',
      size: SYNTHETIC_GLB_AB.byteLength,
      engine: 'EEVEE',
      samples: 32,
      durationMs: 650,
      created: '2026-11-23T10:35:00Z',
    },
  ],
  sceneSummary: {
    capturedAt: '2026-11-23T10:30:00Z',
    blenderVersion: '4.3.2',
    engine: 'BLENDER_EEVEE_NEXT',
    objectCount: 5,
    meshCount: 2,
    lightCount: 2,
    cameraCount: 1,
    totalPolygons: 256,
    activeCamera: 'DSH_Camera',
    materials: ['Mat_Hero_Body', 'Mat_Studio_Stage'],
    collections: ['Scene Collection', 'DSH_Hero'],
    objects: [
      { name: 'Product_Body', type: 'MESH', location: [0, 0, 1.0], dimensions: [1.2, 1.2, 1.4], vertices: 128, polygons: 256 },
      { name: 'DSH_Camera', type: 'CAMERA', location: [4.2, -4.7, 3.0] },
    ],
    qc: {
      score: 96,
      grade: 'A',
      issues: [],
    },
  },
  checkpoints: [
    {
      id: '33333333-4444-4555-8666-777777777777',
      revision: 1,
      created: '2026-11-24T00:00:00Z',
      note: 'Initial clean pass',
      scriptMode: 'custom',
      scriptLength: 26,
      customScript: 'import bpy\nprint("cp-v1")\n',
      engine: 'EEVEE',
      samples: 32,
      qcScore: 96,
    },
  ],
}

const SAMPLE_ARCHIVED_PROJECT = {
  ...SAMPLE_PROJECT,
  id: '22222222-3333-4444-8555-666666666666',
  archived: true,
  title: '归档 3D 展台示例',
}

const SAMPLE_ENV = {
  ready: true,
  active: {
    path: 'C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe',
    version: '4.3.2',
    major: 4,
    minor: 3,
    source: 'standard',
    eeveeEngine: 'BLENDER_EEVEE_NEXT',
    greasePencilApi: 'gpv3',
  },
  detected: [
    {
      path: 'C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe',
      version: '4.3.2',
      major: 4,
      minor: 3,
      source: 'standard',
      eeveeEngine: 'BLENDER_EEVEE_NEXT',
      greasePencilApi: 'gpv3',
    },
  ],
  configuredPath: '',
  bridge: {
    host: '127.0.0.1',
    port: 9876,
    hasToken: false,
    connected: false,
  },
  polyHavenEnabled: false,
  computeDevice: 'auto',
  gpu: {
    available: true,
    backend: 'OPTIX',
    devices: ['NVIDIA GeForce RTX 4060 Laptop GPU'],
  },
  node: process.version,
  platform: process.platform,
  hint: '已就绪：Blender 4.3.2（BLENDER_EEVEE_NEXT / GPV3），支持无头 CLI 渲染与可选 Live Bridge 联动。',
}

test('built lib/client.js preserves all 13 bright themes, 8 font pairings, soft-slate dark mode, v3 motion primitives, and dsh-updates footer', () => {
  // Never too dark + soft breathable slate
  assert.match(BUNDLE, /body\[data-ds-dark-theme\] \[data-dsh-style="harness"\]/)
  assert.ok(BUNDLE.includes('#1f232b') && BUNDLE.includes('#272c36'), 'soft breathable slate tokens present')

  // All 13 switchable themes
  for (const preset of [
    'harness', 'cream', 'claude', 'pixel8bit', 'mint', 'glass', 'eink',
    'blueprint', 'risograph', 'win98', 'songhui', 'frutiger', 'gazette',
  ]) {
    assert.ok(BUNDLE.includes(`[data-dsh-style="${preset}"]`), `missing theme selector: ${preset}`)
  }

  // All 8 font pairings
  for (const fontId of ['arcade', 'songkai', 'fangsong', 'poster', 'retro98', 'serif', 'modern']) {
    assert.ok(BUNDLE.includes(`[data-dsh-font="${fontId}"]`), `missing font selector: ${fontId}`)
  }
  assert.ok(BUNDLE.includes('--dsh-font-display') && BUNDLE.includes('--dsh-font-body') && BUNDLE.includes('--dsh-font-mono'))

  // Layout, motion, clearances, accessibility, and update wrapper
  for (const marker of [
    '.dsh-header',
    '.dsh-tab-indicator',
    '.dsh-split-resizer',
    '.dsh-skeleton',
    '.dsh-row-actions',
    '--dsh-frame-top-clearance',
    '--dsh-frame-leading-clearance',
    'data-window-drag-exclude',
    'data-plugin-update-footer',
    '__stardustUpdatesInlinePage',
    '__stardustUpdatesGuard',
  ]) {
    assert.ok(BUNDLE.includes(marker), `missing required bundle marker: ${marker}`)
  }
  assert.match(BUNDLE, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  assert.match(BUNDLE, /@media\s*\(forced-colors:\s*active\)/)
})

test('full Workbench renders in jsdom: themes, fonts, Canvas 3D viewport, Studio/Form toggle, Outliner, Script, Assets/Exports, Bridge/Env, update footer, and Escape modal', async (t) => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://127.0.0.1:8181/',
    pretendToBeVisual: true,
  })

  // Stub Canvas 2D context so the 3D software renderer executes completely in jsdom
  let canvasDrawCalls = 0
  const fakeCtx2d = {
    setTransform() {},
    createLinearGradient() { return { addColorStop() {} } },
    fillRect() { canvasDrawCalls++ },
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() { canvasDrawCalls++ },
    stroke() { canvasDrawCalls++ },
    arc() {},
    fillText() { canvasDrawCalls++ },
    measureText(s) { return { width: String(s || '').length * 6 } },
    setLineDash() {},
    save() {},
    restore() {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
  }
  dom.window.HTMLCanvasElement.prototype.getContext = function getContext(kind) {
    return kind === '2d' ? fakeCtx2d : null
  }

  // Expose DOM globals for React 19 + ReactDOM
  const savedGlobals = new Map()
  const patchGlobal = (key, val) => {
    savedGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { value: val, configurable: true, writable: true })
  }
  patchGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  patchGlobal('window', dom.window)
  patchGlobal('document', dom.window.document)
  patchGlobal('navigator', dom.window.navigator)
  patchGlobal('HTMLElement', dom.window.HTMLElement)
  patchGlobal('SVGElement', dom.window.SVGElement)
  patchGlobal('Node', dom.window.Node)
  patchGlobal('Event', dom.window.Event)
  patchGlobal('CustomEvent', dom.window.CustomEvent)
  patchGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  patchGlobal('MouseEvent', dom.window.MouseEvent)
  patchGlobal('localStorage', dom.window.localStorage)

  const activeTimers = new Set()
  const trackedSetTimeout = (fn, ms, ...args) => {
    const id = setTimeout(() => {
      activeTimers.delete(id)
      fn(...args)
    }, ms)
    id.unref?.()
    activeTimers.add(id)
    return id
  }
  const trackedClearTimeout = (id) => {
    activeTimers.delete(id)
    clearTimeout(id)
  }

  let root
  const cleanups = []
  t.after(async () => {
    for (const id of activeTimers) clearTimeout(id)
    activeTimers.clear()
    if (root) {
      await act(async () => {
        root.unmount()
      })
    }
    for (const fn of cleanups.splice(0)) {
      try { fn() } catch {}
    }
    for (const id of activeTimers) clearTimeout(id)
    activeTimers.clear()
    dom.window.close()
    for (const [key, desc] of savedGlobals.entries()) {
      if (desc) Object.defineProperty(globalThis, key, desc)
      else delete globalThis[key]
    }
  })

  const apiCalls = []
  const fixedCheckedAt = Date.now()
  let currentEnv = { ...SAMPLE_ENV }
  const mockFetch = async (url, init) => {
    const u = String(url)
    if (u.includes('kind=artifact') && u.includes('77777777-6666-4555-8444-333333333333')) {
      return {
        ok: true,
        status: 200,
        headers: { get: (k) => (k.toLowerCase() === 'content-type' ? 'model/gltf-binary' : null) },
        arrayBuffer: async () => SYNTHETIC_GLB_AB.slice(0),
      }
    }
    if (u.includes('stardustlc/plugin-updates')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: {
            rows: [
              {
                name: 'dsh-blender-studio',
                version: '0.1.0',
                enabled: true,
                sourceKind: 'registry',
                label: 'Blender 3D',
                labelEn: 'Blender 3D',
                available: true,
                release: { version: '0.2.0', compatible: true },
                checkedAt: fixedCheckedAt,
              },
            ],
            preferences: { revision: 1, packages: {} },
            pages: { dirty: false, busy: false, known: true, clients: [] },
            activity: { busy: false, known: true },
            autoReady: true,
            job: null,
          },
        }),
      }
    }
    const body = init?.body ? JSON.parse(String(init.body)) : {}
    apiCalls.push({ url: u, headers: init?.headers || {}, body })
    if (body.action === 'get') {
      const found = body.id === SAMPLE_ARCHIVED_PROJECT.id ? { ...SAMPLE_ARCHIVED_PROJECT, archived: false } : SAMPLE_PROJECT
      return { ok: true, status: 200, json: async () => ({ ok: true, value: found }) }
    }
    if (body.action === 'restore') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: { ...SAMPLE_ARCHIVED_PROJECT, archived: false, revision: SAMPLE_ARCHIVED_PROJECT.revision + 1 },
        }),
      }
    }
    if (body.action === 'duplicate') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: { ...SAMPLE_PROJECT, id: '44444444-5555-4666-8777-888888888888', title: SAMPLE_PROJECT.title + ' (副本)' },
        }),
      }
    }
    if (body.action === 'pipeline') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: {
            id: '55555555-6666-4777-8888-999999999999',
            kind: 'pipeline',
            projectId: SAMPLE_PROJECT.id,
            revision: SAMPLE_PROJECT.revision,
            state: 'done',
            stageCode: 'done',
            stage: '全流程完成（生成 1 项成品 · QC-3D 96/A）',
            progress: 100,
            lines: ['pipeline complete'],
            pipeline: {
              qc: SAMPLE_PROJECT.sceneSummary.qc,
              artifactIds: [SAMPLE_PROJECT.artifacts[0].id],
              primaryRenderId: SAMPLE_PROJECT.artifacts[0].id,
            },
            startedAt: '2026-11-24T00:00:00Z',
            finishedAt: '2026-11-24T00:00:05Z',
          },
        }),
      }
    }
    if (body.action === 'save_checkpoint') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: {
            ...SAMPLE_PROJECT,
            revision: SAMPLE_PROJECT.revision + 1,
            checkpoints: [
              ...SAMPLE_PROJECT.checkpoints,
              {
                id: '66666666-7777-4888-8999-aaaaaaaaaaaa',
                revision: SAMPLE_PROJECT.revision,
                created: '2026-11-24T00:01:00Z',
                note: body.note || 'Manual snapshot',
                scriptMode: 'custom',
                scriptLength: 40,
                customScript: 'import bpy\nprint("saved")\n',
                engine: 'EEVEE',
                samples: 32,
                qcScore: 96,
              },
            ],
          },
        }),
      }
    }
    if (body.action === 'create_from_exemplar') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: { ...SAMPLE_PROJECT, id: '55555555-4444-4333-8222-111111111111', title: 'Exemplar: ' + body.exemplarId },
        }),
      }
    }
    if (body.action === 'bridge_install_addon') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: { installed: true, enabled: true, addonPath: 'dsh_blender_bridge.py', executablePath: 'blender.exe', output: 'ok' },
        }),
      }
    }
    if (body.action === 'configure') {
      currentEnv = { ...currentEnv, ...(body.computeDevice ? { computeDevice: body.computeDevice } : {}) }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true, value: currentEnv }),
      }
    }
    if (body.action === 'restore_checkpoint') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          value: {
            ...SAMPLE_PROJECT,
            revision: SAMPLE_PROJECT.revision + 2,
            scriptMode: 'custom',
            customScript: 'import bpy\nprint("cp-v1")\n',
          },
        }),
      }
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        value: {
          projects: [SAMPLE_PROJECT],
          archivedProjects: [SAMPLE_ARCHIVED_PROJECT],
          environment: currentEnv,
          exemplars: SAMPLE_EXEMPLARS,
          templates: [
            { id: 'product-studio', zh: '产品影棚', en: 'Product Studio', recommendedEngine: 'EEVEE' },
            { id: 'logo-3d', zh: '3D 立体徽标', en: '3D Logo & Title', recommendedEngine: 'EEVEE' },
            { id: 'isometric-room', zh: '等距微缩房间', en: 'Isometric Room', recommendedEngine: 'CYCLES' },
            { id: 'motion-data', zh: '动态 3D 数据柱', en: 'Motion Data Grid', recommendedEngine: 'EEVEE' },
            { id: 'grease-pencil-2d', zh: '蜡笔 2D / 三渲二', en: 'Grease Pencil 2D', recommendedEngine: 'EEVEE' },
            { id: 'blank-stage', zh: '空白校准舞台', en: 'Blank Studio Stage', recommendedEngine: 'EEVEE' },
            { id: 'architectural-pavilion', zh: '参数化建筑展馆', en: 'Architectural Pavilion', recommendedEngine: 'CYCLES' },
            { id: 'procedural-abstract', zh: '程序化几何雕塑', en: 'Procedural GeoNodes Art', recommendedEngine: 'EEVEE' },
          ],
          jobs: [],
        },
      }),
    }
  }

  let loadedEntry
  dom.window.__ModuleLoader__ = {
    load(entry) {
      loadedEntry = entry
    },
  }

  runInNewContext(BUNDLE, {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    localStorage: dom.window.localStorage,
    CustomEvent: dom.window.CustomEvent,
    Event: dom.window.Event,
    KeyboardEvent: dom.window.KeyboardEvent,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    fetch: mockFetch,
    crypto: globalThis.crypto,
    AbortController,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    ArrayBuffer,
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Float32Array,
    Int32Array,
    DataView,
    setTimeout: trackedSetTimeout,
    clearTimeout: trackedClearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    console,
  })

  assert.ok(loadedEntry, 'client bundle loaded via __ModuleLoader__.load')
  const requested = []
  const plugin = loadedEntry.factory((name) => {
    requested.push(name)
    if (name === 'react') return React
    throw new Error('Module not mounted: ' + name)
  })
  assert.deepEqual([...new Set(requested)], ['react'], 'zero eager ui-primitives require at factory time')

  const registrations = []
  const locale = { getSnapshot: () => ({ active: 'zh' }) }
  const hostCtx = {
    locale,
    get: () => locale,
    effect(fn) {
      const dispose = fn?.()
      if (typeof dispose === 'function') cleanups.push(dispose)
    },
    slots: {
      inject(_name, fn) { fn() },
      register(meta, component) {
        registrations.push({ meta, component })
        return () => {}
      },
    },
    inject(_deps, fn) {
      fn(hostCtx)
    },
    plugin(def) {
      def?.apply?.(hostCtx)
      return { dispose() {} }
    },
  }
  hostCtx.root = hostCtx

  plugin.apply(hostCtx)

  const mainSlot = registrations.find((r) => r.meta.name === 'main')
  assert.ok(mainSlot)

  const container = dom.window.document.getElementById('root')
  root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(mainSlot.component, { workbench: true, locale }))
  })
  await act(async () => {
    await new Promise((r) => setTimeout(r, 40))
  })

  // 1. Default airy theme & arcade font + update footer + CSRF header sent
  const rootSection = container.querySelector('section[data-dsh-style]')
  assert.ok(rootSection, 'root section with data-dsh-style rendered')
  assert.equal(rootSection.getAttribute('data-dsh-style'), 'harness')
  assert.equal(rootSection.getAttribute('data-dsh-font'), 'arcade')
  assert.equal(rootSection.getAttribute('data-main'), 'true')

  assert.ok(
    apiCalls.some((c) => c.headers['x-dsh-blender-studio'] === '1'),
    'client API calls include x-dsh-blender-studio: 1 CSRF header',
  )

  const updateFooter = container.querySelector('[data-plugin-update-footer="dsh-blender-studio"]')
  assert.ok(updateFooter, '[data-plugin-update-footer="dsh-blender-studio"] is rendered by __stardustUpdatesInlinePage')

  // 2. Test 13-theme StyleSwitcher & 8-font FontSwitcher interactively
  const styleTrigger = container.querySelector('button.dsh-style-trigger')
  assert.ok(styleTrigger, 'StyleSwitcher trigger present')
  await act(async () => {
    styleTrigger.click()
  })
  const styleItems = [...container.querySelectorAll('[role="menuitemradio"]')]
  assert.equal(styleItems.length, 13, 'all 13 theme presets appear in StyleSwitcher menu')
  const blueprintItem = styleItems.find((el) => /晒图|Blueprint/i.test(el.textContent || ''))
  assert.ok(blueprintItem, 'Blueprint preset found')
  await act(async () => {
    blueprintItem.click()
  })
  assert.equal(rootSection.getAttribute('data-dsh-style'), 'blueprint')
  assert.equal(dom.window.localStorage.getItem('dsh-stardust:ui-style'), 'blueprint')

  const fontTrigger = container.querySelector('button.dsh-font-trigger')
  assert.ok(fontTrigger, 'FontSwitcher trigger present')
  await act(async () => {
    fontTrigger.click()
  })
  const fontItems = [...container.querySelectorAll('[role="menuitemradio"]')]
  assert.equal(fontItems.length, 8, 'all 8 font presets appear in FontSwitcher menu')
  const songkaiItem = fontItems.find((el) => /中宋|Song/i.test(el.textContent || ''))
  assert.ok(songkaiItem, 'Song + Kai font preset found')
  await act(async () => {
    songkaiItem.click()
  })
  assert.equal(rootSection.getAttribute('data-dsh-font'), 'songkai')
  assert.equal(dom.window.localStorage.getItem('dsh-stardust:ui-font'), 'songkai')

  // 2b. Regression check (v0.1.1): Archived project cards keep .dsh-row-actions always visible
  const libTabs = [...container.querySelectorAll('.dsh-header [role="tab"]')]
  const archivesTab = libTabs.find((el) => /已归档|Archived/.test(el.textContent || ''))
  assert.ok(archivesTab, 'Archived library tab exists')
  await act(async () => {
    archivesTab.click()
  })
  const archivedCardActions = container.querySelector('.bl-project-card.dsh-row .dsh-row-actions')
  assert.ok(archivedCardActions, 'Archived project card renders .dsh-row-actions')
  assert.equal(
    archivedCardActions.getAttribute('data-always-visible'),
    'true',
    'Archived project card .dsh-row-actions must set data-always-visible="true" so Restore is clickable without hover',
  )
  const projectsTab = libTabs.find((el) => /3D 工程|Projects/.test(el.textContent || ''))
  assert.ok(projectsTab, 'Active Projects library tab exists')
  await act(async () => {
    projectsTab.click()
  })

  // 2c. v0.2.0 Duplicate quick action on active project card
  const dupBtn = container.querySelector('button[data-action="duplicate"]')
  assert.ok(dupBtn, 'Duplicate quick action button renders on active project card')
  await act(async () => {
    dupBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })
  assert.ok(apiCalls.some((c) => c.body.action === 'duplicate' && c.body.id === SAMPLE_PROJECT.id), 'Duplicate invokes POST { action: "duplicate" }')

  // Return to library if duplicate opened cloned project, then open SAMPLE_PROJECT
  const backAfterDup = [...container.querySelectorAll('.dsh-header button')].find((b) => /返回|Back/.test(b.textContent || ''))
  if (backAfterDup) {
    await act(async () => {
      backAfterDup.click()
      await new Promise((r) => setTimeout(r, 20))
    })
  }

  // 2d. v0.3.0 Pro Engineering Exemplars strip + 1-click create_from_exemplar
  const exemplarsStrip = container.querySelector('[data-exemplars-strip="true"]')
  assert.ok(exemplarsStrip, 'Pro Exemplars strip renders in Project Library')
  const exemplarBtns = [...exemplarsStrip.querySelectorAll('button[data-action="create-exemplar"]')]
  assert.equal(exemplarBtns.length, 4, 'all 4 Pro Exemplar cards render 1-click create buttons')
  await act(async () => {
    exemplarBtns[3].click() // kuka-6axis-robot-arm
    await new Promise((r) => setTimeout(r, 30))
  })
  assert.ok(
    apiCalls.some((c) => c.body.action === 'create_from_exemplar' && c.body.exemplarId === 'kuka-6axis-robot-arm'),
    'Clicking Pro Exemplar card invokes POST { action: "create_from_exemplar" }',
  )
  const backAfterExemplar = [...container.querySelectorAll('.dsh-header button')].find((b) => /返回|Back/.test(b.textContent || ''))
  if (backAfterExemplar) {
    await act(async () => {
      backAfterExemplar.click()
      await new Promise((r) => setTimeout(r, 20))
    })
  }

  // Direct pure-JS binary .glb parser check (v0.3.0)
  assert.ok(dom.window.__DSH_BLENDER_GLB__?.parseGlbMesh, 'pure-JS parseGlbMesh exported on window.__DSH_BLENDER_GLB__')
  const parsedGlb = dom.window.__DSH_BLENDER_GLB__.parseGlbMesh(SYNTHETIC_GLB_AB)
  assert.equal(parsedGlb.vertexCount, 4, 'parsed tetrahedron vertexCount === 4')
  assert.equal(parsedGlb.triangleCount, 4, 'parsed tetrahedron triangleCount === 4')
  assert.equal(parsedGlb.renderedTriangles, 4, 'parsed tetrahedron renderedTriangles === 4')
  assert.ok(parsedGlb.dimensions && parsedGlb.dimensions[0] > 0 && parsedGlb.dimensions[1] > 0 && parsedGlb.dimensions[2] > 0, 'parsed GLB computes valid dimensions')
  assert.throws(() => dom.window.__DSH_BLENDER_GLB__.parseGlbMesh(new ArrayBuffer(8)), 'parseGlbMesh rejects malformed buffer')

  // 3. Open the project from the library -> OP-DSH 3D Studio Console + Canvas 3D viewport
  const openBtn = container.querySelector('button.w-row-button')
  assert.ok(openBtn, 'project row button present in library')
  await act(async () => {
    openBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })

  assert.ok(container.querySelector('[data-studio-console="true"]'), 'Studio console renders by default')
  const canvas = container.querySelector('canvas.bl-stage-canvas')
  assert.ok(canvas, 'Canvas 3D viewport renders in Studio mode')
  assert.ok(canvasDrawCalls > 10, `Canvas 3D renderer drew frame (${canvasDrawCalls} calls)`)

  // 3b. v0.2.0: 8 templates, Quality Presets, Pipeline Bar, and Studio Keyboard Shortcuts
  const tplGroup = container.querySelector('[aria-label="场景模板选择"], [aria-label="Template selection"]')
  assert.ok(tplGroup, 'Template selection pill group renders')
  const tplButtons = [...tplGroup.querySelectorAll('button.bl-tpl-pill')]
  assert.equal(tplButtons.length, 8, 'all 8 templates render in Studio inspector')

  // Trigger Pipeline button BEFORE making edits (pipeline requires clean saved state)
  const pipelineBar = container.querySelector('[data-pipeline-bar="true"]')
  assert.ok(pipelineBar, 'Production Pipeline bar renders in Studio')
  const beautyTierBtn = pipelineBar.querySelector('button[data-pipeline-tier="beauty"]')
  assert.ok(beautyTierBtn, 'Beauty Cycles pipeline tier selector renders')
  await act(async () => {
    beautyTierBtn.click()
  })
  const runPipelineBtn = [...pipelineBar.querySelectorAll('button')].find((b) => /一键全流程|Run Pipeline/.test(b.textContent || ''))
  assert.ok(runPipelineBtn, 'Run Pipeline button renders')
  await act(async () => {
    runPipelineBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })
  assert.ok(
    apiCalls.some((c) => c.body.action === 'pipeline' && c.body.qualityTier === 'beauty'),
    'Run Pipeline invokes POST { action: "pipeline", qualityTier: "beauty" }',
  )

  // Keyboard shortcuts: Space toggles turntable, '2' switches to Still, '1' back to Stage, 'R' resets orbit
  assert.ok(container.querySelector('[data-shortcut-bar="true"]'), 'Keyboard shortcut hint bar renders')
  const turntableBtn = container.querySelector('button.bl-turntable-btn')
  assert.equal(turntableBtn?.getAttribute('data-playing'), 'false')
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }))
  })
  assert.equal(container.querySelector('button.bl-turntable-btn')?.getAttribute('data-playing'), 'true', 'Space toggles turntable playback')
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'r', bubbles: true }))
  })
  assert.equal(container.querySelector('button.bl-turntable-btn')?.getAttribute('data-playing'), 'false', 'R resets camera and stops turntable')
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: '2', bubbles: true }))
  })
  const viewTabsAfter2 = [...container.querySelectorAll('.bl-stage-view-tabs button')]
  assert.equal(viewTabsAfter2[1]?.getAttribute('aria-selected'), 'true', 'Key 2 switches monitor to Still view')
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: '1', bubbles: true }))
  })
  assert.equal(
    container.querySelectorAll('.bl-stage-view-tabs button')[0]?.getAttribute('aria-selected'),
    'true',
    'Key 1 switches monitor back to 3D Stage',
  )

  // Quality Presets (Draft / Studio / Cycles) + new template Canvas rendering
  const qualityBar = container.querySelector('[data-quality-presets="true"]')
  assert.ok(qualityBar, 'One-click Quality Presets bar renders')
  const qualityBtns = [...qualityBar.querySelectorAll('button[data-quality-preset]')]
  assert.equal(qualityBtns.length, 3, '3 Quality Presets (Draft / Studio / Cycles) render')
  await act(async () => {
    qualityBar.querySelector('button[data-quality-preset="cycles"]').click()
  })
  assert.match(container.querySelector('.bl-stage-readout')?.textContent || '', /CYCLES.*128 spp/)
  const drawsBeforeNewTpl = canvasDrawCalls
  await act(async () => {
    tplButtons[6].click() // architectural-pavilion
  })
  await act(async () => {
    tplButtons[7].click() // procedural-abstract
  })
  assert.ok(canvasDrawCalls > drawsBeforeNewTpl, 'new v0.2.0 templates draw Canvas 3D geometry')
  // Discard dirty edits so Export modal / Assets & Exports stay clean
  const discardBtn = [...container.querySelectorAll('button')].find((b) => /放弃未保存修改|Discard changes/.test(b.textContent || ''))
  if (discardBtn) {
    await act(async () => {
      discardBtn.click()
    })
  }

  // 3c. v0.3.0 Interactive 3D Mesh (.glb) viewer + Shaded/Clay/Wire switcher + A/B Compare split-wipe
  const meshTabBtn = container.querySelector('button[data-stage-view="mesh"]')
  assert.ok(meshTabBtn, '3D Mesh (.glb) monitor view tab renders')
  await act(async () => {
    meshTabBtn.click()
    await new Promise((r) => setTimeout(r, 60))
  })
  const glbStats = container.querySelector('[data-glb-stats="true"]')
  assert.ok(glbStats, '3D Mesh viewer loads synthetic .glb and renders [data-glb-stats="true"]')
  assert.match(glbStats.textContent || '', /4\s*tris|model\.glb/i)
  const clayBtn = container.querySelector('button[data-glb-shading="clay"]')
  const wireBtn = container.querySelector('button[data-glb-shading="wireframe"]')
  assert.ok(clayBtn && wireBtn, 'Shaded / Clay / Wire shading buttons render in 3D Mesh view')
  await act(async () => {
    clayBtn.click()
  })
  assert.equal(clayBtn.getAttribute('aria-pressed'), 'true')
  await act(async () => {
    wireBtn.click()
  })
  assert.equal(wireBtn.getAttribute('aria-pressed'), 'true')

  const compareTabBtn = container.querySelector('button[data-stage-view="compare"]')
  assert.ok(compareTabBtn, 'A/B Compare monitor view tab renders when >=2 image artifacts exist')
  await act(async () => {
    compareTabBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })
  assert.ok(container.querySelector('[data-compare-select="a"]'), 'A/B Compare select A renders')
  assert.ok(container.querySelector('[data-compare-select="b"]'), 'A/B Compare select B renders')
  const compareSlider = container.querySelector('[data-compare-slider="true"][role="slider"]')
  assert.ok(compareSlider, 'A/B Compare accessible role="slider" wipe handle renders')
  const beforePct = Number(compareSlider.getAttribute('aria-valuenow'))
  await act(async () => {
    compareSlider.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  })
  assert.ok(Number(compareSlider.getAttribute('aria-valuenow')) > beforePct, 'ArrowRight increases A/B compare split percentage')
  await act(async () => {
    compareSlider.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
  })
  assert.equal(Number(compareSlider.getAttribute('aria-valuenow')), beforePct, 'ArrowLeft restores A/B compare split percentage')

  // Return monitor to 3D Stage
  await act(async () => {
    container.querySelector('button[data-stage-view="stage"]')?.click()
  })

  // 4. Studio / Form mode toggle
  const formToggle = container.querySelector('button[data-studio-mode="form"]')
  assert.ok(formToggle, 'Form mode toggle button renders')
  await act(async () => {
    formToggle.click()
  })
  assert.ok(container.querySelector('[role="separator"]'), 'Form mode renders DshSplitResizer separator')
  const studioToggle = container.querySelector('button[data-studio-mode="studio"]')
  await act(async () => {
    studioToggle.click()
  })
  assert.ok(container.querySelector('[data-studio-console="true"]'), 'toggles back to Studio mode')

  // 5. Scene Outliner (with QC-3D badge) & Script tabs (with DSH_KIT snippets & Checkpoints) in inspector
  const inspectorTabs = [...container.querySelectorAll('button.bl-inspector-tab')]
  assert.equal(inspectorTabs.length, 3, 'Inspector has Params, Outliner, Script tabs')

  await act(async () => {
    inspectorTabs[1].click() // Outliner
  })
  assert.match(container.textContent || '', /Product_Body/)
  assert.match(container.textContent || '', /256/)
  const qcBadge = container.querySelector('[data-qc-badge="true"]')
  assert.ok(qcBadge, 'QC-3D badge renders in Scene Outliner')
  assert.equal(qcBadge.getAttribute('data-qc-tone'), 'good')
  assert.match(qcBadge.textContent || '', /QC-3D.*96\/100.*A/)

  await act(async () => {
    inspectorTabs[2].click() // Script
  })
  const scriptEditor = container.querySelector('textarea.bl-code-editor')
  assert.ok(scriptEditor, 'bpy script editor textarea renders')

  // DSH_KIT v2 quick-insert bar (13 chips) & Script Checkpoints
  const kitBar = container.querySelector('[data-dsh-kit-bar="true"]')
  assert.ok(kitBar, 'DSH_KIT quick-insert bar renders in Script tab')
  const kitChips = [...kitBar.querySelectorAll('button[data-kit-snippet]')]
  assert.equal(kitChips.length, 13, '13 DSH_KIT v2 quick-insert snippet chips render')
  for (const snippetKey of ['loft_profile', 'bolt_ring', 'wheel_assembly', 'heat_blued_titanium', 'anodized_metal', 'clay_override']) {
    assert.ok(kitBar.querySelector(`button[data-kit-snippet="${snippetKey}"]`), `DSH_KIT v2 chip ${snippetKey} renders`)
  }
  await act(async () => {
    kitChips[0].click()
  })
  assert.match(container.querySelector('textarea.bl-code-editor')?.value || '', /dsh_mat_/)

  const cpCard = container.querySelector('[data-checkpoints="true"]')
  assert.ok(cpCard, 'Script Checkpoints card renders')
  assert.match(cpCard.textContent || '', /Initial clean pass/)
  const saveCpBtn = cpCard.querySelector('button[data-action="save-checkpoint"]')
  assert.ok(saveCpBtn, 'Save Snapshot button renders')
  await act(async () => {
    saveCpBtn.click()
    await new Promise((r) => setTimeout(r, 20))
  })
  assert.ok(apiCalls.some((c) => c.body.action === 'save_checkpoint'), 'Save Snapshot invokes save_checkpoint')

  const restoreCpBtn = cpCard.querySelector('button[data-action="restore-checkpoint"]')
  assert.ok(restoreCpBtn, 'Restore checkpoint button renders')
  await act(async () => {
    restoreCpBtn.click()
    await new Promise((r) => setTimeout(r, 20))
  })
  assert.ok(apiCalls.some((c) => c.body.action === 'restore_checkpoint'), 'Restore button invokes restore_checkpoint')

  // Discard any script dirty state before opening Export modal
  await act(async () => {
    inspectorTabs[0].click()
  })
  const discardAfterScript = [...container.querySelectorAll('button')].find((b) => /放弃未保存修改|Discard changes/.test(b.textContent || ''))
  if (discardAfterScript) {
    await act(async () => {
      discardAfterScript.click()
    })
  }

  // 6. Export modal opens and closes cleanly on Escape key
  const exportBtn = [...container.querySelectorAll('.bl-stage-actions button')].find((b) =>
    /导出模型|Export 3D/.test(b.textContent || ''),
  )
  assert.ok(exportBtn, 'Export 3D button renders in stage actions')
  await act(async () => {
    exportBtn.click()
  })
  const dialog = container.querySelector('[role="dialog"]:not([data-tour-card])')
  assert.ok(dialog, 'Export 3D modal dialog opens')
  await act(async () => {
    dialog.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  })
  assert.equal(
    container.querySelectorAll('[role="dialog"]:not([data-tour-card])').length,
    0,
    'Escape closes modal cleanly',
  )

  // 7. Assets & Exports tab
  const headerTabs = [...container.querySelectorAll('.dsh-header [role="tab"]')]
  const assetsTab = headerTabs.find((el) => /素材与成品|素材与导出|Assets/.test(el.textContent || ''))
  assert.ok(assetsTab, 'Assets & Exports header tab exists')
  await act(async () => {
    assetsTab.click()
  })
  assert.match(container.textContent || '', /studio_soft\.hdr/)
  assert.match(container.textContent || '', /Poly Haven/)
  assert.ok(container.querySelector('[data-dropzone="true"]'), 'Drag-and-Drop asset dropzone renders in Assets & Exports')
  assert.ok(container.querySelector('a[href*="kind=source"]'), 'Source ZIP backup link renders')
  const assetArtifactActions = [...container.querySelectorAll('.bl-ae-row .dsh-row-actions')]
  assert.ok(
    assetArtifactActions.length >= 2,
    `Expected both asset and artifact rows to render .dsh-row-actions (found ${assetArtifactActions.length})`,
  )
  for (const actionsEl of assetArtifactActions) {
    assert.equal(
      actionsEl.getAttribute('data-always-visible'),
      'true',
      'Asset/artifact row .dsh-row-actions must set data-always-visible="true"',
    )
  }

  // 8. Bridge & Environment tab (including v0.3.0 Cycles GPU badge, computeDevice selector & 1-click Bridge installer)
  const bridgeTab = headerTabs.find((el) => /桥接与环境|Bridge/.test(el.textContent || ''))
  assert.ok(bridgeTab, 'Bridge & Environment header tab exists')
  await act(async () => {
    bridgeTab.click()
  })
  assert.match(container.textContent || '', /Live Socket Bridge/)
  assert.ok(container.querySelector('a[href*="kind=addon"]'), 'dsh_blender_bridge.py download link renders')
  assert.match(container.textContent || '', /4\.3\.2/)

  const gpuBadge = container.querySelector('[data-gpu-badge="true"]')
  assert.ok(gpuBadge, 'Cycles GPU badge renders in Bridge & Env')
  assert.match(gpuBadge.textContent || '', /OPTIX.*RTX 4060/)

  const cpuBtn = container.querySelector('button[data-compute-device="cpu"]')
  assert.ok(cpuBtn, 'Cycles computeDevice CPU selector button renders')
  await act(async () => {
    cpuBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })
  assert.ok(
    apiCalls.some((c) => c.body.action === 'configure' && c.body.computeDevice === 'cpu'),
    'Selecting computeDevice invokes POST { action: "configure", computeDevice: "cpu" }',
  )

  const installAddonBtn = container.querySelector('button[data-action="bridge-install-addon"]')
  assert.ok(installAddonBtn, 'One-click Install Add-on button renders in Bridge & Env')
  await act(async () => {
    installAddonBtn.click()
  })
  const installDialog = container.querySelector('[data-bridge-install-dialog="true"]')
  assert.ok(installDialog, 'Install Add-on confirmation dialog opens')
  const confirmInstallBtn = [...installDialog.querySelectorAll('button')].find((b) => /确认安装|Install Now|Confirm/i.test(b.textContent || ''))
  assert.ok(confirmInstallBtn, 'Confirm install button present in dialog')
  await act(async () => {
    confirmInstallBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })
  assert.ok(
    apiCalls.some((c) => c.body.action === 'bridge_install_addon' && c.body.confirmed === true),
    'Confirming install dialog invokes POST { action: "bridge_install_addon", confirmed: true }',
  )

  // 9. English (en-US) locale: header, completed pipeline banner, and Bridge/Env summary have ZERO Chinese leakage (v0.2.1)
  const enLocale = { getSnapshot: () => ({ active: 'en-US' }) }
  await act(async () => {
    root.render(React.createElement(mainSlot.component, { workbench: true, locale: enLocale }))
    await new Promise((r) => setTimeout(r, 30))
  })
  const enHeaderText = container.querySelector('.dsh-header')?.textContent || ''
  assert.match(enHeaderText, /Blender (3D )?Studio/)
  assert.match(enHeaderText, /Studio|Projects/)
  assert.match(enHeaderText, /Assets/)
  assert.match(enHeaderText, /Bridge & Env/)

  const enPipelineBanner = container.querySelector('.dbw-job-banner')
  assert.ok(enPipelineBanner, 'completed pipeline banner remains visible in en-US')
  const enPipelineText = enPipelineBanner.textContent || ''
  assert.match(enPipelineText, /Completed \(1 artifact · QC-3D 96\/A\)/)
  assert.doesNotMatch(enPipelineText, /[\u3400-\u9fff]/, 'en-US completed pipeline banner must contain zero Chinese characters')

  const enEnvSummary = container.querySelector('[data-env-summary="true"]')
  assert.ok(enEnvSummary, 'Bridge & Env [data-env-summary="true"] renders')
  const enEnvSummaryText = enEnvSummary.textContent || ''
  assert.match(enEnvSummaryText, /Ready: Blender 4\.3\.2 \(EEVEE Next · GPv3\)/)
  assert.doesNotMatch(enEnvSummaryText, /[\u3400-\u9fff]/, 'en-US Bridge & Env status summary must contain zero Chinese characters')

  const enGpuBadgeText = container.querySelector('[data-gpu-badge="true"]')?.textContent || ''
  assert.match(enGpuBadgeText, /OPTIX/)
  assert.doesNotMatch(enGpuBadgeText, /[\u3400-\u9fff]/, 'en-US GPU badge must contain zero Chinese characters')
  const enBridgeInstallText = container.querySelector('button[data-action="bridge-install-addon"]')?.textContent || ''
  assert.doesNotMatch(enBridgeInstallText, /[\u3400-\u9fff]/, 'en-US Install Add-on button must contain zero Chinese characters')

  // 10. v0.2.1 regression: restoring an archived project after switching tabs resets editorTab back to studio
  const enHeaderTabs = [...container.querySelectorAll('.dsh-header [role="tab"]')]
  const enAssetsTab = enHeaderTabs.find((el) => /Assets/.test(el.textContent || ''))
  assert.ok(enAssetsTab, 'Assets tab found in en-US')
  await act(async () => {
    enAssetsTab.click()
  })
  assert.equal(enAssetsTab.getAttribute('aria-selected'), 'true', 'switched to Assets tab before returning to library')

  const backToLibBtn = [...container.querySelectorAll('.dsh-header button')].find((b) => /Back|返回/.test(b.textContent || ''))
  assert.ok(backToLibBtn, 'Back button found in header')
  await act(async () => {
    backToLibBtn.click()
    await new Promise((r) => setTimeout(r, 30))
  })
  const enExemplarsText = container.querySelector('[data-exemplars-strip="true"]')?.textContent || ''
  assert.match(enExemplarsText, /Pro Exemplars|AERO-X900/)
  assert.doesNotMatch(enExemplarsText, /[\u3400-\u9fff]/, 'en-US Pro Exemplars strip must contain zero Chinese characters')
  const enLibTabs = [...container.querySelectorAll('.dsh-header [role="tab"]')]
  const enArchivedTab = enLibTabs.find((el) => /Archived|已归档/.test(el.textContent || ''))
  assert.ok(enArchivedTab, 'Archived library tab found')
  await act(async () => {
    enArchivedTab.click()
  })
  const restoreBtn = [...container.querySelectorAll('.bl-project-card.dsh-row .dsh-row-actions button')].find((b) =>
    /Restore|恢复/.test(b.textContent || ''),
  )
  assert.ok(restoreBtn, 'Restore button found on archived project card')
  await act(async () => {
    restoreBtn.click()
    await new Promise((r) => setTimeout(r, 40))
  })
  assert.ok(
    apiCalls.some((c) => c.body.action === 'restore' && c.body.id === SAMPLE_ARCHIVED_PROJECT.id),
    'Restore button invokes POST { action: "restore" }',
  )
  assert.ok(
    container.querySelector('[data-studio-console="true"]'),
    'Restoring an archived project after switching tabs must land back on 3D Studio tab',
  )
  const studioTabAfterRestore = [...container.querySelectorAll('.dsh-header [role="tab"]')].find((el) =>
    /3D Studio|Studio|3D 工作室/.test(el.textContent || ''),
  )
  assert.equal(
    studioTabAfterRestore?.getAttribute('aria-selected'),
    'true',
    '3D Studio header tab must be aria-selected="true" after restore',
  )
})
