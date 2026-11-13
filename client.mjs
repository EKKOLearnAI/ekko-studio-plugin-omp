const text = {
  zh: {
    title: '配置编辑', skillsTitle: 'Skill 管理', mcpTitle: 'MCP 管理',
    skillsIntro: '创建、编辑并启用 OMP 使用的 Markdown Skill。启用的内容将在下一轮对话中加载。',
    mcpIntro: '管理 OMP 的 stdio、HTTP 和 SSE 服务。配置将在下一轮生效；与 Studio 本轮受管服务重名时，使用 Studio 提供的服务。',
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
    skillsIntro: 'Create, edit and enable Markdown skills for OMP. Enabled skills load on the next conversation turn.',
    mcpIntro: 'Manage stdio, HTTP and SSE servers for OMP. Changes apply on the next turn. Studio-managed servers take precedence when names match.',
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
export async function mount(root, ctx) {
  const t = text[(ctx.locale || navigator.language).startsWith('zh') ? 'zh' : 'en']
  let disposed = false
  ctx.onDispose(() => { disposed = true })
  if (['skills', 'mcp'].includes(ctx.view)) return mountResources(root, ctx, t)
  const style = document.createElement('style')
  style.textContent = '.omp-settings{max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:24px}.omp-settings h1{font-size:22px;margin:0}.omp-settings h2{font-size:16px;margin:0 0 12px}.omp-settings p{color:var(--text-secondary);line-height:1.6;margin:8px 0}.omp-section{border-bottom:1px solid var(--border-color);padding-bottom:20px}.omp-field{display:flex;flex-direction:column;gap:8px;margin:16px 0}.omp-field input,.omp-field textarea{width:100%}.omp-field textarea{font-family:ui-monospace,monospace;resize:vertical;min-height:160px;line-height:1.5}.omp-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.omp-settings a{color:var(--accent-primary)}.omp-error{color:var(--text-primary);white-space:pre-wrap}.omp-settings summary{cursor:pointer;color:var(--text-secondary)}.omp-settings pre{white-space:pre-wrap;overflow-wrap:anywhere}'
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
  const advanced = element('section'); advanced.append(element('h2', t.config))
  const config = field(advanced, t.config, t.configHelp, true)
  const actions = element('div'); actions.className = 'omp-actions'
  const save = element('button', t.save); save.type = 'button'; save.disabled = true
  const retry = element('button', t.retry); retry.type = 'button'; actions.append(save, retry)
  container.append(element('h1', t.title), element('p', t.intro), runtime, native, advanced, actions, status); root.append(style, container)
  async function load() {
    const value = await ctx.rpc('get-settings')
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
      await ctx.rpc('save-settings', { executable: executable.value, defaultModel: model.value,
        models: JSON.parse(models.value), config: JSON.parse(config.value) })
      await load(); status.textContent = t.saved; ctx.ui.notify(t.saved, 'success')
    } catch (error) { if (!disposed) status.textContent = error.message }
    finally { if (!disposed) save.disabled = false }
  }
  try { await load() } catch (error) { status.textContent = error.message }
}


async function mountResources(root, ctx, t) {
  const skills = ctx.view === 'skills'
  let disposed = false, busy = false, loaded = false, items = [], editing = null, baseline = ''
  ctx.onDispose(() => { disposed = true })
  const el = (tag, value, className) => {
    const node = document.createElement(tag)
    if (value) node.textContent = value
    if (className) node.className = className
    return node
  }
  const button = (label, click) => {
    const node = el('button', label); node.type = 'button'; node.onclick = click; return node
  }
  const style = el('style')
  style.textContent = `
    .omp-manager{max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:18px;min-width:0}
    .omp-manager h1{font-size:22px;margin:0}.omp-manager h2{font-size:16px;margin:0}
    .omp-manager p{margin:0;color:var(--text-secondary);line-height:1.6;overflow-wrap:anywhere}
    .omp-toolbar,.omp-row,.omp-buttons{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .omp-toolbar input{flex:1;min-width:140px}.omp-items{display:flex;flex-direction:column;gap:12px}
    .omp-row{padding:16px;border:1px solid var(--border-color);border-radius:8px}
    .omp-summary{flex:1;min-width:160px;overflow-wrap:anywhere}.omp-summary strong{font-size:15px}
    .omp-badge{font-size:12px;color:var(--text-secondary);margin-inline-start:10px}
    .omp-editor{display:flex;flex-direction:column;gap:16px;border:1px solid var(--border-color);border-radius:8px;padding:18px;min-width:0}
    .omp-editor[hidden]{display:none}.omp-editor fieldset{display:flex;flex-direction:column;gap:16px;border:0;margin:0;padding:0;min-width:0}
    .omp-editor label{display:flex;flex-direction:column;gap:8px}.omp-editor .omp-check{flex-direction:row;align-items:center}
    .omp-editor input:not([type=checkbox]),.omp-editor textarea{width:100%;min-width:0}
    .omp-editor textarea{font-family:ui-monospace,monospace;line-height:1.6;resize:vertical;min-height:220px}
    .omp-manager button:disabled{cursor:default;opacity:.55}.omp-empty{padding:32px 12px;text-align:center}
    .omp-message{white-space:pre-wrap;overflow-wrap:anywhere}.omp-manager [role=alert]{color:var(--text-primary)}
    @media(max-width:600px){.omp-row{align-items:flex-start}.omp-summary{flex-basis:100%}.omp-buttons{width:100%}.omp-editor{padding:12px}}
  `
  const container = el('section', '', 'omp-manager')
  const toolbar = el('div', '', 'omp-toolbar'), search = el('input')
  search.type = 'search'; search.placeholder = t.search; search.setAttribute('aria-label', t.search)
  const add = button(skills ? t.addSkill : t.addMcp, () => showEditor())
  const retry = button(t.retry, () => operation(load))
  toolbar.append(search, add, retry)
  const message = el('p', t.loadingResources, 'omp-message'); message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite')
  const list = el('div', '', 'omp-items')
  const editor = el('form', '', 'omp-editor'); editor.hidden = true
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
  const cancel = button(t.cancel, async () => {
    try {
      if (baseline !== values() && !await ctx.ui.confirm(t.discard)) return
      if (!disposed) { editor.hidden = true; add.focus() }
    } catch (error) { if (!disposed) setMessage(error.message, true) }
  })
  actions.append(save, cancel); editor.append(heading, fields, actions)
  container.append(el('h1', skills ? t.skillsTitle : t.mcpTitle), el('p', skills ? t.skillsIntro : t.mcpIntro), toolbar, message, editor, list)
  root.append(style, container)
  const setMessage = (value, error = false) => { message.textContent = value; message.setAttribute('role', error ? 'alert' : 'status') }
  function setBusy(value) {
    busy = value; fields.disabled = value; save.disabled = value; cancel.disabled = value
    search.disabled = value || !loaded; add.disabled = value || !loaded; retry.disabled = value
    for (const node of list.querySelectorAll('button')) node.disabled = value
  }
  async function load() {
    const result = await ctx.rpc(skills ? 'list-skills' : 'list-mcp')
    if (disposed) return
    items = skills ? result.skills : result.servers
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
    heading.textContent = `${item ? t.editTitle : t.newTitle} ${skills ? 'Skill' : 'MCP'}`
    name.value = item?.name || ''; name.disabled = Boolean(item)
    if (description) description.value = item?.description || ''
    content.value = skills ? item?.content || '' : JSON.stringify(item?.config || { type: 'stdio', command: 'npx', args: [] }, null, 2)
    enabled.checked = item?.enabled ?? true
    baseline = values(); editor.hidden = false
    ;(item ? content : name).focus()
  }
  function renderList() {
    list.replaceChildren()
    const filtered = items.filter(item => `${item.name} ${item.description || ''}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()))
    if (!filtered.length) { list.append(el('p', items.length ? t.noMatches : skills ? t.emptySkills : t.emptyMcp, 'omp-empty')); return }
    for (const item of filtered.slice().sort((a, b) => a.name.localeCompare(b.name))) {
      const row = el('article', '', 'omp-row'), summary = el('div', '', 'omp-summary'), title = el('strong', item.name)
      summary.append(title, el('span', item.enabled ? t.enabled : t.disabled, 'omp-badge'), el('p', skills ? item.description : item.config.type || (item.config.url ? 'http' : 'stdio')))
      const actions = el('div', '', 'omp-buttons')
      const edit = button(t.edit, () => showEditor(item)); edit.setAttribute('aria-label', `${t.edit} ${item.name}`)
      const toggle = button(item.enabled ? t.disable : t.enable, () => operation(async () => {
        await ctx.rpc(skills ? 'save-skill' : 'save-mcp', { ...item, enabled: !item.enabled }); await load()
        if (editing?.name === item.name) { editor.hidden = true; editing = null }
      }, t.savedResource)); toggle.setAttribute('aria-label', `${item.enabled ? t.disable : t.enable} ${item.name}`)
      const remove = button(t.remove, () => operation(async () => {
        if (!await ctx.ui.confirm(`${t.removeConfirm} (${item.name})`) || disposed) return
        await ctx.rpc(skills ? 'remove-skill' : 'remove-mcp', { name: item.name }); await load()
        if (!disposed && editing?.name === item.name) { editor.hidden = true; editing = null }
      })); remove.setAttribute('aria-label', `${t.remove} ${item.name}`)
      actions.append(toggle, edit, remove); row.append(summary, actions); list.append(row)
    }
  }
  search.oninput = renderList
  editor.onsubmit = event => {
    event.preventDefault()
    void operation(async () => {
      const input = { name: name.value.trim(), enabled: enabled.checked }
      if (skills) Object.assign(input, { description: description.value, content: content.value })
      else {
        const config = JSON.parse(content.value)
        if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error(t.jsonObject)
        input.config = config
      }
      if (!editing && items.some(item => item.name === input.name)) throw new Error(t.duplicate)
      await ctx.rpc(skills ? 'save-skill' : 'save-mcp', input)
      if (!disposed) { editor.hidden = true; editing = null; await load() }
    }, t.savedResource)
  }
  await operation(load)
}
