import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile, symlink, access } from 'node:fs/promises'
import { join } from 'node:path'
import { setup } from './support.mjs'
import { nativeDirectory } from '../native.mjs'
import { runtimeResources, readResources } from '../resources.mjs'

async function seedSkill(f, id = 'review', name = id) {
  const folder = join(f.nativeDirectory, 'skills', id)
  await mkdir(join(folder, 'scripts'), { recursive: true })
  await writeFile(join(folder, 'SKILL.md'), `---\nname: ${name}\ndescription: >-\n  Review code and tests\nlicense: MIT\nmetadata:\n  author: test\n---\n\nRead scripts/check.sh first.`)
  await writeFile(join(folder, 'scripts/check.sh'), 'echo check\n')
  return folder
}

test('resolves default, explicit and named native directories without confusing a Studio Profile with an OMP profile', () => {
  assert.equal(nativeDirectory({}, '/home/test'), '/home/test/.omp/agent')
  assert.equal(nativeDirectory({ PI_CODING_AGENT_DIR: '/tmp/native' }, '/home/test'), '/tmp/native')
  assert.equal(nativeDirectory({ OMP_PROFILE: 'work', PI_CODING_AGENT_DIR: '/tmp/other' }, '/home/test'), '/home/test/.omp/profiles/work/agent')
  assert.equal(nativeDirectory({ OMP_PROFILE: '', PI_PROFILE: 'work' }, '/home/test'), '/home/test/.omp/agent')
  assert.throws(() => nativeDirectory({ OMP_PROFILE: '../escape' }, '/home/test'), /Invalid OMP profile/)
})

test('discovers existing native skills, preserves metadata and scripts on edit, and applies native enable/disable rules', async t => {
  const f = await setup(t), folder = await seedSkill(f, 'folder-name', 'review')
  const listed = await f.call('list-skills', null)
  assert.equal(listed.directory, f.nativeDirectory)
  assert.equal(listed.skills[0].description, 'Review code and tests')
  assert.equal(listed.skills[0].id, 'folder-name')
  assert.equal(listed.skills[0].source, 'global')
  const file = listed.skills[0].path
  await f.call('save-skill', { ...listed.skills[0], description: 'Updated', enabled: false })
  assert.match(await readFile(file, 'utf8'), /license: MIT/)
  assert.match(await readFile(file, 'utf8'), /author: test/)
  assert.equal(await readFile(join(folder, 'scripts/check.sh'), 'utf8'), 'echo check\n')
  assert.equal((await f.call('list-skills', null)).skills[0].enabled, false)
  let snapshot = await runtimeResources(f.ctx, f.identity, join(f.directory, 'turn-1'))
  await assert.rejects(access(join(snapshot.skillDirectory, 'review')), { code: 'ENOENT' })
  await f.call('save-skill', { ...listed.skills[0], description: 'Updated', enabled: true })
  snapshot = await runtimeResources(f.ctx, f.identity, join(f.directory, 'turn-2'))
  assert.equal(await readFile(join(snapshot.skillDirectory, 'review/scripts/check.sh'), 'utf8'), 'echo check\n')
  assert.equal((await f.call('list-skills', null)).skills[0].enabled, true)
  await f.call('remove-skill', { name: 'review', id: 'folder-name', source: 'global' })
  await assert.rejects(access(folder), { code: 'ENOENT' })
})

test('linked and malformed skills remain safe to inspect, and native path inputs cannot escape the resource directory', async t => {
  const f = await setup(t), external = await seedSkill(f)
  await symlink(external, join(f.nativeDirectory, 'skills', 'alias'), process.platform === 'win32' ? 'junction' : 'dir')
  await mkdir(join(f.nativeDirectory, 'skills', 'broken'))
  await writeFile(join(f.nativeDirectory, 'skills', 'broken/SKILL.md'), '---\nname: [\n---\ninvalid')
  const result = await f.call('list-skills', null)
  const link = result.skills.find(item => item.id === 'alias')
  assert.equal(link.readOnly, true)
  assert.equal(result.warnings.length, 1)
  await assert.rejects(f.call('save-skill', { ...link, description: 'No write' }), /read-only/)
  await assert.rejects(f.call('remove-skill', { name: link.name, id: link.id }), /read-only/)
  for (const id of ['../outside', '/outside', '..']) await assert.rejects(f.call('remove-skill', { name: 'review', id }), /Invalid native/)
  await access(join(external, 'SKILL.md'))
})

