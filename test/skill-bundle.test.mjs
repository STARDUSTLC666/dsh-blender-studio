import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSkillBundle, parseSkillFile } from '../lib/skill-bundle.js'
import {
  apply,
  bundledAddonPath,
  bundledSkillsDir,
  checkBundledSkills,
  inject,
  name as pluginName,
  SKILL_NAMES,
} from '../lib/index.js'

const EXPECTED_SKILLS = [
  'blender-scene-architecture',
  'blender-bpy-scripting',
  'blender-materials-lighting',
  'blender-geometry-nodes',
  'blender-camera-animation',
  'blender-rendering-export',
  'blender-grease-pencil',
  'blender-visual-qc',
]

function skillDoc(name, body = '# Instructions\nUse this skill.', description = 'A useful skill') {
  return `---\nname: ${name}\ndescription: ${description}\n---\n${body}\n`
}

function makeWorld(t, names = ['alpha', 'beta'], behavior = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-blender-studio-skill-bundle-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const write = (name, text) => {
    mkdirSync(join(directory, name), { recursive: true })
    writeFileSync(join(directory, name, 'SKILL.md'), text)
  }
  for (const name of names) write(name, skillDoc(name))

  const registered = new Map()
  const tools = new Map()
  const listeners = []
  const removed = []
  const warnings = []
  let calls = 0

  const ctx = {
    skills: {
      register(definition) {
        calls += 1
        if (behavior.fail === definition.name) throw new Error('Registry refused ' + definition.name)
        if (behavior.noop === definition.name) return () => {}
        registered.set(definition.name, definition)
        return () => {
          removed.push(definition.name)
          if (behavior.failDispose === definition.name) throw new Error('Disposal failed')
          registered.delete(definition.name)
        }
      },
      get(name) {
        return registered.get(name)
      },
    },
    tools: {
      register(definition) {
        if (behavior.failHealth) throw new Error('Health registration failed')
        tools.set(definition.name, definition)
        return () => tools.delete(definition.name)
      },
    },
    on(event, listener) {
      if (event === 'dispose') listeners.push(listener)
      return () => {}
    },
    logger: {
      warn(message) {
        warnings.push(message)
      },
    },
  }

  const bundle = createSkillBundle({
    plugin: 'fixture-bundle',
    healthTool: 'fixture_health',
    names,
    directory: () => directory,
  })

  return {
    directory,
    write,
    bundle,
    ctx,
    registered,
    tools,
    removed,
    warnings,
    apply: () => bundle.apply(ctx),
    dispose: () => {
      for (const listener of listeners) listener()
    },
    health: () => tools.get('fixture_health').execute({}),
    calls: () => calls,
  }
}

test('dsh-blender-studio exports exact Cordis metadata and all 8 bundled SKILL.md files pass checkBundledSkills()', () => {
  assert.equal(pluginName, 'blender-studio')
  assert.deepEqual(inject, ['skills', 'tools'])
  assert.deepEqual([...SKILL_NAMES], EXPECTED_SKILLS)
  assert.ok(bundledSkillsDir().endsWith('skills') || bundledSkillsDir().endsWith('skills\\') || bundledSkillsDir().endsWith('skills/'))
  assert.ok(bundledAddonPath().endsWith('dsh_blender_bridge.py'))

  const checks = checkBundledSkills()
  assert.equal(checks.length, 8)
  for (const check of checks) {
    assert.equal(check.ok, true, `${check.name} failed validation: ${check.detail}`)
    assert.equal(check.code, 'valid', `${check.name} code should be valid`)
  }
  assert.deepEqual(
    checks.map((c) => c.name),
    EXPECTED_SKILLS,
  )
})

