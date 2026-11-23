import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

test('browser bundle activates with ZERO eager ui-primitives require and registers main, sidebar, and settings slots with bilingual labels', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

  let definition
  let client
  let active = 'en'
  const requestedModules = []

  const react = {
    createElement: (type, props, ...children) => ({ type, props, children }),
    useEffect() {},
    useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
    useRef: (v) => ({ current: v }),
  }

  runInNewContext(bundle, {
    window: {
      __ModuleLoader__: {
        load(entry) {
          definition = entry
          client = entry.factory((name) => {
            requestedModules.push(name)
            if (name === 'react') return react
            throw new Error('Unexpected eager UI dependency: ' + name)
          })
        },
      },
    },
  })

  assert.equal(definition.id, pkg.name)
  assert.deepEqual([...new Set(requestedModules)], ['react'], 'must ONLY require react eagerly at load time')
  assert.equal(
    requestedModules.includes('@deepseek-ai/dsh-client-ui-primitives'),
    false,
    'must NEVER require @deepseek-ai/dsh-client-ui-primitives eagerly',
  )

  const registrations = []
  const locale = { getSnapshot: () => ({ active }) }
  client.apply({
    locale,
    get: () => locale,
    effect(fn, label) {
      if (label?.endsWith(': locale')) return fn()
    },
    slots: {
      inject(_name, fn) {
        fn()
      },
      register(meta, component) {
        registrations.push({ meta, component })
        return () => {}
      },
    },
  })

  assert.equal(
    requestedModules.includes('@deepseek-ai/dsh-client-ui-primitives'),
    false,
    'must NEVER require @deepseek-ai/dsh-client-ui-primitives eagerly during apply()',
  )

  const main = registrations.find((row) => row.meta.name === 'main')
  const sidebar = registrations.find((row) => row.meta.name === 'sidebar.panellist')
  const settings = registrations.find((row) => row.meta.name === 'settings.section')

  assert.ok(main, 'registers main slot')
  assert.ok(sidebar, 'registers sidebar.panellist slot')
  assert.ok(settings, 'registers settings.section slot')
  assert.equal(main.meta.key, 'dsh-blender-studio.workbench')
  assert.equal(main.meta.key, sidebar.meta.id)
  assert.equal(settings.meta.id, 'dsh-blender-studio')
  assert.equal(main.meta.inject().workbench, true)
  assert.equal(typeof main.component, 'function')
  assert.equal(typeof settings.component, 'function')

  // Bilingual zh/en label verification
  active = 'en'
  const enLabel = sidebar.meta.label()
  assert.ok(enLabel && enLabel.includes('Blender'))
  assert.doesNotMatch(enLabel, /[\u3400-\u9fff]/, 'en label must not contain CJK characters')

  active = 'zh'
  const zhLabel = sidebar.meta.label()
  assert.ok(zhLabel && zhLabel.includes('Blender'))
  assert.match(zhLabel, /[\u3400-\u9fff]/, 'zh label must include Chinese label')
})
