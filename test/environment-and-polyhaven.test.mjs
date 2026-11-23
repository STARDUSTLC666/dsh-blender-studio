import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BlenderEnvironment,
  buildExecutableInfo,
  parseBlenderVersionOutput,
} from '../lib/environment.js'
import { PolyHavenClient, validatePolyHavenUrl } from '../lib/polyhaven.js'

const testRoot = dirname(fileURLToPath(import.meta.url))

async function makeTmpRoot(t) {
  const root = await mkdtemp(join(testRoot, '.env-fixture-'))
  t.after(async () => {
    const rel = relative(resolve(testRoot), resolve(root))
    assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel))
    await rm(root, { recursive: true, force: true })
  })
  return root
}

test('Blender version parsing accurately identifies EEVEE Next (>=4.2) and GPv3 (>=4.3) across 3.6–5.x', () => {
  const cases = [
    ['Blender 3.6.14\n\tbuild date: 2024-07-16', '3.6.14', 3, 6, 'BLENDER_EEVEE', 'gpv2'],
    ['Blender 4.2.3 LTS\n\tbuild hash: abc123', '4.2.3', 4, 2, 'BLENDER_EEVEE_NEXT', 'gpv2'],
    ['Blender 4.3.2\n\tbuild platform: Windows', '4.3.2', 4, 3, 'BLENDER_EEVEE_NEXT', 'gpv3'],
    ['Blender 5.0.0 Alpha', '5.0.0', 5, 0, 'BLENDER_EEVEE', 'gpv3'],
  ]

  for (const [output, version, major, minor, eeveeEngine, greasePencilApi] of cases) {
    const parsed = parseBlenderVersionOutput(output)
    assert.ok(parsed, `should parse ${output}`)
    assert.equal(parsed.version, version)
    assert.equal(parsed.major, major)
    assert.equal(parsed.minor, minor)

    const info = buildExecutableInfo('/mock/blender', output, 'standard')
    assert.ok(info)
    assert.equal(info.eeveeEngine, eeveeEngine)
    assert.equal(info.greasePencilApi, greasePencilApi)
  }

  assert.equal(parseBlenderVersionOutput('Python 3.11.0'), null)
  assert.equal(buildExecutableInfo('/mock/bad', 'not blender', 'path'), null)
})

test('BlenderEnvironment probes mock executables, persists settings, and validates loopback host', async (t) => {
  const root = await makeTmpRoot(t)
  const oldEnv = process.env.DSH_BLENDER_EXECUTABLE
  delete process.env.DSH_BLENDER_EXECUTABLE
  t.after(() => {
    if (oldEnv === undefined) delete process.env.DSH_BLENDER_EXECUTABLE
    else process.env.DSH_BLENDER_EXECUTABLE = oldEnv
  })

  const mockVersions = new Map([
    ['/fake/blender-3.6', 'Blender 3.6.17\n'],
    ['/fake/blender-4.3', 'Blender 4.3.2\n'],
    ['/fake/blender-5.0', 'Blender 5.0.1\n'],
  ])

  const env = new BlenderEnvironment({
    root,
    skipSystemScan: true,
    extraCandidates: [
      { path: '/fake/blender-4.3', source: 'standard' },
      { path: '/fake/blender-3.6', source: 'standard' },
      { path: '/fake/missing', source: 'path' },
    ],
    prober: async (execPath) => {
      const stdout = mockVersions.get(execPath)
      if (!stdout) return { ok: false, stdout: '', error: 'ENOENT' }
      return { ok: true, stdout }
    },
  })

  const detected = await env.detect({ force: true })
  assert.equal(detected.detected.length, 2)
  assert.equal(detected.active?.version, '4.3.2')
  assert.equal(detected.active?.eeveeEngine, 'BLENDER_EEVEE_NEXT')
  assert.equal(detected.active?.greasePencilApi, 'gpv3')

  // Configure custom blenderPath, bridge settings, and polyHavenEnabled
  const saved = await env.configure({
    blenderPath: '/fake/blender-5.0',
    bridgeHost: 'localhost',
    bridgePort: 9988,
    bridgeToken: 'my-secret',
    polyHavenEnabled: true,
  })
  assert.equal(saved.blenderPath, '/fake/blender-5.0')
  assert.equal(saved.bridgeHost, 'localhost')
  assert.equal(saved.bridgePort, 9988)
  assert.equal(saved.polyHavenEnabled, true)

  // Persisted across a fresh instance
  const envReloaded = new BlenderEnvironment({
    root,
    skipSystemScan: true,
    prober: async (execPath) => {
      const stdout = mockVersions.get(execPath)
      return stdout ? { ok: true, stdout } : { ok: false, stdout: '', error: 'ENOENT' }
    },
  })
  const st = await envReloaded.status({ connected: true, blenderVersion: '5.0.1', activeScene: 'Main' }, { forceDetect: true })
  assert.equal(st.ready, true)
  assert.equal(st.active?.version, '5.0.1')
  assert.equal(st.configuredPath, '/fake/blender-5.0')
  assert.equal(st.bridge.host, 'localhost')
  assert.equal(st.bridge.port, 9988)
  assert.equal(st.bridge.hasToken, true)
  assert.equal(st.bridge.connected, true)
  assert.equal(st.polyHavenEnabled, true)

  // Non-loopback host rejected with BRIDGE_HOST_FORBIDDEN
  await assert.rejects(
    env.configure({ bridgeHost: '192.168.1.50' }),
    (err) => err.code === 'BRIDGE_HOST_FORBIDDEN' && err.status === 400,
  )
  // Invalid blender path rejected with BLENDER_PROBE_FAILED
  await assert.rejects(
    env.configure({ blenderPath: '/fake/does-not-exist' }),
    (err) => err.code === 'BLENDER_PROBE_FAILED' && err.status === 400,
  )

  // Missing Blender throws ENV_NOT_READY
  const emptyEnv = new BlenderEnvironment({
    root: join(root, 'empty'),
    skipSystemScan: true,
    prober: async () => ({ ok: false, stdout: '', error: 'ENOENT' }),
  })
  await assert.rejects(emptyEnv.requireActiveExecutable(), (err) => err.code === 'ENV_NOT_READY')
})