test('loads both native MCP files with precedence, masks secrets and preserves unrelated on-disk changes and top-level fields', async t => {
  const f = await setup(t)
  await mkdir(f.nativeDirectory)
  const primary = join(f.nativeDirectory, 'mcp.json'), secondary = join(f.nativeDirectory, '.mcp.json')
  const source = { $schema: 'https://example.com/schema', disabledServers: ['docs'], enabledServers: ['local'], custom: { keep: true }, mcpServers: {
    docs: { type: 'http', url: 'https://example.com/mcp', headers: { Authorization: 'private-token' }, timeout: 1000, enabled: 'FALSE' },
  } }
  await writeFile(primary, JSON.stringify(source))
  await writeFile(secondary, JSON.stringify({ mcpServers: { docs: { command: 'shadowed' }, local: { command: 'node', enabled: false, env: { CUSTOM: 'private-env' } } } }))
  const result = await f.call('list-mcp', null)
  assert.equal(result.servers.length, 2)
  const docs = result.servers.find(item => item.name === 'docs'), local = result.servers.find(item => item.name === 'local')
  assert.equal(docs.enabled, false)
  assert.equal(local.enabled, true)
  assert.equal(local.id, '.mcp.json')
  assert.equal(docs.config.headers.Authorization, '••••••••')
  assert.equal(local.config.env.CUSTOM, '••••••••')
  source.mcpServers.external = { command: 'external-change' }
  await writeFile(primary, JSON.stringify(source))
  await f.call('save-mcp', { ...docs, enabled: true })
  const saved = JSON.parse(await readFile(primary, 'utf8'))
  assert.equal(saved.mcpServers.docs.headers.Authorization, 'private-token')
  assert.equal(saved.mcpServers.external.command, 'external-change')
  assert.equal(saved.custom.keep, true)
  assert.equal(saved.$schema, source.$schema)
  assert.deepEqual(saved.disabledServers, [])
  await f.call('save-mcp', { ...local, enabled: false })
  assert.equal((await f.call('list-mcp', null)).servers.find(item => item.name === 'local').enabled, false)
  const injected = { docs: { url: 'http://studio/mcp', headers: { Authorization: 'temporary' } } }
  const snapshot = await runtimeResources(f.ctx, f.identity, join(f.directory, 'turn'), injected)
  assert.deepEqual(snapshot.mcpServers.docs, injected.docs)
  assert.equal(snapshot.mcpServers.local, undefined)
  assert.doesNotMatch(await readFile(primary, 'utf8'), /temporary/)
})

test('new resources use native files, old resources remain private and same-name edits/deletes target the selected source', async t => {
  const f = await setup(t)
  const skill = { name: 'review', description: 'Review', content: 'Check code.', enabled: true }
  await f.call('save-skill', skill)
  await f.call('save-skill', { ...skill, source: 'profile', content: 'Private code.' })
  await f.call('save-mcp', { name: 'local', config: { command: 'node' }, enabled: true })
  await Promise.all(['one', 'two', 'three'].map(name => f.call('save-mcp', { name, config: { command: 'node' }, enabled: true })))
  const nativeFile = join(f.nativeDirectory, 'mcp.json')
  assert.equal(Object.keys(JSON.parse(await readFile(nativeFile, 'utf8')).mcpServers).length, 4)
  assert.equal((await f.call('list-skills', null)).skills.length, 2)
  const other = await f.call('list-skills', null, { userId: 2, profile: 'other' })
  assert.equal(other.skills.length, 1)
  assert.equal(other.skills[0].source, 'global')
  const snapshot = await runtimeResources(f.ctx, f.identity, join(f.directory, 'turn'))
  assert.match(await readFile(join(snapshot.skillDirectory, 'review/SKILL.md'), 'utf8'), /Private code/)
  await f.call('remove-skill', { name: 'review', source: 'global' })
  assert.equal((await readResources(f.ctx, f.identity, 'skills')).length, 1)
  await f.call('remove-mcp', { name: 'local', source: 'global' })
  assert.equal(JSON.parse(await readFile(nativeFile, 'utf8')).mcpServers.local, undefined)
})

test('malformed native files are reported without leaking contents or overwriting them, and invalid writes preserve files', async t => {
  const f = await setup(t)
  await mkdir(f.nativeDirectory)
  const file = join(f.nativeDirectory, 'mcp.json'), broken = '{"secret":"do-not-echo" invalid}'
  await writeFile(file, broken)
  await assert.rejects(f.call('list-mcp', null), error => /Invalid OMP MCP JSON/.test(error.message) && !error.message.includes('do-not-echo'))
  await assert.rejects(f.call('save-mcp', { name: 'new', config: { command: 'node' }, enabled: true }), /Invalid OMP MCP JSON/)
  assert.equal(await readFile(file, 'utf8'), broken)
  await writeFile(file, '{"mcpServers":{}}')
  await assert.rejects(f.call('save-mcp', { name: 'new', config: { command: 'node', env: { KEY: '••••••••' } }, enabled: true }), /Enter a value/)
  await assert.rejects(f.call('remove-mcp', { name: 'new', id: '../escape' }), /Invalid native MCP/)
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), { mcpServers: {} })
})
