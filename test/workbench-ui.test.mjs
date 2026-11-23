import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

const BUNDLE = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

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
  },
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
  node: process.version,
  platform: process.platform,
  hint: 'Ready',
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
  const mockFetch = async (url, init) => {
    const u = String(url)
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
      return { ok: true, status: 200, json: async () => ({ ok: true, value: SAMPLE_PROJECT }) }
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        value: {
          projects: [SAMPLE_PROJECT],
          archivedProjects: [SAMPLE_ARCHIVED_PROJECT],
          environment: SAMPLE_ENV,
          templates: [
            { id: 'product-studio', zh: '产品棚拍展台', en: 'Product Studio', recommendedEngine: 'EEVEE' },
            { id: 'logo-3d', zh: '3D 立体标题', en: '3D Logo & Title', recommendedEngine: 'EEVEE' },
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

  // 5. Scene Outliner & Script tabs in inspector
  const inspectorTabs = [...container.querySelectorAll('button.bl-inspector-tab')]
  assert.equal(inspectorTabs.length, 3, 'Inspector has Params, Outliner, Script tabs')

  await act(async () => {
    inspectorTabs[1].click() // Outliner
  })
  assert.match(container.textContent || '', /Product_Body/)
  assert.match(container.textContent || '', /256/)

  await act(async () => {
    inspectorTabs[2].click() // Script
  })
  const scriptEditor = container.querySelector('textarea.bl-code-editor')
  assert.ok(scriptEditor, 'bpy script editor textarea renders')

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

  // 8. Bridge & Environment tab
  const bridgeTab = headerTabs.find((el) => /桥接与环境|Bridge/.test(el.textContent || ''))
  assert.ok(bridgeTab, 'Bridge & Environment header tab exists')
  await act(async () => {
    bridgeTab.click()
  })
  assert.match(container.textContent || '', /Live Socket Bridge/)
  assert.ok(container.querySelector('a[href*="kind=addon"]'), 'dsh_blender_bridge.py download link renders')
  assert.match(container.textContent || '', /4\.3\.2/)
})
