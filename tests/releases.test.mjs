import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { binaryAsset } from '../engine.mjs'
import { setup } from './support.mjs'

const repository = 'https://github.com/can1357/oh-my-pi'
let moduleId = 0
const fresh = () => import(`../engine.mjs?release-test=${++moduleId}`)
const redirect = (location = `${repository}/releases/tag/v18.19.0`) => new Response(null, { status: 302, headers: { location } })

test('queries the public release redirect when anonymous GitHub REST access is rate limited, then caches it', async t => {
  const { latestVersion } = await fresh()
  const request = t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.startsWith('https://api.github.com/')) return new Response('API rate limit exceeded', { status: 403 })
    assert.equal(url, `${repository}/releases/latest`)
    assert.equal(options.method, 'HEAD')
    assert.equal(options.redirect, 'manual')
    return redirect()
  })
  assert.equal(await latestVersion(), '18.19.0')
  assert.equal(await latestVersion(), '18.19.0')
  assert.equal(request.mock.callCount(), 1)
})

test('rejects invalid releases and temporary upstream errors without caching a false version', async t => {
  const { latestVersion } = await fresh()
  let response
  t.mock.method(globalThis, 'fetch', async () => response)
  for (const location of ['https://example.com/can1357/oh-my-pi/releases/tag/v18.19.0', 'https://github.com/other/repo/releases/tag/v18.19.0', `${repository}/releases/tag/latest`, `${repository}/releases/tag/v18.19.0/extra`, `${repository}/releases/tag/v18.19.0?unexpected=1`]) {
    response = redirect(location)
    await assert.rejects(latestVersion(), { status: 503, code: 'OMP_RELEASE_LOOKUP' })
  }
  response = new Response(null, { status: 429 })
  await assert.rejects(latestVersion(), /HTTP 429/)
  response = new Response(null, { status: 302 })
  await assert.rejects(latestVersion(), /did not return a release redirect/)
  response = redirect('/can1357/oh-my-pi/releases/tag/v18.20.0')
  assert.equal(await latestVersion(), '18.20.0')
})

test('expires cached versions, recovers from a network failure and honors cancellation even with a cache', async t => {
  const { latestVersion } = await fresh()
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() })
  let failed = false
  const request = t.mock.method(globalThis, 'fetch', async () => {
    if (failed) throw new Error('Connection refused')
    return redirect()
  })
  assert.equal(await latestVersion(), '18.19.0')
  const controller = new AbortController(); controller.abort(new Error('Cancelled by user'))
  await assert.rejects(latestVersion(controller.signal), /Cancelled by user/)
  assert.equal(request.mock.callCount(), 1)
  t.mock.timers.tick(300001); failed = true
  await assert.rejects(latestVersion(), { status: 503, code: 'OMP_RELEASE_LOOKUP' })
  failed = false
  assert.equal(await latestVersion(), '18.19.0')
  assert.equal(request.mock.callCount(), 3)
})

test('checks and installs an absent engine through the public release and verified download chain', async t => {
  const f = await setup(t), binary = await readFile(new URL('./fixtures/omp-rpc.mjs', import.meta.url))
  const checksum = createHash('sha256').update(binary).digest('hex')
  const request = t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === `${repository}/releases/latest`) { assert.equal(options.method, 'HEAD'); return redirect() }
    assert.ok(url.startsWith(`${repository}/releases/download/v18.19.0/`))
    if (url.endsWith('/SHA256SUMS.txt')) return new Response(`${checksum}  ${binaryAsset()}\n`)
    if (url.endsWith('/LICENSE')) return new Response('Engine license fixture')
    assert.ok(url.endsWith('/' + binaryAsset()))
    return new Response(binary)
  })
  const run = { identity: f.identity, signal: new AbortController().signal, progress() {} }
  assert.deepEqual(await f.agent.management.checkUpdate(run), { currentVersion: '', latestVersion: '18.19.0', updateAvailable: true })
  assert.deepEqual(await f.agent.management.upgrade({ version: '18.19.0', expectedVersion: '' }, run), { installedVersion: '18.19.0' })
  assert.equal((await f.agent.getStatus(run)).version, '18.19.0')
  assert.deepEqual(await f.agent.management.checkUpdate(run), { currentVersion: '18.19.0', latestVersion: '18.19.0', updateAvailable: false })
  assert.equal(request.mock.callCount(), 4)
})
