const text = {
  zh: {
    title: '配置编辑', skillsTitle: 'Skill 管理', mcpTitle: 'MCP 管理',
    skillsIntro: '管理本机 OMP 全局 Skill，修改同步到原生文件。启用的内容将在下一轮对话中加载。',
    mcpIntro: '管理本机 OMP 全局 MCP 服务，修改同步到原生文件。配置将在下一轮生效。',
    global: '本机全局', profile: '账号私有', globalHelp: '新建内容保存在本机 OMP 全局目录，与原生 OMP 共用。旧版账号私有内容保持独立。', total: '全部', active: '已启用', readOnly: '外部链接 · 只读', location: '配置位置', refresh: '刷新',
    addSkill: '添加 Skill', addMcp: '添加 MCP 服务', search: '搜索名称或描述', emptySkills: '还没有 Skill，点击“添加 Skill”开始。', emptyMcp: '还没有 MCP 服务，点击“添加 MCP 服务”开始。', noMatches: '没有匹配的项目',
    name: '名称', nameHelp: 'Skill 使用小写字母、数字和连字符；MCP 名称还可以使用下划线和点。', description: '描述', descriptionHelp: '说明这个 Skill 适合在什么情况下使用。', content: 'Skill 内容（Markdown）', contentHelp: '填写 SKILL.md 的正文；name 和 description 会自动写入文件头。',
    mcpConfig: '服务配置（JSON）', mcpHelp: '粘贴一个服务的原生配置对象。支持 command / args / env 或 type / url / headers。已有凭证会遮蔽，保留遮蔽值即可保留原值。',
    enabled: '已启用', disabled: '已停用', enable: '启用', disable: '停用', edit: '编辑', remove: '删除', removeConfirm: '删除此项？该操作将在下一轮生效。', cancel: '取消', discard: '放弃尚未保存的编辑？', editTitle: '编辑', newTitle: '新建', enabledLabel: '在下一轮运行中启用', savedResource: '已保存，将在下一轮生效', duplicate: '这个名称已经存在，请编辑现有项目', jsonObject: '请填写 JSON 对象', loadingResources: '正在读取…', intro: '全局模式使用本页的 OMP 模型与凭证；scoped 模式使用 Studio 选择的模型。配置按当前账号与 Profile 保存。',
    engine: '运行环境', status: '引擎状态', installed: '已安装', missing: '未安装', management: '打开 Agent 管理', install: '首次使用：在 Agent 管理中点击 OMP 的“安装”。已安装后可检查更新并升级。',
    executable: 'OMP 可执行文件（可选）', executableHelp: '留空使用 Studio 管理的 OMP；也可以填写已安装 OMP 的绝对路径。',
    native: '全局模型', model: '默认模型', modelHelp: '填写 provider/model；也可以留空，在聊天时选择 OMP 提供的原生模型。',
    models: '模型与凭证（JSON）', modelsHelp: '使用 OMP models.yml 的 providers 结构。已有密钥会遮蔽显示，保留遮蔽值即可保持原密钥。',
    example: '查看配置示例', config: 'OMP 运行设置（JSON）', configHelp: '使用 OMP config.yml 的设置结构。scoped 模式的模型绑定由 Studio 注入。',
    save: '保存配置', saved: '配置已保存', loading: '正在读取配置…', retry: '重新读取', docs: 'OMP 配置文档',
  },
  en: {
    title: 'Configuration', skillsTitle: 'Skills', mcpTitle: 'MCP servers',
    skillsIntro: 'Manage local OMP global skills. Edits are saved to native files and apply on the next conversation turn.',
    mcpIntro: 'Manage local OMP global MCP servers. Edits are saved to native files and apply on the next turn.',
    global: 'Local global', profile: 'Account private', globalHelp: 'New items use the local OMP global directory, shared with native OMP. Existing private items remain separate.', total: 'Total', active: 'Enabled', readOnly: 'External link · read-only', location: 'Configuration location', refresh: 'Refresh',
    addSkill: 'Add skill', addMcp: 'Add MCP server', search: 'Search name or description', emptySkills: 'No skills yet. Add a skill to get started.', emptyMcp: 'No MCP servers yet. Add a server to get started.', noMatches: 'No matching items',
    name: 'Name', nameHelp: 'Skills use lowercase letters, numbers and hyphens. MCP names also accept underscores and dots.', description: 'Description', descriptionHelp: 'Describe when OMP should use this skill.', content: 'Skill content (Markdown)', contentHelp: 'Enter the SKILL.md body. The name and description frontmatter is added automatically.',
    mcpConfig: 'Server configuration (JSON)', mcpHelp: 'Paste one native server object: command / args / env, or type / url / headers. Saved credentials are masked; leave masked values to retain them.',
    enabled: 'Enabled', disabled: 'Disabled', enable: 'Enable', disable: 'Disable', edit: 'Edit', remove: 'Delete', removeConfirm: 'Delete this item? The change applies on the next turn.', cancel: 'Cancel', discard: 'Discard unsaved edits?', editTitle: 'Edit', newTitle: 'New', enabledLabel: 'Enable on the next turn', savedResource: 'Saved. Changes apply on the next turn.', duplicate: 'This name already exists. Edit the existing item.', jsonObject: 'Enter a JSON object', loadingResources: 'Loading…', intro: 'Global mode uses OMP models and credentials from this page. Scoped mode uses the model selected in Studio. Settings belong to the current account and Profile.',
    engine: 'Runtime', status: 'Engine status', installed: 'Installed', missing: 'Not installed', management: 'Open Agent management', install: 'To get started, click Install for OMP in Agent management. Once installed, you can check for updates and upgrade.',
    executable: 'OMP executable (optional)', executableHelp: 'Leave empty for the Studio-managed engine, or enter an absolute path to an existing OMP executable.',
    native: 'Global models', model: 'Default model', modelHelp: 'Use provider/model, or leave empty and choose an OMP native model in chat.',
    models: 'Models and credentials (JSON)', modelsHelp: 'Use the OMP models.yml providers structure. Saved secrets are masked; leave the masked value to retain a secret.',
    example: 'Configuration example', config: 'OMP runtime settings (JSON)', configHelp: 'Use the OMP config.yml settings structure. Studio supplies the model binding in scoped mode.',
    save: 'Save settings', saved: 'Settings saved', loading: 'Loading settings…', retry: 'Reload', docs: 'OMP configuration docs',
  },
}
// The iframe owns its rendering. Use the host's public theme tokens and the same
// header/card/grid/form dimensions as the other Coding Agent settings pages.
const themeStyles = `
  :root{color-scheme:light dark}#root{padding:0}
  .omp-settings,.omp-manager{width:100%;min-width:0;color:var(--text-primary);font:14px/1.6 system-ui}
  .omp-settings button,.omp-manager button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:5px 12px;border:1px solid var(--border-color);border-radius:6px;background:transparent;line-height:1.4;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s}
  .omp-settings button:hover,.omp-manager button:hover{background:var(--bg-secondary)}
  .omp-settings button.primary,.omp-manager button.primary{background:var(--accent-primary);border-color:var(--accent-primary);color:var(--omp-on-accent)}
  .omp-settings button:disabled,.omp-manager button:disabled{opacity:.5;cursor:default}
  .omp-settings input,.omp-settings textarea,.omp-manager input:not([type=checkbox]),.omp-manager textarea{padding:7px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-secondary);color:var(--text-primary);font:inherit;min-width:0;max-width:100%}
  .omp-settings textarea,.omp-manager textarea{font-family:ui-monospace,SFMono-Regular,monospace;font-size:13px;line-height:1.6;resize:vertical}
  .omp-settings :focus-visible,.omp-manager :focus-visible{outline:2px solid var(--accent-primary);outline-offset:2px}
  .omp-page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid var(--border-color)}
  .omp-page-header h1{font-size:18px;font-weight:600;line-height:1.5;margin:0}
  .omp-page-header .omp-buttons{margin-inline-start:auto}
  .omp-page-content{padding:20px;display:flex;flex-direction:column;gap:16px;min-width:0}
  .omp-manager p,.omp-settings p{margin:0;color:var(--text-secondary);overflow-wrap:anywhere}
  .omp-source-path{display:block;font:12px/1.6 ui-monospace,monospace;color:var(--text-muted,var(--text-secondary));overflow-wrap:anywhere}
  .omp-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .omp-stat{padding:14px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-card);display:flex;flex-direction:column;gap:6px}
  .omp-stat span{font-size:11px;color:var(--text-muted,var(--text-secondary))}.omp-stat strong{font-size:24px;font-weight:600;line-height:1}
  .omp-toolbar,.omp-buttons{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .omp-manager .omp-toolbar input{flex:1;max-width:360px;min-width:0}
  .omp-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:14px}
  .omp-row{display:flex;flex-direction:column;gap:12px;padding:16px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-card);min-width:0}
  .omp-summary{flex:1;min-width:0;overflow-wrap:anywhere}.omp-summary strong{font-size:15px;font-weight:600}.omp-summary p{font-size:13px;margin-top:8px}
  .omp-row .omp-buttons{border-top:1px solid var(--border-color);padding-top:10px}
  .omp-badge{display:inline-flex;margin-inline-start:8px;padding:1px 7px;border:1px solid var(--border-color);border-radius:10px;font-size:11px;color:var(--text-secondary)}
  .omp-badge.active{color:var(--accent-primary);border-color:currentColor}
  .omp-empty{grid-column:1/-1;text-align:center;padding:48px 16px}
  .omp-dialog{width:min(600px,calc(100vw - 32px));max-height:calc(100vh - 32px);padding:0;border:1px solid var(--border-color);border-radius:12px;background:var(--bg-card);color:var(--text-primary)}
  .omp-dialog::backdrop{background:color-mix(in srgb,var(--text-primary) 30%,transparent)}
  .omp-editor{display:flex;flex-direction:column;gap:16px;padding:24px;min-width:0}.omp-editor[hidden]{display:none}
  .omp-editor h2{font-size:18px;margin:0;font-weight:600}.omp-editor fieldset{border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:16px;min-width:0}
  .omp-editor label{display:flex;flex-direction:column;gap:6px}.omp-editor label strong{font-size:14px;font-weight:500}.omp-editor label p{font-size:12px}
  .omp-editor textarea{min-height:220px;width:100%}.omp-editor .omp-check{flex-direction:row;align-items:center;gap:8px}
  .omp-editor>.omp-buttons{justify-content:flex-end;border-top:1px solid var(--border-color);padding-top:16px}
  .omp-message{white-space:pre-wrap;overflow-wrap:anywhere}.omp-message:empty{display:none}.omp-message[role=alert]{border-inline-start:3px solid var(--accent-primary);padding-inline-start:12px}
  @media(max-width:600px){.omp-page-header{padding:12px;gap:10px}.omp-page-content{padding:12px}.omp-page-header .omp-buttons{margin:0}.omp-items{grid-template-columns:1fr}.omp-dialog{width:calc(100vw - 24px)}.omp-editor{padding:16px}.omp-manager .omp-toolbar input{max-width:none;width:100%}}
`
export async function mount(root, ctx) {
  const t = text[(ctx.locale || navigator.language).startsWith('zh') ? 'zh' : 'en']
  const sharedStyle = document.createElement('style'); sharedStyle.textContent = themeStyles; root.append(sharedStyle)
  // The public bridge supplies the accent but no on-accent color. Choose its
  // accessible foreground here, including after the host changes theme.
  const updateContrast = () => {
    const paint = document.createElement('canvas').getContext('2d')
    paint.fillStyle = getComputedStyle(root).getPropertyValue('--accent-primary').trim() || 'CanvasText'
    paint.fillRect(0, 0, 1, 1)
    const rgb = [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4 })
    const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
    root.style.setProperty('--omp-on-accent', (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000' : '#fff')
  }
  updateContrast()
  const appearance = new MutationObserver(updateContrast); appearance.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })
  ctx.lifecycle.add(() => appearance.disconnect())
  let disposed = false
  ctx.lifecycle.add(() => { disposed = true })
  if (['skills', 'mcp'].includes(ctx.view)) return mountResources(root, ctx, t)
  const style = document.createElement('style')
  style.textContent = '.omp-settings h2{font-size:16px;margin:0 0 12px}.omp-section{border:1px solid var(--border-color);border-radius:8px;padding:20px;background:var(--bg-card)}.omp-field{display:flex;flex-direction:column;gap:6px;margin:16px 0}.omp-field input,.omp-field textarea{width:100%}.omp-field p{font-size:12px}.omp-field textarea{min-height:160px}.omp-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.omp-settings a{color:var(--accent-primary)}.omp-settings summary{cursor:pointer;color:var(--text-secondary)}.omp-settings pre{white-space:pre-wrap;overflow-wrap:anywhere}'
  const container = document.createElement('section'); container.className = 'omp-settings'
  const element = (tag, content) => { const value = document.createElement(tag); if (content) value.textContent = content; return value }
  const status = element('p', t.loading); status.setAttribute('role', 'status')
  const runtime = element('section'); runtime.className = 'omp-section'; runtime.append(element('h2', t.engine))
  const version = element('p'); runtime.append(version, element('p', t.install))
  const manage = element('button', t.management); manage.type = 'button'; manage.onclick = () => ctx.ui.navigate('/studio/agents'); runtime.append(manage)
  const field = (parent, label, help, area = false) => {
    const wrapper = element('label'); wrapper.className = 'omp-field'; wrapper.append(element('strong', label))
    const input = element(area ? 'textarea' : 'input'); input.setAttribute('aria-label', label); if (area) input.rows = 10
    input.spellcheck = false; wrapper.append(input, element('p', help)); parent.append(wrapper); return input
  }
  const executable = field(runtime, t.executable, t.executableHelp)
  const native = element('section'); native.className = 'omp-section'; native.append(element('h2', t.native))
  const model = field(native, t.model, t.modelHelp); model.placeholder = 'provider/model'
  const models = field(native, t.models, t.modelsHelp, true)
  const example = element('details'); example.append(element('summary', t.example), element('pre', JSON.stringify({ providers: { custom: { baseUrl: 'https://your-provider.example/v1', api: 'openai-completions', apiKey: 'YOUR_API_KEY', models: [{ id: 'your-model', name: 'Your model' }] } } }, null, 2)))
  const docs = element('a', t.docs); docs.href = 'https://github.com/can1357/oh-my-pi/blob/main/docs/models.md'; docs.target = '_blank'; docs.rel = 'noopener noreferrer'; example.append(docs); native.append(example)
  const advanced = element('section'); advanced.className = 'omp-section'; advanced.append(element('h2', t.config))
  const config = field(advanced, t.config, t.configHelp, true)
  const actions = element('div'); actions.className = 'omp-actions'
  const save = element('button', t.save); save.type = 'button'; save.disabled = true; save.className = 'primary'
  const retry = element('button', t.retry); retry.type = 'button'; actions.append(save, retry)
  const header = element('header'); header.className = 'omp-page-header'; header.append(element('h1', t.title), actions)
  const body = element('div'); body.className = 'omp-page-content'; body.append(element('p', t.intro), runtime, native, advanced, status)
  container.append(header, body); root.append(style, container)
  async function load() {
    const value = await ctx.rpc.call('get-settings')
    if (disposed) return
    executable.value = value.executable; model.value = value.defaultModel
    models.value = JSON.stringify(value.models, null, 2); config.value = JSON.stringify(value.config, null, 2)
    version.textContent = `${t.status}: ${value.status.installed ? `${t.installed} ${value.status.version}` : t.missing}`
    status.textContent = value.status.error || ''; save.disabled = false
  }
  retry.onclick = () => { load().catch(error => { status.textContent = error.message }) }
  save.onclick = async () => {
    save.disabled = true
    try {
      await ctx.rpc.call('save-settings', { executable: executable.value, defaultModel: model.value,
        models: JSON.parse(models.value), config: JSON.parse(config.value) })
      await load(); status.textContent = t.saved; ctx.ui.notify(t.saved, 'success')
    } catch (error) { if (!disposed) status.textContent = error.message }
    finally { if (!disposed) save.disabled = false }
  }
  try { await load() } catch (error) { status.textContent = error.message }
}


