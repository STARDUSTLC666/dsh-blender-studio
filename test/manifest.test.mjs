import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import YAML from 'yaml'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

const EXPECTED_SKILLS = [
  'blender-scene-architecture',
  'blender-bpy-scripting',
  'blender-materials-lighting',
  'blender-geometry-nodes',
  'blender-camera-animation',
  'blender-rendering-export',
  'blender-grease-pencil',
  'blender-visual-qc',
  'blender-production-pipeline',
]

test('package.json declares canonical dsh-blender-studio metadata, semver, and engines', () => {
  assert.equal(pkg.name, 'dsh-blender-studio')
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/)
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.main, 'lib/index.js')
  assert.equal(pkg.types, 'lib/index.d.ts')
  assert.equal(pkg.engines?.dsh, '>=0.2.2-rc.3')
  assert.ok(pkg.engines?.node, 'engines.node must be specified')
  assert.equal(pkg.exports?.['.']?.default, './lib/index.js')
  assert.equal(pkg.exports?.['.']?.types, './lib/index.d.ts')
  assert.equal(pkg.exports?.['./client'], './lib/client.js')
  assert.equal(pkg.exports?.['./cordis.patch.yml'], './cordis.patch.yml')
  assert.equal(pkg.exports?.['./package.json'], './package.json')
  assert.equal(pkg.icon, './assets/plugin-icon.webp')
})

test('dsh.bundle.patch and dsh.client.inject match DeepSeek Harness >=0.2.2-rc.3 contract', () => {
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh?.client?.platform, 'web')
  const inject = pkg.dsh?.client?.inject ?? []
  for (const dep of [
    '@deepseek-ai/dsh-client-ui-settings',
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-sidebar',
  ]) {
    assert.ok(inject.includes(dep), `dsh.client.inject must include ${dep}`)
  }
})

test('every entry in package.json files whitelist exists on disk and covers required assets', () => {
  assert.ok(Array.isArray(pkg.files) && pkg.files.length > 0)
  for (const required of [
    'lib',
    'skills',
    'blender/dsh_blender_bridge.py',
    'cordis.patch.yml',
    'screenshots.json',
    'README.md',
    'README.en.md',
    'docs',
    'CHANGELOG.md',
    'templates/DESIGN.md',
    'assets/plugin-icon.webp',
    'assets/plugin-icon.svg',
  ]) {
    assert.ok(pkg.files.includes(required), `files whitelist must include ${required}`)
  }
  for (const docFile of [
    'docs/REFERENCE.zh.md',
    'docs/REFERENCE.en.md',
    'docs/BRIDGE.md',
    'docs/VALIDATION.md',
  ]) {
    assert.ok(existsSync(join(ROOT, docFile)), `required doc missing on disk: ${docFile}`)
  }
  for (const entry of pkg.files) {
    const full = join(ROOT, entry)
    assert.ok(existsSync(full), `files whitelist entry missing on disk: ${entry}`)
  }
  assert.ok(existsSync(join(ROOT, 'lib/index.js')), 'lib/index.js must be built')
  assert.ok(existsSync(join(ROOT, 'lib/index.d.ts')), 'lib/index.d.ts must be built')
  assert.ok(existsSync(join(ROOT, 'lib/client.js')), 'lib/client.js must be built')
  assert.ok(existsSync(join(ROOT, 'blender/dsh_blender_bridge.py')), 'blender/dsh_blender_bridge.py must exist')
})

test('cordis.patch.yml is valid YAML inserting blender-studio -> dsh-blender-studio', () => {
  const raw = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8')
  const parsed = YAML.parse(raw)
  assert.ok(Array.isArray(parsed) && parsed.length >= 1)
  const insertBlock = parsed.find((item) => item && Array.isArray(item.insert))
  assert.ok(insertBlock, 'cordis.patch.yml must contain an insert list')
  const entry = insertBlock.insert.find((row) => row?.name === 'dsh-blender-studio')
  assert.ok(entry, 'cordis.patch.yml must insert dsh-blender-studio')
  assert.equal(entry.id, 'blender-studio')
  assert.deepEqual(entry.config, {})
})