test('PolyHavenClient enforces disabled guard, SSRF host allowlist, redirect allowlist, search and cache', async (t) => {
  const root = await makeTmpRoot(t)

  // 1. Direct URL validator checks
  assert.equal(validatePolyHavenUrl('https://api.polyhaven.com/assets?t=hdris').hostname, 'api.polyhaven.com')
  assert.equal(validatePolyHavenUrl('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_1k.hdr').hostname, 'dl.polyhaven.org')

  for (const badUrl of [
    'http://api.polyhaven.com/assets',
    'https://evil.example.com/assets',
    'https://127.0.0.1/admin',
    'https://169.254.169.254/latest/meta-data/',
    'https://api.polyhaven.com:8443/assets',
    'https://user:pass@api.polyhaven.com/assets',
    'file:///etc/passwd',
  ]) {
    assert.throws(() => validatePolyHavenUrl(badUrl), (err) => err.code === 'POLYHAVEN_FAILED', badUrl)
  }

  // 2. Disabled guard blocks search & download without invoking fetch
  let fetchCount = 0
  const disabledClient = new PolyHavenClient({
    root,
    isEnabled: () => false,
    fetchImpl: async () => {
      fetchCount++
      return new Response('{}')
    },
  })
  await assert.rejects(disabledClient.search('studio', 'hdris'), (err) => err.code === 'POLYHAVEN_DISABLED' && err.status === 403)
  await assert.rejects(disabledClient.downloadAsset('studio_small_09', 'hdris', '1k'), (err) => err.code === 'POLYHAVEN_DISABLED' && err.status === 403)
  assert.equal(fetchCount, 0)

  // 3. Redirect to non-allowlisted host is rejected
  const redirectClient = new PolyHavenClient({
    root,
    isEnabled: () => true,
    fetchImpl: async () =>
      new Response(null, {
        status: 302,
        headers: { location: 'https://evil-attacker.test/payload.hdr' },
      }),
  })
  await assert.rejects(
    redirectClient.search('studio', 'hdris'),
    (err) => err.code === 'POLYHAVEN_FAILED' && /白名单|evil-attacker/.test(err.message),
  )

  // 4. Search + download + disk cache hit
  const hdrPayload = Buffer.from('#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 1 +X 1\n\x00\x00\x00\x00', 'binary')
  const requestedUrls = []
  const client = new PolyHavenClient({
    root,
    isEnabled: () => true,
    fetchImpl: async (url) => {
      const u = String(url)
      requestedUrls.push(u)
      if (u.startsWith('https://api.polyhaven.com/assets?t=hdris')) {
        return new Response(
          JSON.stringify({
            studio_small_09: {
              name: 'Studio Small 09',
              categories: ['studio', 'indoor'],
              tags: ['softbox', 'product'],
              authors: { 'Sergej Majboroda': 'All' },
              download_count: 95000,
              max_resolution: [8192, 4096],
            },
            forest_park: {
              name: 'Forest Park',
              categories: ['outdoor', 'nature'],
              tags: ['trees'],
              authors: ['Greg Zaal'],
              download_count: 12000,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }
      if (u === 'https://api.polyhaven.com/files/studio_small_09') {
        return new Response(
          JSON.stringify({
            hdri: {
              '1k': {
                hdr: { url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr' },
              },
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }
      if (u === 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr') {
        return new Response(hdrPayload, { status: 200, headers: { 'content-type': 'application/octet-stream' } })
      }
      return new Response('not found', { status: 404 })
    },
  })

  const found = await client.search('studio product', 'hdris', 5)
  assert.equal(found.length, 1)
  assert.equal(found[0].id, 'studio_small_09')
  assert.equal(found[0].name, 'Studio Small 09')

  const firstDl = await client.downloadAsset('studio_small_09', 'hdris', '1k')
  assert.equal(firstDl.cached, false)
  assert.equal(firstDl.kind, 'hdri')
  assert.equal(firstDl.ext, 'hdr')
  assert.deepEqual(firstDl.bytes, hdrPayload)
  assert.ok((await stat(join(client.cacheDir, 'hdris', firstDl.fileName))).isFile())

  // Second download hits disk cache without re-fetching dl.polyhaven.org
  const dlCallsBefore = requestedUrls.filter((u) => u.startsWith('https://dl.polyhaven.org')).length
  const secondDl = await client.downloadAsset('studio_small_09', 'hdris', '1k')
  const dlCallsAfter = requestedUrls.filter((u) => u.startsWith('https://dl.polyhaven.org')).length
  assert.equal(secondDl.cached, true)
  assert.equal(dlCallsAfter, dlCallsBefore)
  assert.deepEqual(secondDl.bytes, hdrPayload)
})
