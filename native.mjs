import { homedir } from 'node:os'
import { join, resolve, dirname, matchesGlob } from 'node:path'
import { readFile, readdir, mkdir, lstat, stat, rename, writeFile, rm } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { load, dump, JSON_SCHEMA } from './vendor/js-yaml.mjs'
import contract from './contracts/plugin.json' with { type: 'json' }
import { validateModel } from './sdk/harness/contracts.mjs'

const object = value => value && typeof value === 'object' && !Array.isArray(value)
const segment = value => typeof value === 'string' && value.length <= 256 && value !== '.' && value !== '..' && !/[\\/\0]/.test(value) && !!value
const locks = new Map()

export function nativeDirectory(env = process.env, home = homedir()) {
  const profile = (env.OMP_PROFILE ?? env.PI_PROFILE ?? '').trim()
  if (profile && profile !== 'default') {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(profile) || profile === '..') throw new Error('Invalid OMP profile')
    return join(home, env.PI_CONFIG_DIR || '.omp', 'profiles', profile, 'agent')
  }
  return env.PI_CODING_AGENT_DIR ? resolve(env.PI_CODING_AGENT_DIR) : join(home, env.PI_CONFIG_DIR || '.omp', 'agent')
}

export async function withNativeLock(directory, action) {
  const previous = locks.get(directory) || Promise.resolve()
  const operation = previous.catch(() => {}).then(action)
  locks.set(directory, operation)
  try { return await operation } finally { if (locks.get(directory) === operation) locks.delete(directory) }
}

async function text(file, fallback = '') {
  try {
    if ((await stat(file)).size > 2_000_000) throw new Error(`OMP file is too large: ${file}`)
    return await readFile(file, 'utf8')
  } catch (error) { if (error.code === 'ENOENT') return fallback; throw error }
}
function yaml(source, file) {
  let value
  try { value = load(source, { schema: JSON_SCHEMA }) ?? {} } catch { throw new Error(`Invalid OMP YAML: ${file}`) }
  if (!object(value)) throw new Error(`Expected an OMP YAML object: ${file}`)
  return validateModel(contract, 'nativeObject', value)
}
export async function atomicWrite(file, content) {
  await mkdir(dirname(file), { recursive: true, mode: 0o700 })
  // Preserve a user-owned file symlink rather than replacing the link itself.
  const { realpath } = await import('node:fs/promises')
  try { file = await realpath(file) } catch (error) { if (error.code !== 'ENOENT') throw error }
  const temporary = join(dirname(file), `.omp-${randomUUID()}.tmp`)
  try { await writeFile(temporary, content, { mode: 0o600 }); await rename(temporary, file) }
  finally { await rm(temporary, { force: true }) }
}
async function configuration(directory) {
  let file = join(directory, 'config.yml')
  let source = await text(file, null)
  if (source === null) { file = join(directory, 'config.yaml'); source = await text(file, '') }
  return { file: source ? file : join(directory, 'config.yml'), value: yaml(source, file) }
}
const strings = value => Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
const matches = (patterns, name) => strings(patterns).some(pattern => matchesGlob(name, pattern))
function skillEnabled(config, name) {
  return config.skills?.enabled !== false && !matches(config.skills?.ignoredSkills, name)
    && (!strings(config.skills?.includeSkills).length || matches(config.skills.includeSkills, name))
}
function parseSkill(source, file) {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
  if (!match) throw new Error(`Missing Skill frontmatter: ${file}`)
  return { metadata: yaml(match[1], file), content: source.slice(match[0].length).replace(/^\r?\n/, '').replace(/\r?\n$/, '') }
}

export async function nativeSkills(directory = nativeDirectory()) {
  const skills = [], warnings = []
  const { value: config } = await configuration(directory)
  let entries
  try { entries = await readdir(join(directory, 'skills'), { withFileTypes: true }) }
  catch (error) { if (error.code === 'ENOENT') return { skills, warnings }; throw error }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.') || !entry.isDirectory() && !entry.isSymbolicLink()) continue
    const path = join(directory, 'skills', entry.name, 'SKILL.md')
    try {
      const source = await text(path, null)
      if (source === null) continue
      const { metadata, content } = parseSkill(source, path)
      const skill = { name: metadata.name || entry.name, description: metadata.description, content,
        enabled: skillEnabled(config, metadata.name || entry.name), source: 'global', id: entry.name, path,
        readOnly: entry.isSymbolicLink() || (await lstat(path)).isSymbolicLink() }
      skills.push(validateModel(contract, 'skill', skill))
    } catch { warnings.push(`Cannot read Skill: ${path}`) }
  }
  return { skills, warnings }
}

