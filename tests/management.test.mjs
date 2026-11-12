import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, writeFile, access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setup } from './support.mjs'

test('removes only managed engine files and retains account settings and native data', async t => {
  const f = await setup(t), run = { identity: f.identity, signal: new AbortController().signal }
  await mkdir(join(f.directory, 'engines', '18.19.0'), { recursive: true })
  await writeFile(join(f.directory, 'engine.json'), JSON.stringify({ version: '18.19.0', asset: 'fixture' }))
  await writeFile(join(f.directory, 'engines', '18.19.0', 'fixture'), 'managed binary')
  await writeFile(join(f.directory, 'session-data'), 'keep')
  const settings = await f.call('get-settings', null)
  await f.call('save-settings', { ...settings, defaultModel: 'custom/keep' })
  assert.equal(await f.agent.management.supportsAutoUpdate(run), true)
  await f.agent.management.remove(run)
  await assert.rejects(access(join(f.directory, 'engine.json')), { code: 'ENOENT' })
  await assert.rejects(access(join(f.directory, 'engines')), { code: 'ENOENT' })
  assert.equal(await readFile(join(f.directory, 'session-data'), 'utf8'), 'keep')
  assert.equal((await f.call('get-settings', null)).defaultModel, 'custom/keep')
  assert.equal((await f.agent.getStatus(run)).installed, false)
})

test('does not remove or automatically update a configured external executable', async t => {
  const f = await setup(t), external = join(f.directory, 'external-omp')
  await writeFile(external, 'external binary')
  await f.call('save-settings', { ...(await f.call('get-settings', null)), executable: external })
  const run = { identity: f.identity, signal: new AbortController().signal }
  assert.equal(await f.agent.management.supportsAutoUpdate(run), false)
  await assert.rejects(f.agent.management.remove(run), /managed outside Studio/)
  assert.equal(await readFile(external, 'utf8'), 'external binary')
  assert.equal(await f.agent.management.supportsAutoUpdate({ ...run, identity: { userId: 2, profile: 'other' } }), true)
})
