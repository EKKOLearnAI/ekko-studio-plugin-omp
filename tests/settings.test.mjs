import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readSettings } from '../settings.mjs'
import contract from '../contracts/plugin.json' with { type: 'json' }
import { assertContracts, validateModel } from '../sdk/harness/contracts.mjs'

import { setup } from './support.mjs'

test('actual RPC and storage values match the described contract; secrets and identities remain isolated', async t => {
  assertContracts(contract)
  const f = await setup(t), defaults = await f.call('get-settings', null)
  assert.deepEqual(defaults.models, { providers: {} })
  const input = { ...defaults, defaultModel: 'custom/test', models: { providers: { custom: { apiKey: 'private-key', models: [{ id: 'test' }] } } } }
  assert.deepEqual(await f.call('save-settings', input), { ok: true })
  const visible = await f.call('get-settings', null)
  assert.equal(visible.models.providers.custom.apiKey, '••••••••')
  await f.call('save-settings', { ...visible, defaultModel: '' })
  const stored = await readSettings(f.ctx, f.identity)
  assert.equal(stored.models.providers.custom.apiKey, 'private-key')
  assert.equal(stored.status, undefined)
  for (const who of [{ userId: 2, profile: 'work' }, { userId: 1, profile: 'other' }]) {
    assert.deepEqual((await f.call('get-settings', null, who)).models, { providers: {} })
  }
})

test('invalid paths, native settings and prototype keys never overwrite saved settings', async t => {
  const f = await setup(t), initial = await f.call('get-settings', null)
  await assert.rejects(f.call('save-settings', { ...initial, executable: './omp' }), /absolute path/)
  await assert.rejects(f.call('save-settings', { ...initial, defaultModel: 'invalid' }), /provider\/model/)
  await assert.rejects(f.call('save-settings', { ...initial, models: [] }), /expected object/)
  const { saveSettings } = await import('../settings.mjs')
  await assert.rejects(saveSettings(f.ctx, f.identity, { ...initial, config: JSON.parse('{"__proto__":{"polluted":true}}') }), /Invalid configuration key/)
  assert.deepEqual((await f.call('get-settings', null)).models, { providers: {} })
})
