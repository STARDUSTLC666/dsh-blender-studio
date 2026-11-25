import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import {
  BlenderBridgeClient,
  checkScriptSafety,
  installBridgeAddon,
  isLoopbackHost,
  normalizeLoopbackHost,
} from '../lib/bridge.js'

const SAMPLE_SCENE = {
  capturedAt: '2026-11-23T12:00:00Z',
  blenderVersion: '4.3.2',
  engine: 'BLENDER_EEVEE_NEXT',
  objectCount: 4,
  meshCount: 1,
  lightCount: 2,
  cameraCount: 1,
  totalPolygons: 256,
  activeCamera: 'Camera',
  materials: ['HeroMat'],
  collections: ['Scene Collection', 'Studio'],
  objects: [
    { name: 'Hero', type: 'MESH', location: [0, 0, 0.5], dimensions: [1, 1, 1], materialCount: 1, vertices: 128, polygons: 256 },
    { name: 'Camera', type: 'CAMERA', location: [3, -3, 2] },
  ],
}

async function startMockBridge(t, options = {}) {
  const expectedToken = options.token ?? ''
  const received = []
  const server = createServer((socket) => {
    let buffer = ''
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      let idx
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim()
        buffer = buffer.slice(idx + 1)
        if (!line) continue
        const req = JSON.parse(line)
        received.push(req)

        if (options.rawResponse !== undefined) {
          socket.write(options.rawResponse)
          continue
        }

        if (options.delayMs) {
          setTimeout(() => {
            if (!socket.destroyed) {
              socket.write(JSON.stringify({ id: req.id, ok: true, result: { delayed: true }, error: null }) + '\n')
            }
          }, options.delayMs)
          continue
        }

        if (expectedToken && req.token !== expectedToken) {
          socket.write(
            JSON.stringify({
              id: req.id,
              ok: false,
              result: null,
              error: { code: 'BRIDGE_AUTH_FAILED', message: 'Invalid bridge token' },
            }) + '\n',
          )
          continue
        }

        let result = null
        switch (req.command) {
          case 'ping':
            result = {
              blenderVersion: '4.3.2',
              sceneName: 'StudioScene',
              engine: 'BLENDER_EEVEE_NEXT',
              frameCurrent: 1,
              objectCount: 4,
            }
            break
          case 'scene_info':
            result = SAMPLE_SCENE
            break
          case 'execute':
            result = {
              stdout: 'ran: ' + String(req.params?.code ?? '').slice(0, 24),
              stderr: '',
              sceneSummary: SAMPLE_SCENE,
            }
            break
          case 'viewport_capture':
            result = {
              mime: 'image/png',
              base64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64'),
              width: req.params?.width ?? 960,
              height: req.params?.height ?? 540,
            }
            break
          case 'load_script':
            result = {
              stdout: 'loaded ' + String(req.params?.projectTitle ?? ''),
              stderr: '',
              sceneSummary: SAMPLE_SCENE,
            }
            break
          default:
            socket.write(
              JSON.stringify({
                id: req.id,
                ok: false,
                result: null,
                error: { code: 'BRIDGE_PROTOCOL_ERROR', message: 'Unknown command' },
              }) + '\n',
            )
            continue
        }

        const respId = options.mismatchId ? 'wrong-request-id' : req.id
        socket.write(JSON.stringify({ id: respId, ok: true, result, error: null }) + '\n')
      }
    })
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  t.after(() => new Promise((resolve) => server.close(resolve)))
  return { port: address.port, received, server }
}

test('BlenderBridgeClient strictly enforces loopback-only hosts and valid ports', () => {
  for (const okHost of ['127.0.0.1', 'localhost', '::1', '[::1]', '  LOCALHOST  ']) {
    assert.equal(isLoopbackHost(okHost), true, `should allow ${okHost}`)
    assert.ok(normalizeLoopbackHost(okHost))
  }

  for (const badHost of ['192.168.1.10', 'example.com', '0.0.0.0', '10.0.0.1', '127.0.0.2', '127.0.0.1.evil.com', '']) {
    assert.equal(isLoopbackHost(badHost), false, `should reject ${badHost}`)
    assert.throws(
      () => new BlenderBridgeClient({ host: badHost }),
      (err) => err.code === 'BRIDGE_HOST_FORBIDDEN' && err.status === 400,
    )
    const client = new BlenderBridgeClient()
    assert.throws(
      () => client.configure({ host: badHost }),
      (err) => err.code === 'BRIDGE_HOST_FORBIDDEN' && err.status === 400,
    )
  }

  for (const badPort of [0, -1, 65536, 1.5, NaN]) {
    assert.throws(
      () => new BlenderBridgeClient({ port: badPort }),
      (err) => err.code === 'BAD_REQUEST' && err.status === 400,
    )
  }
})

