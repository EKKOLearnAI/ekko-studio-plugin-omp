import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { setup } from './support.mjs'
import { readResources, runtimeResources } from '../resources.mjs'

const skill = { name: 'review-code', description: 'Review a code change', content: '# Review\nRead the diff first.', enabled: true, source: 'profile' }
const server = { name: 'docs', enabled: true, source: 'profile', config: { type: 'http', url: 'https://example.com/mcp', headers: { 'X-Credential': 'private-key' } } }

test('skill and MCP CRUD stay isolated by user/Profile and preserve the old configuration', async t => {
  const f = await setup(t)
  assert.deepEqual((await f.call('list-skills', null)).skills, [])
  assert.deepEqual((await f.call('list-mcp', null)).servers, [])
  await f.call('save-skill', skill); await f.call('save-mcp', server)
  assert.deepEqual((await f.call('list-skills', null)).skills, [skill])
  const visible = (await f.call('list-mcp', null)).servers[0]
  assert.equal(visible.config.headers['X-Credential'], '••••••••')
  await f.call('save-mcp', { ...visible, enabled: false })
  assert.equal((await readResources(f.ctx, f.identity, 'mcp'))[0].config.headers['X-Credential'], 'private-key')
  for (const who of [{ userId: 2, profile: 'work' }, { userId: 1, profile: 'other' }]) {
    assert.deepEqual((await f.call('list-skills', null, who)).skills, [])
    assert.deepEqual((await f.call('list-mcp', null, who)).servers, [])
    await f.call('remove-skill', { name: skill.name, source: 'profile' }, who)
    await assert.rejects(f.call('save-mcp', visible, who), /Enter a value/)
  }
  assert.equal((await f.call('list-skills', null)).skills.length, 1)
  assert.deepEqual((await f.call('get-settings', null)).config, {})
  await f.call('remove-skill', { name: skill.name, source: 'profile' }); await f.call('remove-mcp', { name: server.name, source: 'profile' })
  assert.deepEqual((await f.call('list-skills', null)).skills, [])
  assert.deepEqual((await f.call('list-mcp', null)).servers, [])
})

test('rejects invalid resource edits without overwriting good data and serializes concurrent writes', async t => {
  const f = await setup(t)
  await f.call('save-skill', skill); await f.call('save-mcp', server)
  for (const name of ['../escape', '/absolute', 'Upper', 'bad--name', 'constructor']) await assert.rejects(f.call('save-skill', { ...skill, name }))
  await assert.rejects(f.call('save-skill', { ...skill, description: ' ' }))
  for (const config of [ { type: 'stdio' }, { command: 'npx', url: 'https://example.com' }, { type: 'http', url: 'file:///tmp/file' },
    { command: 'npx', args: [1] }, { command: 'npx', env: { VALUE: 1 } }, { type: 'unknown', url: 'https://example.com' }, { command: 'npx', enabled: false } ]) {
    await assert.rejects(f.call('save-mcp', { ...server, config }))
  }
  await assert.rejects(f.call('save-mcp', { ...server, config: JSON.parse('{"command":"npx","__proto__":{}}') }))
  assert.equal((await f.call('list-skills', null)).skills.length, 1)
  assert.equal((await f.call('list-mcp', null)).servers[0].config.url, server.config.url)
  await Promise.all(['one', 'two', 'three'].map(name => f.call('save-skill', { ...skill, name })))
  assert.equal((await f.call('list-skills', null)).skills.length, 4)
})

test('runtime snapshots load enabled skills and MCP, with injected Studio servers winning collisions', async t => {
  const f = await setup(t)
  await f.call('save-skill', skill)
  await f.call('save-skill', { ...skill, name: 'disabled', enabled: false })
  await f.call('save-mcp', server)
  await f.call('save-mcp', { name: 'local', enabled: true, source: 'profile', config: { command: 'npx', args: [], env: { CUSTOM_CREDENTIAL: 'local-key' } } })
  await f.call('save-mcp', { ...server, name: 'off', enabled: false })
  const visible = (await f.call('list-mcp', null)).servers.find(item => item.name === 'local')
  assert.equal(visible.config.env.CUSTOM_CREDENTIAL, '••••••••')
  await f.call('save-mcp', visible)
  const injected = { docs: { type: 'http', url: 'http://studio/mcp', headers: { Authorization: 'temporary' } } }
  const resources = await runtimeResources(f.ctx, f.identity, join(f.directory, 'turn'), injected)
  assert.deepEqual(await readdir(resources.skillDirectory), [skill.name])
  assert.match(await readFile(join(resources.skillDirectory, skill.name, 'SKILL.md'), 'utf8'), /name: "review-code"\ndescription: "Review a code change"/)
  assert.deepEqual(resources.mcpServers.docs, injected.docs)
  assert.equal(resources.mcpServers.local.env.CUSTOM_CREDENTIAL, 'local-key')
  assert.equal(resources.mcpServers.off, undefined)
  assert.equal((await readResources(f.ctx, f.identity, 'mcp')).find(item => item.name === 'docs').config.headers.Authorization, undefined)
})