export async function writeNativeSkill(input, remove = false, directory = nativeDirectory()) {
  if (input.id && (!segment(input.id) || input.id.startsWith('.'))) throw new Error('Invalid native Skill directory')
  return withNativeLock(directory, async () => {
    const known = (await nativeSkills(directory)).skills.find(item => input.id ? item.id === input.id : item.name === input.name)
    const id = input.id || known?.id || input.name
    if (!segment(id) || id.startsWith('.')) throw new Error('Invalid native Skill directory')
    const folder = join(directory, 'skills', id), file = join(folder, 'SKILL.md')
    const oldText = await text(file, null)
    // Linked skills are visible and loadable; their source files belong to another manager.
    for (const path of [folder, file]) {
      try { if ((await lstat(path)).isSymbolicLink()) throw new Error('Linked Skills are read-only') }
      catch (error) { if (error.code !== 'ENOENT') throw error }
    }
    if (oldText !== null && (parseSkill(oldText, file).metadata.name || id) !== input.name) throw new Error('The native Skill changed; refresh before editing')
    if (remove) { if (oldText !== null) await rm(folder, { recursive: true, force: true }); return { ok: true } }
    const { file: configFile, value: config } = await configuration(directory)
    const ignored = strings(config.skills?.ignoredSkills).filter(name => name !== input.name)
    if (input.enabled && !skillEnabled({ ...config, skills: { ...config.skills, ignoredSkills: ignored } }, input.name)) {
      throw new Error('This Skill is excluded by the global skills settings in config.yml')
    }
    const metadata = oldText === null ? {} : parseSkill(oldText, file).metadata
    metadata.name = input.name; metadata.description = input.description
    await atomicWrite(file, `---\n${dump(metadata, { schema: JSON_SCHEMA, lineWidth: -1, noRefs: true })}---\n\n${input.content}\n`)
    const nextIgnored = input.enabled ? ignored : [...ignored, input.name]
    if (JSON.stringify(nextIgnored) !== JSON.stringify(strings(config.skills?.ignoredSkills))) {
      config.skills = { ...config.skills, ignoredSkills: nextIgnored }
      await atomicWrite(configFile, dump(config, { schema: JSON_SCHEMA, lineWidth: -1, noRefs: true }))
    }
    return { ok: true }
  })
}

async function mcpDocument(file) {
  const source = await text(file, null)
  if (source === null) return { mcpServers: {} }
  let value
  try { value = JSON.parse(source) } catch { throw new Error(`Invalid OMP MCP JSON: ${file}`) }
  validateModel(contract, 'nativeObject', value)
  if (value.mcpServers !== undefined && !object(value.mcpServers)) throw new Error(`Invalid mcpServers: ${file}`)
  return value
}
export async function nativeServers(directory = nativeDirectory()) {
  const primary = await mcpDocument(join(directory, 'mcp.json')), secondary = await mcpDocument(join(directory, '.mcp.json'))
  const servers = [], warnings = [], seen = new Set()
  for (const [id, document] of [['mcp.json', primary], ['.mcp.json', secondary]]) {
    for (const [name, raw] of Object.entries(document.mcpServers || {})) {
      if (seen.has(name)) continue
      seen.add(name)
      const path = join(directory, id)
      try {
        if (!object(raw)) throw new Error('Invalid server')
        const { enabled, ...config } = raw
        const active = ![false, 'false', '0'].includes(typeof enabled === 'string' ? enabled.toLowerCase() : enabled) || strings(primary.enabledServers).includes(name)
        servers.push(validateModel(contract, 'mcpServer', { name, config, enabled: active && !strings(primary.disabledServers).includes(name), source: 'global', id, path }))
      } catch { warnings.push(`Cannot read MCP server ${name}: ${path}`) }
    }
  }
  return { servers, warnings }
}
export async function writeNativeServer(input, merge, remove = false, directory = nativeDirectory()) {
  if (input.id && !['mcp.json', '.mcp.json'].includes(input.id)) throw new Error('Invalid native MCP file')
  return withNativeLock(directory, async () => {
    const known = (await nativeServers(directory)).servers.find(item => item.name === input.name)
    const file = join(directory, input.id || known?.id || 'mcp.json'), document = await mcpDocument(file)
    const servers = { ...document.mcpServers }
    if (remove) delete servers[input.name]
    else servers[input.name] = { ...merge(input.config, document.mcpServers?.[input.name]), enabled: input.enabled }
    document.mcpServers = servers
    const primaryFile = join(directory, 'mcp.json'), primary = file === primaryFile ? document : await mcpDocument(primaryFile)
    for (const key of ['disabledServers', 'enabledServers']) {
      if (Array.isArray(primary[key])) primary[key] = primary[key].filter(name => name !== input.name)
    }
    await atomicWrite(file, JSON.stringify(validateModel(contract, 'nativeObject', document), null, 2) + '\n')
    if (file !== primaryFile && (primary.disabledServers || primary.enabledServers)) await atomicWrite(primaryFile, JSON.stringify(primary, null, 2) + '\n')
    return { ok: true }
  })
}