test('BlenderBridgeClient communicates over loopback TCP for all 5 JSON-RPC commands', async (t) => {
  const { port, received } = await startMockBridge(t, { token: 'secret-bridge-token' })
  const client = new BlenderBridgeClient({ host: '127.0.0.1', port, token: 'secret-bridge-token', timeoutMs: 3000 })
  assert.equal(client.hasToken, true)

  const pong = await client.ping()
  assert.equal(pong.blenderVersion, '4.3.2')
  assert.equal(pong.sceneName, 'StudioScene')
  assert.equal(pong.objectCount, 4)

  const scene = await client.sceneInfo()
  assert.equal(scene.objectCount, 4)
  assert.equal(scene.activeCamera, 'Camera')
  assert.deepEqual(scene.materials, ['HeroMat'])

  const execRes = await client.execute('import bpy\nprint("ok")', { pushUndo: false })
  assert.match(execRes.stdout, /^ran:/)
  assert.equal(execRes.sceneSummary.meshCount, 1)
  assert.equal(received.at(-1).params.pushUndo, false)

  const vp = await client.viewportCapture({ width: 640, height: 360 })
  assert.equal(vp.mime, 'image/png')
  assert.equal(vp.width, 640)
  assert.equal(vp.height, 360)
  assert.ok(Buffer.from(vp.base64, 'base64').subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])))

  const loaded = await client.loadScript('import bpy\nbpy.ops.mesh.primitive_cube_add()', {
    clearScene: true,
    projectTitle: 'Watch Demo',
  })
  assert.equal(loaded.stdout, 'loaded Watch Demo')
  assert.equal(loaded.sceneSummary.totalPolygons, 256)
  assert.equal(received.at(-1).params.clearScene, true)

  const st = await client.status()
  assert.equal(st.connected, true)
  assert.equal(st.blenderVersion, '4.3.2')
  assert.equal(st.activeScene, 'StudioScene')
  assert.equal(st.hasToken, true)

  // Client-side validation guards
  await assert.rejects(client.execute('   '), (err) => err.code === 'BAD_REQUEST')
  await assert.rejects(client.loadScript(''), (err) => err.code === 'BAD_REQUEST')
  await assert.rejects(client.viewportCapture({ width: 16, height: 540 }), (err) => err.code === 'BAD_REQUEST')
  await assert.rejects(client.viewportCapture({ width: 960, height: 9999 }), (err) => err.code === 'BAD_REQUEST')
})

test('BlenderBridgeClient enforces token authentication, timeouts, protocol checks, and unreachable reporting', async (t) => {
  // 1. Token auth failure
  const authMock = await startMockBridge(t, { token: 'top-secret' })
  const wrongTokenClient = new BlenderBridgeClient({ host: '127.0.0.1', port: authMock.port, token: 'wrong' })
  await assert.rejects(
    wrongTokenClient.ping(),
    (err) => err.code === 'BRIDGE_AUTH_FAILED' && err.status === 401,
  )
  const missingTokenClient = new BlenderBridgeClient({ host: '127.0.0.1', port: authMock.port })
  await assert.rejects(
    missingTokenClient.ping(),
    (err) => err.code === 'BRIDGE_AUTH_FAILED' && err.status === 401,
  )

  // 2. Timeout
  const slowMock = await startMockBridge(t, { delayMs: 600 })
  const fastTimeoutClient = new BlenderBridgeClient({ host: '127.0.0.1', port: slowMock.port, timeoutMs: 120 })
  await assert.rejects(
    fastTimeoutClient.ping(),
    (err) => err.code === 'BRIDGE_TIMEOUT' && err.status === 504,
  )

  // 3. Invalid JSON response
  const corruptMock = await startMockBridge(t, { rawResponse: '{not-valid-json\n' })
  const corruptClient = new BlenderBridgeClient({ host: '127.0.0.1', port: corruptMock.port })
  await assert.rejects(
    corruptClient.ping(),
    (err) => err.code === 'BRIDGE_PROTOCOL_ERROR' && err.status === 502,
  )

  // 4. Mismatched request ID
  const mismatchMock = await startMockBridge(t, { mismatchId: true })
  const mismatchClient = new BlenderBridgeClient({ host: '127.0.0.1', port: mismatchMock.port })
  await assert.rejects(
    mismatchClient.ping(),
    (err) => err.code === 'BRIDGE_PROTOCOL_ERROR' && err.status === 502,
  )

  // 5. Unreachable port -> status() degrades gracefully while ping() throws BRIDGE_UNREACHABLE
  const closedServer = createServer()
  await new Promise((resolve) => closedServer.listen(0, '127.0.0.1', resolve))
  const unusedPort = closedServer.address().port
  await new Promise((resolve) => closedServer.close(resolve))

  const deadClient = new BlenderBridgeClient({ host: '127.0.0.1', port: unusedPort, timeoutMs: 1500 })
  await assert.rejects(deadClient.ping(), (err) => err.code === 'BRIDGE_UNREACHABLE' && err.status === 503)
  const status = await deadClient.status(1000)
  assert.equal(status.connected, false)
  assert.ok(status.error)
})

