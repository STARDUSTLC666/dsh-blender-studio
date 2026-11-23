import { buildClient, unwrapClient } from '@stardustlc/dsh-updates/build'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const target = 'lib/client.js'

function findNode(ast, predicate) {
  if (!ast || typeof ast !== 'object') return undefined
  if (predicate(ast)) return ast
  for (const value of Object.values(ast)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = findNode(item, predicate)
        if (result) return result
      }
    } else if (value && typeof value === 'object') {
      const result = findNode(value, predicate)
      if (result) return result
    }
  }
  return undefined
}

function collectNodes(ast, predicate, out = []) {
  if (!ast || typeof ast !== 'object') return out
  if (predicate(ast)) out.push(ast)
  for (const value of Object.values(ast)) {
    if (Array.isArray(value)) {
      for (const item of value) collectNodes(item, predicate, out)
    } else if (value && typeof value === 'object') {
      collectNodes(value, predicate, out)
    }
  }
  return out
}

function applyReplacements(source, changes) {
  let out = source
  for (const item of changes.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, item.start) + item.text + out.slice(item.end)
  }
  return out
}

function wrapCompatibleClient(rootDir, existingClient) {
  const requireHere = createRequire(import.meta.url)
  const updatesBuildPath = requireHere.resolve('@stardustlc/dsh-updates/build')
  const updatesLibDir = dirname(updatesBuildPath)
  const requireFromUpdates = createRequire(updatesBuildPath)
  const { parse } = requireFromUpdates('acorn')

  const START = '/* STARDUSTLC_UPDATE_CLIENT_BODY_START */'
  const END = '/* STARDUSTLC_UPDATE_CLIENT_BODY_END */'
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'))
  const destination = join(rootDir, existingClient)
  const rawSource = readFileSync(destination, 'utf8')
  let source = unwrapClient(rawSource).replace(/\r\n/g, '\n')
  const parseScript = code => parse(code, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true })

  const sourceTree = parseScript(source)
  const explicitFooter = findNode(
    sourceTree,
    node => node.type === 'CallExpression' && node.callee?.name === '__stardustUpdatesFooter',
  )
  const pages = explicitFooter
    ? []
    : collectNodes(
        sourceTree,
        node =>
          node.type === 'CallExpression' &&
          node.arguments[0]?.type === 'MemberExpression' &&
          node.arguments[0].object?.name === 'W' &&
          node.arguments[0].property?.name === 'Page' &&
          node.arguments[1]?.type === 'ObjectExpression',
      )

  source = applyReplacements(
    source,
    pages.flatMap(node => [
      { start: node.start, end: node.start, text: '__stardustUpdatesInlinePage(React,' },
      { start: node.end, end: node.end, text: ',' + JSON.stringify(pkg.name) + ')' },
    ]),
  )

  const afterPagesAst = parseScript(source)
  const sectionIds = collectNodes(
    afterPagesAst,
    node =>
      node.type === 'ObjectExpression' &&
      node.properties?.some(p => p.key?.name === 'name' && p.value?.value === 'settings.section'),
  )
    .map(node => node.properties.find(p => p.key?.name === 'id')?.value?.value)
    .filter(id => typeof id === 'string')

  const call = findNode(
    afterPagesAst,
    node =>
      node.type === 'CallExpression' &&
      node.callee?.type === 'MemberExpression' &&
      node.callee.property?.name === 'load' &&
      node.callee.object?.type === 'MemberExpression' &&
      node.callee.object.property?.name === '__ModuleLoader__',
  )
  if (!call || call.arguments.length !== 1 || call.arguments[0].type !== 'ObjectExpression') {
    throw new Error('Expected one DSH client module definition')
  }

  const iconFile = join(rootDir, 'assets/plugin-icon.webp')
  const iconData = existsSync(iconFile) ? 'data:image/webp;base64,' + readFileSync(iconFile).toString('base64') : null

  const arg = call.arguments[0]
  const participant = {
    name: pkg.name,
    version: '0.1.0',
    hasWorkbench: !!explicitFooter || pages.length > 0,
    packageVersion: pkg.version,
    label: 'Blender 3D',
    labelEn: 'Blender 3D',
    suiteComponent: false,
    sectionIds,
    iconData,
  }
  const body =
    source.slice(0, arg.start) +
    '__stardustUpdatesWrap(' +
    source.slice(arg.start, arg.end) +
    ',' +
    JSON.stringify(participant) +
    ')' +
    source.slice(arg.end)

  const kit = readFileSync(join(updatesLibDir, 'ui-kit.js'), 'utf8').replace(/\r\n/g, '\n')
  const client = readFileSync(join(updatesLibDir, 'ui-client.js'), 'utf8').replace(/\r\n/g, '\n')
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(
    destination,
    '// Generated: shared optional update controls; edit the original client templates.\n(function(){\n' +
      kit +
      '\n' +
      client +
      '\n' +
      START +
      '\n' +
      body +
      '\n' +
      END +
      '\n})();\n',
  )
}

try {
  buildClient(root, target)
} catch (error) {
  if (error && error.message === 'Unknown participant package') {
    wrapCompatibleClient(root, target)
  } else {
    throw error
  }
}