test('assets/plugin-icon.webp has valid RIFF....WEBP binary magic bytes and SVG counterpart exists', () => {
  const webpPath = join(ROOT, 'assets/plugin-icon.webp')
  assert.ok(existsSync(webpPath), 'assets/plugin-icon.webp must exist')
  const buf = readFileSync(webpPath)
  assert.ok(buf.length >= 32, `plugin-icon.webp too small (${buf.length} bytes)`)
  assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', 'WebP must start with RIFF')
  assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', 'WebP bytes 8..12 must be WEBP')
  const chunkType = buf.subarray(12, 16).toString('ascii')
  assert.ok(['VP8 ', 'VP8L', 'VP8X'].includes(chunkType), `unexpected WebP chunk type: ${chunkType}`)
  const declaredRiffSize = buf.readUInt32LE(4)
  assert.equal(declaredRiffSize + 8, buf.length, 'RIFF chunk length must match file size')

  const svgPath = join(ROOT, 'assets/plugin-icon.svg')
  assert.ok(existsSync(svgPath), 'assets/plugin-icon.svg must exist')
  const svg = readFileSync(svgPath, 'utf8')
  assert.match(svg, /<svg[\s>]/i)
  assert.match(svg, /<\/svg>/i)
})

test('all 9 bundled Blender skills exist under skills/', () => {
  assert.equal(EXPECTED_SKILLS.length, 9)
  for (const skill of EXPECTED_SKILLS) {
    const file = join(ROOT, 'skills', skill, 'SKILL.md')
    assert.ok(existsSync(file), `missing skill file: skills/${skill}/SKILL.md`)
    assert.ok(statSync(file).size > 200, `skill file unexpectedly short: ${skill}`)
  }
})

test('workflow light/dark bilingual SVGs and v0.2.0 hero/UI WebPs exist under docs/assets/intro/ with valid headers', () => {
  for (const name of [
    'workflow-zh-light.svg',
    'workflow-zh-dark.svg',
    'workflow-en-light.svg',
    'workflow-en-dark.svg',
  ]) {
    const file = join(ROOT, 'docs/assets/intro', name)
    assert.ok(existsSync(file), `missing workflow SVG: docs/assets/intro/${name}`)
    const svg = readFileSync(file, 'utf8')
    assert.match(svg, /<svg[\s>]/i)
    assert.match(svg, /<\/svg>/i)
    assert.ok(svg.length > 400, `workflow SVG unexpectedly small: ${name}`)
  }
  for (const webpName of [
    'hero-turbofan.webp',
    'hero-racecar.webp',
    'hero-helicopter.webp',
    'hero-robot-arm.webp',
    'screen-zh.webp',
    'screen-qc.webp',
  ]) {
    const file = join(ROOT, 'docs/assets/intro', webpName)
    assert.ok(existsSync(file), `missing showcase WebP: docs/assets/intro/${webpName}`)
    const buf = readFileSync(file)
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', `${webpName} must start with RIFF`)
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', `${webpName} bytes 8..12 must be WEBP`)
  }

  const screenshots = JSON.parse(readFileSync(join(ROOT, 'screenshots.json'), 'utf8'))
  assert.ok(Array.isArray(screenshots) && screenshots.length === 6, 'screenshots.json must list 6 curated WebP paths')
  for (const relPath of screenshots) {
    assert.ok(typeof relPath === 'string' && !relPath.startsWith('/') && !relPath.includes('..'), `unsafe screenshot path: ${relPath}`)
    const full = join(ROOT, relPath)
    assert.ok(existsSync(full), `screenshots.json path missing on disk: ${relPath}`)
    const buf = readFileSync(full)
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF')
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP')
  }
})
