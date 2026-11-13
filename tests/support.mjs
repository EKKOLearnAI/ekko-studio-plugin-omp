import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../server.mjs'
import contract from '../contracts/plugin.json' with { type: 'json' }
import { validateModel } from '../sdk/harness/contracts.mjs'

export async function setup(t) {
  const directory = await mkdtemp(join(tmpdir(), 'omp-plugin-'))
  const nativeDirectory = join(directory, 'native')
  const names = ['PI_CODING_AGENT_DIR', 'OMP_PROFILE', 'PI_PROFILE']
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]))
  process.env.PI_CODING_AGENT_DIR = nativeDirectory
  delete process.env.OMP_PROFILE; delete process.env.PI_PROFILE
  t.after(() => { for (const name of names) { if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name] } })
  const methods = new Map(), records = new Map()
  let agent
  const ctx = { paths: { dataDir: directory }, extensions: { rpc: { register(name, fn) { methods.set(name, fn) } },
    agents: { register(value) { agent = value; return { dispose() {} } } },
    }, state: { plugin: { namespace(...parts) { const prefix = JSON.stringify(parts); return {
      async get(key) { return records.get(prefix + key) },
      async set(key, value) { records.set(prefix + key, structuredClone(validateModel(contract, { settings: 'settings', skills: 'skillList', mcp: 'mcpList' }[key], value))) },
    } } } },
  }
  const dispose = apply(ctx)
  t.after(async () => { dispose(); await rm(directory, { recursive: true, force: true }) })
  const identity = { userId: 1, profile: 'work' }
  const call = async (name, input, who = identity) => {
    validateModel(contract, contract.rpc[name].input, input)
    return validateModel(contract, contract.rpc[name].output, await methods.get(name)(input, { identity: who, signal: new AbortController().signal }))
  }
  return { ctx, agent, call, identity, directory, nativeDirectory }
}
