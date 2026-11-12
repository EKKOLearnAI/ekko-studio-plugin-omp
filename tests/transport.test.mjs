import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { OmpRpc } from '../rpc.mjs'
import { binaryAsset, installEngine, engineStatus, removeEngine } from '../engine.mjs'
import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { createHash } from 'node:crypto'

test('reassembles UTF-8 chunks and rejects out-of-order frames', async t => {
  const rpc = Object.assign(Object.create(OmpRpc.prototype), { pending: new Map(), listeners: new Set(), onEvent: t.mock.fn(), chunk: null })
  const bytes = Buffer.from(JSON.stringify({ type: 'fixture', text: '模型输出'.repeat(1000) }))
  const frame = (index, data) => ({ type: 'rpc_chunk', chunkId: 'large', index, count: 2, byteLength: bytes.length, data: data.toString('base64') })
  await rpc.frame(frame(0, bytes.subarray(0, 101)))
  assert.equal(rpc.onEvent.mock.callCount(), 0)
  await rpc.frame(frame(1, bytes.subarray(101)))
  assert.deepEqual(rpc.onEvent.mock.calls[0].arguments, [JSON.parse(bytes.toString()), rpc])
  await rpc.frame(frame(0, bytes.subarray(0, 101)))
  await assert.rejects(rpc.frame(frame(0, bytes.subarray(101))), /Invalid OMP chunk sequence/)
})

test('a corrupt download retains the selected engine and removes the partial installation', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'omp-install-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const selected = JSON.stringify({ version: '18.18.0', asset: binaryAsset() })
  await writeFile(join(directory, 'engine.json'), selected)
  t.mock.method(globalThis, 'fetch', async url => new Response(url.endsWith('SHA256SUMS.txt') ? `${'0'.repeat(64)}  ${binaryAsset()}\n` : 'broken binary'))
  await assert.rejects(installEngine(directory, '18.19.0', new AbortController().signal), /checksum verification failed/)
  assert.equal(await readFile(join(directory, 'engine.json'), 'utf8'), selected)
  assert.deepEqual(await readdir(join(directory, 'engines')), [])
})

test('installs and removes a verified real engine only in the private directory', { skip: !process.env.STUDIO_TEST_OMP_BINARY, timeout: 60000 }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'omp-managed-')), binary = process.env.STUDIO_TEST_OMP_BINARY
  t.after(() => rm(directory, { recursive: true, force: true }))
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(binary)) hash.update(chunk)
  const checksum = hash.digest('hex')
  t.mock.method(globalThis, 'fetch', async url => {
    if (url.endsWith('/SHA256SUMS.txt')) return new Response(`${checksum}  ${binaryAsset()}\n`)
    if (url.endsWith('/LICENSE')) return new Response('MIT engine license fixture')
    return new Response(Readable.toWeb(createReadStream(binary)))
  })
  assert.deepEqual(await installEngine(directory, '18.19.0', new AbortController().signal), { installedVersion: '18.19.0' })
  const status = await engineStatus(directory, '', new AbortController().signal)
  assert.equal(status.installed, true)
  assert.equal(status.source, 'managed')
  assert.equal(status.version, '18.19.0')
  assert.equal(await readFile(join(directory, 'engines/18.19.0/LICENSE'), 'utf8'), 'MIT engine license fixture')
  await writeFile(join(directory, 'keep-settings'), 'keep')
  await removeEngine(directory, new AbortController().signal)
  assert.equal((await engineStatus(directory, '', new AbortController().signal)).installed, false)
  assert.equal(await readFile(join(directory, 'keep-settings'), 'utf8'), 'keep')
  await access(binary)
})