test('checkScriptSafety allows clean bpy scripts and catches dangerous patterns with line numbers', () => {
  const cleanScript = [
    '"""Docstring mentioning os.system("noop") and subprocess.run() should be ignored."""',
    '# Comment mentioning os.system("noop") and subprocess should be ignored',
    'import bpy',
    'import bmesh',
    'import math',
    'import colorsys',
    'from mathutils import Vector',
    '',
    'mesh = bpy.data.meshes.new("HeroMesh")',
    'obj = bpy.data.objects.new("Hero", mesh)',
    'bpy.context.scene.collection.objects.link(obj)',
    'obj.location = Vector((0.0, 0.0, 1.0))',
    'mat = bpy.data.materials.new("CarPaint")',
    'bsdf = mat.node_tree.nodes.get("Principled BSDF")',
    'for socket in bsdf.inputs:',
    '    if socket.name == "Metallic":',
    '        socket.default_value = 0.85',
  ].join('\n')

  assert.deepEqual(checkScriptSafety(''), { safe: true, findings: [] })
  assert.deepEqual(checkScriptSafety('   \n  '), { safe: true, findings: [] })
  assert.deepEqual(checkScriptSafety(cleanScript), { safe: true, findings: [] })

  const dangerousCases = [
    ['import os\nos.system("whoami")', 'os-shell', 2],
    ['from os import popen\npopen("dir")', 'os-shell-import', 1],
    ['import subprocess\nsubprocess.run(["ls"])', 'subprocess', 1],
    ['import shutil\nshutil.rmtree("/tmp/foo")', 'shutil-rmtree', 2],
    ['import ctypes\nctypes.CDLL("libc.so.6")', 'ctypes', 1],
    ['import socket\ns = socket.socket()', 'network-socket', 1],
    ['import urllib.request\nurllib.request.urlopen("http://evil")', 'network-urllib', 1],
    ['import requests\nrequests.get("https://evil.test")', 'network-requests', 1],
    ['import http.client\nhttp.client.HTTPConnection("evil")', 'network-http-client', 1],
    ['x = eval("1+1")', 'dynamic-exec', 1],
    ['__import__("os")', 'dynamic-exec', 1],
    ['import importlib\nimportlib.import_module("os")', 'dynamic-importlib', 1],
    ['open("../secret.txt", "r")', 'path-traversal', 1],
    ['open("/etc/cron.d/pwn", "w")', 'external-file-write', 1],
    ['open("C:\\\\Windows\\\\evil.txt", "wb")', 'external-file-write', 1],
  ]

  for (const [code, expectedRule, expectedLine] of dangerousCases) {
    const res = checkScriptSafety(code)
    assert.equal(res.safe, false, `expected unsafe for rule ${expectedRule}`)
    assert.ok(
      res.findings.some((f) => f.rule === expectedRule && f.line === expectedLine),
      `expected finding ${expectedRule}@L${expectedLine}, got ${JSON.stringify(res.findings)}`,
    )
  }
})

test('installBridgeAddon v0.3.0 invokes headless Blender installer safely, handles failures, and addon declares 0.3.0 + opt-in auto_start + GPU ping', async () => {
  const addonPath = join(fileURLToPath(new URL('..', import.meta.url)), 'blender', 'dsh_blender_bridge.py')
  const addonSource = readFileSync(addonPath, 'utf8')
  assert.match(addonSource, /"version"\s*:\s*\(\s*0\s*,\s*3\s*,\s*0\s*\)/, 'addon bl_info must be (0, 3, 0)')
  assert.match(addonSource, /auto_start:\s*bpy\.props\.BoolProperty\([\s\S]{0,360}default\s*=\s*False/, 'addon auto_start must default to False')
  assert.match(addonSource, /"gpu"/, 'addon _cmd_ping must report Cycles GPU info')

  const calls = []
  const okRes = await installBridgeAddon('/mock/blender-5.3', addonPath, {
    executor: async (execPath, args, timeoutMs) => {
      calls.push({ execPath, args, timeoutMs })
      return { exitCode: 0, stdout: '__DSH_ADDON_INSTALLED__=1\n', stderr: '' }
    },
  })
  assert.equal(okRes.installed, true)
  assert.equal(okRes.enabled, true)
  assert.equal(okRes.executablePath, '/mock/blender-5.3')
  assert.equal(okRes.addonPath, addonPath)
  assert.equal(calls.length, 1)
  assert.ok(calls[0].args.includes('--background'))
  assert.ok(calls[0].args.includes('--factory-startup'))
  assert.ok(calls[0].args.includes('--python-exit-code'))
  const expr = calls[0].args[calls[0].args.indexOf('--python-expr') + 1] || ''
  assert.match(expr, /addon_install/)
  assert.match(expr, /addon_enable/)
  assert.match(expr, /save_userpref/)

  await assert.rejects(
    installBridgeAddon('/mock/blender-5.3', addonPath, {
      executor: async () => ({ exitCode: 1, stdout: '', stderr: 'Permission denied writing userpref.blend' }),
    }),
    (err) => err.code === 'ADDON_INSTALL_FAILED' && err.status === 500,
  )
})
