# OMP for Ekko Studio

独立维护的 [OMP / Oh My Pi](https://omp.sh/) Agent 插件，提供原生模型配置、
Studio scoped 模型、流式输出、工具事件、附件、会话续接和引擎安装升级。
插件 ID 保持 `omp`，Agent ID 保持 `plugin:omp/omp`。从 Studio 内置版本升级不会改变数据命名空间。

## 开发和调试

需要 Node.js 24+ 和支持插件独立 navigation、agent-settings 页面及 Agent API v1 的 Ekko Studio。仓库可以放在任意目录：

```bash
git clone https://github.com/EKKOLearnAI/ekko-studio-plugin-omp.git
cd ekko-studio-plugin-omp
npm ci --ignore-scripts
npm run harness:check
npm test
ekko-studio plugins link "$PWD"
npm run dev
```

`npm run dev` 登记项目并提示打开 Studio → 插件中心 → 启用。
CLI 和运行中的 Studio 必须使用同一个 `HERMES_WEB_UI_HOME`。此项目直接运行 `.mjs`，无需编译。
宿主先运行 harness，再复制开发快照、监听改动并重载。失败时保留上一可用版本。
启用开发链接会替换当前安装的同 ID 插件，保留其数据；需要完全隔离时使用单独的 Studio 数据目录。
禁用保留最后快照；回到随 Studio 分发的版本可安装 `builtin:omp`。

在 Agent 管理里安装 OMP 引擎，点击“设置”打开三个独立页面：

- Skill 管理：创建、编辑、启用/停用、删除 Markdown Skill。
- MCP 管理：新增、编辑、启用/停用、删除 stdio/HTTP/SSE 服务，保存时保留已遮蔽凭证。
- 配置编辑：引擎路径、原生模型与凭证、OMP config.yml 的 JSON 等价配置。

页面及功能全部由本插件实现，不注册主侧栏或设置侧栏入口；专属配置侧栏使用宿主命名 icon。
Skill/MCP 页面直接发现本机 OMP 原生全局文件，并显示实际来源路径。默认目录为
`~/.omp/agent`，遵循 `PI_CODING_AGENT_DIR`；使用 `OMP_PROFILE` / `PI_PROFILE` 时读取
对应的 `~/.omp/profiles/<name>/agent`（`PI_CONFIG_DIR` 可改变 `.omp` 根目录名）。
原生配置属于运行 Studio 的系统用户，由所有 Studio 账号共用，Studio 的 Profile 不改变这个目录。

- Skill：读取 `skills/*/SKILL.md`，支持 YAML frontmatter。编辑保留其他 metadata、scripts 和 references。
  停用写入原生 `config.yml`（或已有的 `config.yaml`）的 `skills.ignoredSkills`。
  链接到其他目录的 Skill 显示为只读，仍可运行。
- MCP：读取 `mcp.json`，兼容 `.mcp.json`；同名定义以前者为准。编辑保留其他服务及顶层原生字段，
  遵循 `disabledServers` / `enabledServers`。凭证遮蔽后再次保存保留原值。

新建默认写入原生全局文件。0.2.x 的账号/Profile 私有 Skill/MCP 保持原位置、私密性及开关，
在列表中标明“账号私有”，不会自动迁入共享目录；编辑和删除按选中来源操作。
运行时同名资源以当前账号私有条目为准；同名 MCP 最终以 Studio 本轮受管配置为准。
所有修改在下一轮生效，Skill 的脚本和参考文件随启用内容一起准备到本轮目录。
页面采用 Coding Agent 设置页的页头、工具栏、统计卡片、资源卡片及编辑弹窗，跟随宿主主题。
可在配置编辑页填写已有可执行文件的绝对路径。
global 模式使用本插件设置的原生模型；scoped 模式使用 Studio 本轮注入的模型。
引擎从官方 GitHub Release 下载并验证校验和，独立于插件版本，不随源码仓库打包。
最新版本通过官方 Release 跳转查询，不依赖 GitHub 匿名 REST API 配额或访问令牌。
Agent 管理支持删除受管引擎和开启自动更新；删除保留设置和会话。自定义可执行文件由外部管理，不支持删除或自动更新。

## 开发文档和 harness

- [架构](docs/ARCHITECTURE.md)、[Studio ctx](docs/STUDIO_CTX.md)、[回传结构](docs/STUDIO_RETURNS.md)
- [开发规范](docs/DEVELOPMENT.md)、[OMP 数据和运行契约](docs/CONTRACTS.md)
- [宿主类型](sdk/src/index.ts)、[Agent 类型](sdk/src/agents.ts)

指南和 SDK 随项目保存，管理接口使用 Agent API v1，并包含独立导航与 Agent 设置页面契约。
升级 SDK 时一起更新指南。修改公开字段或持久化结构时，在同一次提交直接编辑
`contracts/plugin.json` 和相关 Markdown，并修改边界测试；没有文档生成命令。

`npm run harness:check` 检查契约描述、模型引用、版本和必备文档；`npm test` 检查实际
RPC/存储形状、原生文件发现和读写、旧账号隔离、密钥遮蔽、引擎下载完整性以及模拟引擎的运行、续接和取消。
Studio 的宿主集成与浏览器测试保留在 Studio 仓库。模拟引擎测试不需要网络或模型凭证。浏览器测试也只使用本地临时数据和模拟 RPC：

```bash
npm ci --ignore-scripts --include=dev
npx playwright install chromium
npm run test:e2e
```

本机已安装 Chrome 时也可运行 `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`。
浏览器截图保存在操作系统临时目录，不进入源码包。
可选的真实引擎安装测试使用 `STUDIO_TEST_OMP_BINARY=/absolute/path/to/omp npm test`。

## 安装与分发

在插件中心安装本目录的绝对路径，或 `github:EKKOLearnAI/ekko-studio-plugin-omp#完整40位提交`。
远程安装禁止生命周期脚本，所有入口已经是可直接运行的 JavaScript。
`npm pack --pack-destination /absolute/output/directory` 会先运行检查和测试。

Studio 将此仓库固定提交的包作为构建依赖，并随自身版本打包；更新内置版本时同步更新
Studio 的依赖和锁文件。不要在 Studio 中另维护一份 OMP 源码。
插件中心的“提交插件”可提交本仓库供审核；提交审核不等于上架。

适配器及随附 Studio SDK 使用 [BSL-1.1](LICENSE)。OMP 引擎另附其上游许可证。
图标来自官网原始 SVG，来源及第三方声明见 [OMP-NOTICE.txt](OMP-NOTICE.txt)。
