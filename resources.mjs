import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import contract from './contracts/plugin.json' with { type: 'json' }
import { validateModel } from './sdk/harness/contracts.mjs'
import { settingsStore, accountKey, maskSecrets, mergeSecrets } from './settings.mjs'

const locks = new Map()
const resourceName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const serverName = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/
const reserved = new Set(['__proto__', 'prototype', 'constructor'])
const MASK = '••••••••'

export async function readResources(ctx, identity, key) {
  const value = await settingsStore(ctx, identity).get(key) || []
  return validateModel(contract, key === 'skills' ? 'skillList' : 'mcpList', value)
}

async function update(ctx, identity, key, change) {
  const lock = `${ctx.paths.dataDir}/${accountKey(identity)}/${key}`
  const previous = locks.get(lock) || Promise.resolve()
  const operation = previous.catch(() => {}).then(async () => {
    const result = change(await readResources(ctx, identity, key))
    validateModel(contract, key === 'skills' ? 'skillList' : 'mcpList', result)
    if (Buffer.byteLength(JSON.stringify(result)) > 2000000) throw new Error('OMP resources are too large')
    await settingsStore(ctx, identity).set(key, result)
    return { ok: true }
  })
  locks.set(lock, operation)
  try { return await operation } finally { if (locks.get(lock) === operation) locks.delete(lock) }
}

export function saveSkill(ctx, identity, input) {
  validateModel(contract, 'skill', input)
  if (!resourceName.test(input.name) || input.name.length > 64 || reserved.has(input.name)) throw new Error('Use a lowercase skill name with letters, numbers and single hyphens')
  if (!input.description.trim() || !input.content.trim()) throw new Error('Skill description and Markdown content are required')
  return update(ctx, identity, 'skills', entries => [...entries.filter(item => item.name !== input.name), {
    ...input, description: input.description.trim(),
  }])
}

export const removeResource = (ctx, identity, key, name) => update(ctx, identity, key, entries => entries.filter(item => item.name !== name))

export function visibleServers(entries) {
  return entries.map(item => ({ ...item, config: {
    ...maskSecrets(item.config),
    ...Object.fromEntries(['env', 'headers'].filter(key => item.config[key]).map(key => [key,
      Object.fromEntries(Object.entries(item.config[key]).map(([name, value]) => [name, value ? MASK : value])),
    ])),
  } }))
}

function validateServer(config) {
  if (config.command !== undefined && config.url !== undefined) throw new Error('MCP config cannot contain both command and url')
  const type = config.type || (config.url ? 'http' : 'stdio')
  if (!['stdio', 'http', 'sse'].includes(type)) throw new Error('MCP type must be stdio, http or sse')
  if (type === 'stdio') {
    if (typeof config.command !== 'string' || !config.command.trim()) throw new Error('A stdio MCP server requires a command')
    if (config.args !== undefined && (!Array.isArray(config.args) || config.args.some(arg => typeof arg !== 'string'))) throw new Error('MCP args must be an array of strings')
  } else {
    let url
    try { url = new URL(config.url) } catch { throw new Error('An HTTP/SSE MCP server requires an HTTP or HTTPS URL') }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('MCP URL must use HTTP or HTTPS')
  }
  for (const key of ['env', 'headers']) {
    if (config[key] !== undefined && (!config[key] || typeof config[key] !== 'object' || Array.isArray(config[key]) || Object.values(config[key]).some(value => typeof value !== 'string'))) throw new Error(`MCP ${key} must be an object of strings`)
  }
  if (config.enabled !== undefined) throw new Error('Use the MCP enabled switch instead of config.enabled')
}

export function saveServer(ctx, identity, input) {
  validateModel(contract, 'mcpServer', input)
  if (!serverName.test(input.name) || reserved.has(input.name)) throw new Error('Use an MCP name with letters, numbers, underscores, dots or hyphens')
  validateServer(input.config)
  return update(ctx, identity, 'mcp', entries => {
    const old = entries.find(item => item.name === input.name)?.config
    const config = structuredClone(input.config)
    for (const key of ['env', 'headers']) for (const name of Object.keys(config[key] || {})) {
      if (config[key][name] !== MASK) continue
      if (typeof old?.[key]?.[name] !== 'string') throw new Error(`Enter a value for ${key}.${name}`)
      config[key][name] = old[key][name]
    }
    return [...entries.filter(item => item.name !== input.name), { ...input, config: mergeSecrets(config, old) }]
  })
}

export async function runtimeResources(ctx, identity, directory, managedServers = {}, signal) {
  signal?.throwIfAborted()
  const [skills, servers] = await Promise.all([readResources(ctx, identity, 'skills'), readResources(ctx, identity, 'mcp')])
  const skillDirectory = join(directory, 'skills')
  await mkdir(skillDirectory, { recursive: true, mode: 0o700 })
  for (const skill of skills.filter(item => item.enabled)) {
    signal?.throwIfAborted()
    // Validate persisted names before using them as path segments.
    if (!resourceName.test(skill.name) || reserved.has(skill.name)) throw new Error('Invalid saved skill name')
    const target = join(skillDirectory, skill.name)
    await mkdir(target, { recursive: true, mode: 0o700 })
    await writeFile(join(target, 'SKILL.md'), `---\nname: ${JSON.stringify(skill.name)}\ndescription: ${JSON.stringify(skill.description)}\n---\n\n${skill.content}\n`, { mode: 0o600 })
  }
  return { skillDirectory, mcpServers: { ...Object.fromEntries(servers.filter(item => item.enabled).map(item => [item.name, item.config])), ...managedServers } }
}
