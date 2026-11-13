import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { setup } from '../support.mjs'

let fixture, cleanup
test.beforeEach(async ({ page }) => {
  cleanup = []
  fixture = await setup({ after: fn => cleanup.push(fn) })
  await page.exposeFunction('ompRpc', (name, input) => fixture.call(name, input ?? null))
})
test.afterEach(async () => { for (const close of cleanup.reverse()) await close() })

async function mount(page, view) {
  const source = await readFile(new URL('../../client.mjs', import.meta.url), 'utf8')
  await page.setContent(`<style>:root{--text-primary:#222;--text-secondary:#666;--border-color:#ccc;--bg-secondary:#eee;--accent-primary:#4250bb}body{font:14px system-ui;color:var(--text-primary)}*{box-sizing:border-box}button,input,textarea{font:inherit;color:inherit;padding:7px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px}button{cursor:pointer}#root{padding:20px}</style><main id="root"></main>`)
  await page.evaluate(async ({ source, view }) => {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
    window.confirmResult = true
    const module = await import(url)
    await module.mount(document.querySelector('#root'), { view, locale: 'zh', lifecycle: { add() {} },
      rpc: { call: (name, input) => window.ompRpc(name, input) }, ui: { confirm: async () => window.confirmResult, notify() {}, navigate() {} } })
    URL.revokeObjectURL(url)
  }, { source, view })
}

test('creates, edits, disables and removes skills with persisted content and cancellation', async ({ page }, testInfo) => {
  await mount(page, 'skills')
  await expect(page.getByText('还没有 Skill，点击“添加 Skill”开始。')).toBeVisible()
  await page.getByRole('button', { name: '添加 Skill', exact: true }).click()
  await page.getByRole('textbox', { name: '名称', exact: true }).fill('review')
  await page.getByRole('textbox', { name: '描述', exact: true }).fill('审查代码')
  await page.getByRole('textbox', { name: 'Skill 内容（Markdown）', exact: true }).fill('# Review\nCheck the diff.')
  await page.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(page.getByRole('article')).toContainText('review')
  await page.getByRole('button', { name: '停用 review', exact: true }).click()
  await expect(page.getByRole('article')).toContainText('已停用')
  await mount(page, 'skills')
  await page.getByRole('button', { name: '编辑 review', exact: true }).click()
  await expect(page.getByRole('textbox', { name: '名称', exact: true })).toBeDisabled()
  await expect(page.getByRole('textbox', { name: 'Skill 内容（Markdown）', exact: true })).toHaveValue('# Review\nCheck the diff.')
  await page.getByRole('textbox', { name: '描述', exact: true }).fill('审查变更与测试')
  await page.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(page.getByRole('article')).toContainText('审查变更与测试')
  await page.getByRole('searchbox').fill('missing')
  await expect(page.getByText('没有匹配的项目')).toBeVisible()
  await page.getByRole('searchbox').fill('')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('skills-mobile.png') })
  await page.evaluate(() => { window.confirmResult = false })
  await page.getByRole('button', { name: '删除 review', exact: true }).click()
  await expect(page.getByRole('article')).toContainText('review')
  await page.evaluate(() => { window.confirmResult = true })
  await page.getByRole('button', { name: '删除 review', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(0)
})

test('edits MCP JSON with credential retention and keeps configuration in its own page', async ({ page }, testInfo) => {
  await mount(page, 'mcp')
  await page.getByRole('button', { name: '添加 MCP 服务', exact: true }).click()
  await page.getByRole('textbox', { name: '名称', exact: true }).fill('docs')
  await page.getByRole('textbox', { name: '服务配置（JSON）', exact: true }).fill(JSON.stringify({ type: 'http', url: 'https://example.com/mcp', headers: { Authorization: 'secret' } }))
  await page.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(page.getByRole('article')).toContainText('docs')
  await mount(page, 'mcp')
  await page.getByRole('button', { name: '编辑 docs', exact: true }).click()
  const config = page.getByRole('textbox', { name: '服务配置（JSON）', exact: true })
  expect(await config.inputValue()).toContain('••••••••')
  expect(await config.inputValue()).not.toContain('secret')
  await config.fill('{invalid')
  await page.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  expect((await fixture.call('list-mcp', null)).servers).toHaveLength(1)
  await config.fill(JSON.stringify({ type: 'http', url: 'https://example.com/mcp', headers: { Authorization: '••••••••' } }))
  await page.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(page.locator('form')).toBeHidden()
  await page.evaluate(() => { document.documentElement.style.setProperty('--text-primary', '#eee'); document.documentElement.style.setProperty('--text-secondary', '#bbb'); document.documentElement.style.setProperty('--border-color', '#555'); document.documentElement.style.setProperty('--bg-secondary', '#30333b'); document.body.style.background = '#20232b' })
  await page.screenshot({ path: testInfo.outputPath('mcp-dark.png') })
  await mount(page, 'settings')
  await expect(page.getByRole('heading', { name: '配置编辑', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: '服务配置（JSON）', exact: true })).toHaveCount(0)
  await page.getByRole('textbox', { name: 'OMP 运行设置（JSON）', exact: true }).fill('{"theme":"dark"}')
  await page.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('配置已保存')
  expect((await fixture.call('list-mcp', null)).servers).toHaveLength(1)
  await mount(page, 'settings')
  await expect(page.getByRole('textbox', { name: 'OMP 运行设置（JSON）', exact: true })).toHaveValue('{\n  "theme": "dark"\n}')
})