test('dsh-blender-studio apply(ctx) registers all 8 skills, all 6 tools including blender_health, HTTP routes, and disposes cleanly', async () => {
  const registeredSkills = new Map()
  const registeredTools = new Map()
  const registeredRoutes = []
  const disposeListeners = []
  const effectCleanups = []

  const ctx = {
    skills: {
      register(def) {
        registeredSkills.set(def.name, def)
        return () => registeredSkills.delete(def.name)
      },
      get(name) {
        return registeredSkills.get(name)
      },
    },
    tools: {
      register(def) {
        registeredTools.set(def.name, def)
        return () => registeredTools.delete(def.name)
      },
    },
    connection: {
      fetch: {
        register(route) {
          registeredRoutes.push(route)
          return () => {
            const idx = registeredRoutes.indexOf(route)
            if (idx >= 0) registeredRoutes.splice(idx, 1)
          }
        },
      },
    },
    inject(_deps, fn) {
      fn(ctx)
    },
    effect(fn) {
      const cleanup = fn()
      if (typeof cleanup === 'function') effectCleanups.push(cleanup)
    },
    on(event, fn) {
      if (event === 'dispose') disposeListeners.push(fn)
    },
    logger: { warn() {} },
  }

  apply(ctx)

  assert.deepEqual([...registeredSkills.keys()], EXPECTED_SKILLS)
  for (const skill of registeredSkills.values()) {
    assert.ok(skill.description.length > 20)
    assert.ok(skill.content.length > 200)
    assert.equal(skill.resourceBase.kind, 'directory')
  }

  assert.deepEqual(
    [...registeredTools.keys()],
    ['blender_health', 'blender_project', 'blender_render', 'blender_script', 'blender_bridge', 'blender_assets'],
  )
  assert.equal(registeredRoutes.length, 2)
  assert.equal(registeredRoutes[0].path, '/api/dsh-blender-studio/workbench')
  assert.equal(registeredRoutes[1].path, '/api/dsh-blender-studio/workbench/upload')

  // blender_health reports all 8 skills ready
  const healthTool = registeredTools.get('blender_health')
  const healthReport = await healthTool.execute({})
  assert.equal(healthReport.ok, true)
  assert.equal(healthReport.skills.length, 8)
  assert.ok(healthReport.skills.every((s) => s.ok && s.code === 'ready'))
  const rendered = healthTool.output.render({}, healthReport)
  assert.match(rendered[0].text, /8\/8/)

  // Dispose cleans up every skill, tool, and route idempotently
  for (const fn of disposeListeners) fn()
  for (const fn of effectCleanups) fn()
  assert.equal(registeredSkills.size, 0, 'all 8 skills disposed')
  assert.equal(registeredTools.size, 0, 'all 6 tools disposed')
  assert.equal(registeredRoutes.length, 0, 'both HTTP routes disposed')

  const postDispose = await healthTool.execute({})
  assert.equal(postDispose.ok, false)
  assert.ok(postDispose.skills.every((s) => s.code === 'disposed'))
})

test('parseSkillFile supports BOM, CRLF, multiline YAML, and degrades safely on broken input', () => {
  const source = '\uFEFF---\r\nname: alpha\r\ndescription: |\r\n  first line\r\n  second line\r\n---\r\n# Body\r\n'
  assert.deepEqual(parseSkillFile(source), {
    name: 'alpha',
    description: 'first line\nsecond line\n',
    content: '# Body\r\n',
  })
  assert.deepEqual(parseSkillFile('just a body'), { name: '', description: '', content: 'just a body' })
  assert.doesNotThrow(() => parseSkillFile('---\nname: [invalid\n---\nbody'))
})

test('createSkillBundle validation rejects unreadable, broken, duplicate, blank, and mismatched frontmatter', (t) => {
  const names = ['missing', 'folder', 'broken', 'duplicate', 'blank-body', 'blank-desc', 'wrong-name', 'not-object']
  const state = makeWorld(t, names)
  rmSync(join(state.directory, 'missing', 'SKILL.md'))
  rmSync(join(state.directory, 'folder', 'SKILL.md'))
  mkdirSync(join(state.directory, 'folder', 'SKILL.md'))
  state.write('broken', '---\nname: [invalid\n---\nbody')
  state.write('duplicate', '---\nname: duplicate\nname: duplicate\ndescription: test\n---\nbody')
  state.write('blank-body', skillDoc('blank-body', '  \n\t'))
  state.write('blank-desc', skillDoc('blank-desc', 'body', '"   "'))
  state.write('wrong-name', skillDoc('other'))
  state.write('not-object', '---\n- item\n---\nbody')

  const checks = state.bundle.checkFiles()
  assert.equal(checks.length, names.length)
  assert.ok(checks.every((c) => !c.ok))
  assert.equal(checks[0].code, 'unreadable')
  assert.equal(checks[1].code, 'unreadable')
  for (const check of checks.slice(2)) {
    assert.equal(check.code, 'invalid', check.name)
  }
  state.apply()
  assert.equal(state.calls(), 0)
  assert.ok(state.warnings.length >= names.length)
})

test('createSkillBundle detects file changes, partial failures, and idempotent disposal', async (t) => {
  const state = makeWorld(t, ['alpha', 'beta'], { fail: 'alpha', failDispose: 'beta' })
  state.apply()
  const report = await state.health()
  assert.equal(report.ok, false)
  assert.equal(report.skills[0].code, 'registration_failed')
  assert.equal(report.skills[1].code, 'ready')

  state.write('beta', skillDoc('beta', '# Modified body'))
  assert.equal((await state.health()).skills[1].code, 'changed')

  state.dispose()
  state.dispose()
  assert.deepEqual(state.removed, ['beta'])
  assert.equal(state.tools.size, 0)
  assert.ok(state.warnings.some((w) => w.includes('Disposal failed')))
})
