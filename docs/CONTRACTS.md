# OMP 插件契约

宿主接口为 plugin API v1 和 Agent API v1。OMP stdio `rpc-ui` 适配最初以引擎
18.19.0 验证。入口为 `server.mjs` 的 `apply(ctx)`，前端入口为 `client.mjs`。
退出时释放 Agent 注册；每轮在 finally 关闭 RPC 子进程并删除临时配置。

## 设置 RPC 与存储

`get-settings(null)` 返回 `executable`、`defaultModel`、`models`、`config` 和 `status`。
前四项默认分别是空字符串、空字符串、`{ providers: {} }`、`{}`。
`status` 含 `installed/version/source`，可带 `path/error`；未安装不等于插件未启用。
`save-settings` 接收前四项，成功持久化后返回 `{ ok: true }`，失败抛错。
它允许读回结果附带的 `status`，但不持久化状态；其他多余顶层输入也不会持久化。

- `executable`：空表示 Studio 私有目录中的受管引擎；非空必须是绝对路径，最多 2048 字符。
- `defaultModel`：空表示由 OMP 选择，否则为 `provider/model`，最多 500 字符。
- `models`：OMP 原生 models.yml 的 JSON 等价对象，必须含对象 `providers`。
  provider 名称和其字段由 OMP 定义，常见为 `api/baseUrl/apiKey/models`。
- `config`：OMP 原生 config.yml 的 JSON 等价对象，字段由引擎版本定义。
- 整个保存请求 JSON 不超过 500000 字节。字段规则、默认值及嵌套开放对象见 `contracts/plugin.json`。

设置保存在 `ctx.state.plugin.namespace('accounts', sha256(JSON.stringify([userId, profile])))`
下的 `settings`。真实身份来自 RPC `run.identity`。同一插件的不同账号/Profile 不共享配置。
响应中以 apiKey/token/secret/password/authorization/cookie 结尾的字段遮蔽为 `••••••••`。
再次保存遮蔽值时恢复原密钥；数组内模型按 id 匹配。禁止原型污染字段。
开放原生对象的语义由 OMP 校验，本地 harness 只验证其为 JSON 对象。

## Skill、MCP 管理与入口

清单声明 skills、mcp、settings 三个 agent-settings 页面，分别使用 skills、mcp、settings 命名 icon。
Agent 管理中的设置按钮打开 skills，同类页面由宿主显示专属侧栏，返回 Agent 管理。
`navigation: {}` 表示不注册主侧栏或设置侧栏入口。需要支持独立 navigation 和 agent-settings 页面的 Studio；无需在宿主添加 OMP 专用代码。

- `list-skills(null)` 返回 `{ skills }`；`save-skill({name,description,content,enabled})` 创建或更新同名 Skill，`remove-skill({name})` 删除。
  name 使用小写字母、数字和单个连字符，最多 64 字符；description 非空且最多 2000 字符；content 是非空 Markdown 正文，最多 200000 字符。
  UI 编辑已有名称时保持名称不变；SKILL.md 的 name/description frontmatter 由运行时生成，用户填写正文。
- `list-mcp(null)` 返回 `{ servers }`；`save-mcp({name,enabled,config})` 保存一个 OMP 原生 MCP 定义，`remove-mcp({name})` 删除。
  name 最多 64 字符，允许字母、数字、下划线、点、连字符。stdio 要求 command，args 为字符串数组；http/sse 要求 HTTP(S) url。
  禁止同时填写 command 与 url；env/headers 必须为字符串映射。enabled 由外层字段控制，config 内禁止 enabled。其他原生字段保留并由 OMP 校验。
  所有 env/headers 非空值及常规凭证字段遮蔽；保存遮蔽值时按服务名、字段名保留旧值，没有原值则报错。普通账号的列表不包含 Studio 本轮注入的服务。
- 写操作成功后返回 `{ok:true}`。每类最多 200 项，整类序列化不超过 2000000 字节；名称禁止原型污染字段。
  每个账号/Profile 的同类写操作串行，避免同时保存造成丢失。真实身份始终来自 run.identity。

