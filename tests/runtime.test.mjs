import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cp, chmod, mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setup } from './support.mjs'
import contract from '../contracts/plugin.json' with { type: 'json' }
import { validateModel } from '../sdk/harness/contracts.mjs'

async function runtime(t) {
  const f = await setup(t), executable = join(f.directory, 'omp')
  await cp(new URL('./fixtures/omp-rpc.mjs', import.meta.url), executable)
  await chmod(executable, 0o700)
  await f.call('save-settings', { executable, defaultModel: 'custom/test', config: {}, models: { providers: {
    custom: { api: 'openai-completions', apiKey: 'private-key', models: [{ id: 'test' }] },
  } } })
  const paths = { runtimeDir: join(f.directory, 'runtime'), workspaceDir: join(f.directory, 'workspace') }
  await mkdir(paths.workspaceDir)
  const events = [], controller = new AbortController(), resources = []
  const run = { identity: { ...f.identity, sessionId: 'session', runId: 'run-1' }, paths, signal: controller.signal,
    mode: 'global', model: { model: 'custom/test' }, mcpServers: {}, resources: { add(fn) { resources.push(fn) } },
    events: { async emit(event) { events.push(event) } },
    attachments: { async read() { return Uint8Array.of(1, 2, 3) }, async resolve() { return { localPath: join(paths.workspaceDir, 'file.txt') } } },
    interactions: { async approve() { return { outcome: 'denied' } }, async clarify() { return { outcome: 'dismissed' } } },
  }
  t.after(async () => { for (const dispose of resources) await dispose() })
  const session = await f.agent.runtime.createSession({ paths })
  const input = { input: [{ type: 'text', text: 'hello' }], history: [], instructions: [], options: {} }
  return { ...f, session, input, run, events, controller }
}

test('native RPC returns streamed events and usage, and resumes a persisted session', async t => {
  const f = await runtime(t)
  validateModel(contract, 'newCheckpoint', await f.session.checkpoint())
  const first = await f.session.run(f.input, f.run)
  assert.deepEqual(first.content, [{ type: 'text', text: 'fixture turn 1; images=0; model=custom/test' }])
  assert.equal(first.usage.inputTokens, 12)
  assert.equal(first.usage.outputTokens, 5)
  assert.equal(f.events.find(event => event.type === 'tool.completed').result.truncated, true)
  validateModel(contract, 'resumableCheckpoint', first.checkpoint)
  validateModel(contract, 'sessionPointer', JSON.parse(await readFile(join(f.run.paths.runtimeDir, 'native-session.json'), 'utf8')))
  const next = await f.agent.runtime.createSession({ paths: f.run.paths, resumeState: first.checkpoint })
  const second = await next.run(f.input, { ...f.run, identity: { ...f.run.identity, runId: 'run-2' } })
  assert.equal(second.content[0].text, 'fixture turn 2; images=0; model=custom/test')
  await assert.rejects(readFile(join(f.run.paths.runtimeDir, 'turns/run-1/models.yml')), { code: 'ENOENT' })
})

test('scoped models and image attachments use the injected binding, then remove temporary credentials', async t => {
  const f = await runtime(t)
  const result = await f.session.run({ ...f.input, input: [...f.input.input, { type: 'image', assetId: 'image', mediaType: 'image/png' }] },
    { ...f.run, mode: 'scoped', model: { model: 'selected', apiMode: 'chat_completions', baseUrl: 'http://studio-proxy/v1', token: 'temporary-token' } })
  assert.equal(result.content[0].text, 'fixture turn 1; images=1; model=studio/selected')
  await assert.rejects(readFile(join(f.run.paths.runtimeDir, 'turns/run-1/models.yml')), { code: 'ENOENT' })
})

test('cancelling a live turn closes the process and clears its temporary configuration', { timeout: 10000 }, async t => {
  const f = await runtime(t)
  let started
  const ready = new Promise(resolve => { started = resolve })
  f.run.events.emit = async event => { if (event.type === 'text.delta') started() }
  const running = f.session.run({ ...f.input, input: [{ type: 'text', text: 'hold' }] }, f.run)
  const rejected = assert.rejects(running, /Stopped by test/)
  await ready
  f.controller.abort(new Error('Stopped by test'))
  await rejected
  await assert.rejects(readFile(join(f.run.paths.runtimeDir, 'turns/run-1/models.yml')), { code: 'ENOENT' })
})

test('checkpoints cannot point outside the assigned runtime directory', async t => {
  const f = await runtime(t)
  for (const sessionFile of ['../other/session.jsonl', '/tmp/other-session.jsonl']) {
    await assert.rejects(f.agent.runtime.createSession({ paths: f.run.paths, resumeState: { schemaVersion: 1, data: { sessionFile } } }), /Invalid OMP session checkpoint/)
  }
})