async function mountResources(root, ctx, t) {
  const skills = ctx.view === 'skills'
  let disposed = false, busy = false, loaded = false, items = [], editing = null, baseline = '', warnings = []
  ctx.lifecycle.add(() => { disposed = true })
  const el = (tag, value, className) => {
    const node = document.createElement(tag)
    if (value) node.textContent = value
    if (className) node.className = className
    return node
  }
  const button = (label, click) => {
    const node = el('button', label); node.type = 'button'; node.onclick = click; return node
  }
  const container = el('section', '', 'omp-manager')
  const toolbar = el('div', '', 'omp-toolbar'), search = el('input')
  search.type = 'search'; search.placeholder = t.search; search.setAttribute('aria-label', t.search)
  const add = button(skills ? t.addSkill : t.addMcp, () => showEditor()); add.className = 'primary'
  const retry = button(t.refresh, () => operation(load))
  toolbar.append(search)
  const header = el('header', '', 'omp-page-header'), headerActions = el('div', '', 'omp-buttons')
  headerActions.append(retry, add); header.append(el('h1', skills ? t.skillsTitle : t.mcpTitle), headerActions)
  const body = el('div', '', 'omp-page-content')
  const sourcePath = el('code', '', 'omp-source-path'); sourcePath.setAttribute('aria-label', t.location)
  const stats = el('div', '', 'omp-stats')
  const total = el('strong', '0'), active = el('strong', '0')
  for (const [label, count] of [[t.total, total], [t.active, active]]) {
    const card = el('div', '', 'omp-stat'); card.append(el('span', label), count); stats.append(card)
  }
  const message = el('p', t.loadingResources, 'omp-message'); message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite')
  const list = el('div', '', 'omp-items')
  const editor = el('form', '', 'omp-editor'); editor.hidden = true
  const dialog = el('dialog', '', 'omp-dialog'); dialog.setAttribute('aria-label', skills ? t.skillsTitle : t.mcpTitle)
  dialog.append(editor)
  ctx.lifecycle.add(() => dialog.close())
  const heading = el('h2'), fields = el('fieldset')
  const field = (label, help, area = false) => {
    const wrapper = el('label'), input = el(area ? 'textarea' : 'input')
    input.required = true; input.spellcheck = false; input.setAttribute('aria-label', label)
    wrapper.append(el('strong', label), input, el('p', help)); fields.append(wrapper); return input
  }
  const name = field(t.name, t.nameHelp); name.maxLength = 64
  const description = skills ? field(t.description, t.descriptionHelp) : null
  if (description) description.maxLength = 2000
  const content = field(skills ? t.content : t.mcpConfig, skills ? t.contentHelp : t.mcpHelp, true)
  if (skills) content.maxLength = 200000
  const check = el('label', '', 'omp-check'), enabled = el('input'); enabled.type = 'checkbox'; enabled.setAttribute('aria-label', t.enabledLabel)
  check.append(enabled, el('span', t.enabledLabel)); fields.append(check)
  const actions = el('div', '', 'omp-buttons'), save = el('button', t.save); save.type = 'submit'
  const values = () => JSON.stringify([name.value, description?.value, content.value, enabled.checked])
  const closeEditor = () => { editor.hidden = true; dialog.close(); editing = null; add.focus() }
  const cancelEdit = async () => {
    try {
      if (baseline !== values() && !await ctx.ui.confirm(t.discard)) return
      if (!disposed) closeEditor()
    } catch (error) { if (!disposed) setMessage(error.message, true) }
  }
  const cancel = button(t.cancel, cancelEdit)
  save.className = 'primary'
  dialog.oncancel = event => { event.preventDefault(); if (!busy) void cancelEdit() }
  const editorMessage = el('p', '', 'omp-message'); editorMessage.setAttribute('role', 'status')
  actions.append(cancel, save); editor.append(heading, fields, editorMessage, actions)
  const notice = el('p', '', 'omp-message'); notice.setAttribute('role', 'alert')
  body.append(el('p', skills ? t.skillsIntro : t.mcpIntro), sourcePath, el('p', t.globalHelp), stats, toolbar, message, notice, list)
  container.append(header, body, dialog)
  root.append(container)
  const setMessage = (value, error = false) => {
    const target = dialog.open ? editorMessage : message
    target.textContent = value; target.setAttribute('role', error ? 'alert' : 'status')
  }
  function setBusy(value) {
    busy = value; fields.disabled = value; save.disabled = value; cancel.disabled = value
    search.disabled = value || !loaded; add.disabled = value || !loaded; retry.disabled = value
    for (const node of list.querySelectorAll('button')) node.disabled = value || node.dataset.readOnly === 'true'
  }
  async function load() {
    const result = await ctx.rpc.call(skills ? 'list-skills' : 'list-mcp')
    if (disposed) return
    items = skills ? result.skills : result.servers
    warnings = result.warnings || []; notice.textContent = warnings.join('\n')
    sourcePath.textContent = result.directory ? `${result.directory}/${skills ? 'skills/' : 'mcp.json'}` : ''
    total.textContent = String(items.length); active.textContent = String(items.filter(item => item.enabled).length)
    loaded = true; renderList()
  }
  async function operation(action, success = '') {
    if (busy) return
    setBusy(true); setMessage('')
    try {
      await action()
      if (disposed) return
      setMessage(success)
      if (success) ctx.ui.notify(success, 'success')
    } catch (error) { if (!disposed) setMessage(error.message, true) }
    finally { if (!disposed) setBusy(false) }
  }
  async function showEditor(item = null) {
    if (busy || disposed) return
    try {
      if (!editor.hidden && baseline !== values() && !await ctx.ui.confirm(t.discard)) return
    } catch (error) { if (!disposed) setMessage(error.message, true); return }
    if (disposed) return
    editing = item
    editorMessage.textContent = ''
    heading.textContent = `${item ? t.editTitle : t.newTitle} ${skills ? 'Skill' : 'MCP'} · ${item?.source === 'profile' ? t.profile : t.global}`
    name.value = item?.name || ''; name.disabled = Boolean(item)
    if (description) description.value = item?.description || ''
    content.value = skills ? item?.content || '' : JSON.stringify(item?.config || { type: 'stdio', command: 'npx', args: [] }, null, 2)
    enabled.checked = item?.enabled ?? true
    baseline = values(); editor.hidden = false
    if (!dialog.open) dialog.showModal()
    ;(item ? content : name).focus()
  }
  function renderList() {
    list.replaceChildren()
    const filtered = items.filter(item => `${item.name} ${item.description || ''}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()))
    if (!filtered.length) { list.append(el('p', items.length ? t.noMatches : skills ? t.emptySkills : t.emptyMcp, 'omp-empty')); return }
    for (const item of filtered.slice().sort((a, b) => a.name.localeCompare(b.name))) {
      const row = el('article', '', 'omp-row'), summary = el('div', '', 'omp-summary'), title = el('strong', item.name)
      summary.append(title, el('span', item.enabled ? t.enabled : t.disabled, `omp-badge${item.enabled ? ' active' : ''}`), el('span', item.source === 'profile' ? t.profile : t.global, 'omp-badge'), el('p', skills ? item.description : item.config.command || item.config.url || 'MCP'))
      if (item.path) summary.append(el('code', item.path, 'omp-source-path'))
      if (item.readOnly) summary.append(el('p', t.readOnly))
      const actions = el('div', '', 'omp-buttons')
      const edit = button(t.edit, () => showEditor(item)); edit.setAttribute('aria-label', `${t.edit} ${item.name}`)
      const toggle = button(item.enabled ? t.disable : t.enable, () => operation(async () => {
        await ctx.rpc.call(skills ? 'save-skill' : 'save-mcp', { ...item, enabled: !item.enabled }); await load()
        if (editing?.name === item.name && editing?.source === item.source) closeEditor()
      }, t.savedResource)); toggle.setAttribute('aria-label', `${item.enabled ? t.disable : t.enable} ${item.name}`)
      const remove = button(t.remove, () => operation(async () => {
        if (!await ctx.ui.confirm(`${t.removeConfirm} (${item.name})`) || disposed) return
        await ctx.rpc.call(skills ? 'remove-skill' : 'remove-mcp', { name: item.name, source: item.source || 'global', ...(item.id ? { id: item.id } : {}) }); await load()
        if (!disposed && editing?.name === item.name && editing?.source === item.source) closeEditor()
      })); remove.setAttribute('aria-label', `${t.remove} ${item.name}`)
      actions.append(toggle, edit, remove); row.append(summary, actions); list.append(row)
      if (item.readOnly) for (const node of actions.children) { node.disabled = true; node.dataset.readOnly = 'true' }
    }
  }
  search.oninput = renderList
  editor.onsubmit = event => {
    event.preventDefault()
    void operation(async () => {
      const input = { name: name.value.trim(), enabled: enabled.checked, source: editing?.source || 'global', ...(editing?.id ? { id: editing.id } : {}) }
      if (skills) Object.assign(input, { description: description.value, content: content.value })
      else {
        const config = JSON.parse(content.value)
        if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error(t.jsonObject)
        input.config = config
      }
      if (!editing && items.some(item => item.name === input.name && item.source !== 'profile')) throw new Error(t.duplicate)
      await ctx.rpc.call(skills ? 'save-skill' : 'save-mcp', input)
      if (!disposed) { closeEditor(); await load() }
    }, t.savedResource)
  }
  await operation(load)
}