skills 与 mcp 分别保存在同一个账号 namespace 的独立键中，版本均为 1；旧安装缺少键时读取为空列表，不迁移或重写已有 settings/checkpoint。
每轮只将启用 Skill 写入临时 `skills/<name>/SKILL.md`，通过 `skills.customDirectories` 加载；运行时不再传 --no-skills，模型目录探测仍禁用 Skill。
常规外部用户/项目 Skill 来源关闭；高级 config.skills.customDirectories 仍可追加目录，其余 OMP 过滤规则保留。管理页为准的 enabled 与隔离目录由插件注入。
每轮将启用的 MCP 服务与 run.mcpServers 合并，同名服务整个使用 Studio 本轮注入值，不合并或持久化短期凭证。
两类变更都从下一轮（包括已恢复的会话）生效，在途轮次使用启动时快照；finally 删除临时 Skill 和 MCP 文件。

## Agent 运行与回传

注册本地 Agent `omp`，宿主映射为 `plugin:omp/omp`。支持 chat/group-chat/workflow/api，
global 原生模型及 scoped 的 chat_completions/codex_responses/anthropic_messages。
global 模型目录通过临时 RPC 进程的 `get_available_models` 获取。
引擎未安装返回 `not_installed`；无可用模型返回 `auth_required`；可用时返回 `ready`。
管理接口返回状态、设置路由 `{ viewId: 'skills' }`、版本检查及 `{ installedVersion }`。
`management.remove(ctx)` 仅移除私有目录内的 `engine.json` 与 `engines/`，保留设置、模型缓存和会话。
`management.supportsAutoUpdate(ctx)` 返回 boolean；受支持平台的受管引擎返回 true，
配置自定义可执行文件时返回 false，删除也会拒绝该外部文件。宿主负责持久化开关、闲置等待与运行互斥，
以激活身份执行全局自动更新；手动管理操作仍使用真实调用身份。

版本查询对官方 `releases/latest` 发出 HEAD 请求，仅接受同一仓库的精确版本跳转，
不调用限额较低的匿名 REST API，也不读取 GitHub token。成功结果在内存缓存五分钟；
失败不缓存为版本、不回退为已安装版本，并支持取消和二十秒请求超时。
上游异常以 `OMP_RELEASE_LOOKUP` / HTTP 503 返回，重试成功后继续正常安装；
下载仍使用精确版本地址，验证平台资产的 SHA-256 及二进制版本后才切换引擎。

`createSession` 消费宿主 runtimeDir 和可选 checkpoint。`run` 消费输入、历史、指令、
真实身份、workspaceDir、模型、受管 MCP、附件、取消信号、资源清理和交互通道。
scoped 凭证仅写入本轮私有目录，结束或失败删除；异常中遮蔽注入的 token。
运行不读取 Studio 数据库、宿主环境中的 API key 或用户全局 OMP 配置。

回传 `text.delta`、`reasoning.summary.delta`、`tool.started/completed/failed`、`status`。
超过 100000 字符的工具结果以 `{ truncated: true, text }` 返回。
最终结果为 `content: [{ type: 'text', text }]`、`finishReason: stop|length`、`checkpoint`，
有用量时附加 `inputTokens/outputTokens/cacheReadTokens/costUsd/isEstimated`。
用量仅聚合本轮 assistant message_end；没有用量时不虚构数值。
confirm 经 approve；select/input/editor 经 clarify；取消不会当成同意。
secret 输入和不支持的 form 自动取消，普通状态经 status 事件反馈。

## 磁盘格式与兼容

- `engine.json`：`{ version, asset }` 指向 `engines/<version>/<asset>`，下载校验及版本验证后原子替换。
- `native-session.json`：`{ sessionFile: string }`，路径相对该会话 runtimeDir。
- checkpoint：`{ schemaVersion: 1, data: { sessionFile: string | null } }`。
  null 表示新会话；绝对路径或越界路径拒绝，文件不存在则开启新会话。
- `turns/<runId>/`：models.yml、config.yml、mcp.json、instructions.md 和启用的 skills/，仅本轮存在。
- `sessions/`：OMP 自己维护的原生会话记录，不解析或自行迁移其内部格式。

## 当前首版契约

插件模块首次上线以 plugin API v1 和 Agent API v1 为协议基线；包版本 version 单独表示插件发布版本。
清单使用 permissions，Agent 功能声明使用 features。注册使用 extensions，前端使用 rpc.call，
存储使用 state.plugin，清理使用 lifecycle，Agent 输出使用 output。只维护这份最新契约。
SDK 与模板包含 host.browser.cdp 的权限和调用契约；OMP 自身没有声明或自动使用 browser.cdp。
