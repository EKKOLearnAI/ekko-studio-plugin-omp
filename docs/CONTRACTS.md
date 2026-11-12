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

设置保存在 `ctx.storage.namespace('accounts', sha256(JSON.stringify([userId, profile])))`
下的 `settings`。真实身份来自 RPC `run.identity`。同一插件的不同账号/Profile 不共享配置。
响应中以 apiKey/token/secret/password/authorization/cookie 结尾的字段遮蔽为 `••••••••`。
再次保存遮蔽值时恢复原密钥；数组内模型按 id 匹配。禁止原型污染字段。
开放原生对象的语义由 OMP 校验，本地 harness 只验证其为 JSON 对象。

## Agent 运行与回传

注册本地 Agent `omp`，宿主映射为 `plugin:omp/omp`。支持 chat/group-chat/workflow/api，
global 原生模型及 scoped 的 chat_completions/codex_responses/anthropic_messages。
global 模型目录通过临时 RPC 进程的 `get_available_models` 获取。
引擎未安装返回 `not_installed`；无可用模型返回 `auth_required`；可用时返回 `ready`。
管理接口返回状态、设置路由 `{ viewId: 'settings' }`、版本检查及 `{ installedVersion }`。
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
- `turns/<runId>/`：models.yml、config.yml、mcp.json、instructions.md，仅本轮存在。
- `sessions/`：OMP 自己维护的原生会话记录，不解析或自行迁移其内部格式。

0.1.6 改用官方 Release 跳转查询版本，避免匿名 API 配额耗尽导致安装或更新失败；不改变数据格式。

0.1.5 增加受管引擎删除和自动更新能力，升级不会自动开启更新；已有设置和恢复格式不变。
删除受管引擎只清理其二进制及指针，账号设置和会话保留。

0.1.4 只迁移源码归属和更换官网标识；ID、命名空间、版本 1 checkpoint 及已有设置保持兼容。
以后修改上述结构时必须同时更新契约、本文、相关指南及实际边界测试；改变持久化语义需解释
旧数据读取、默认值和迁移行为。harness 不能替代对文档语义和上游协议的人工审查。
