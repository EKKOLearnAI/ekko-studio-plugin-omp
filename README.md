# OMP for Ekko Studio

独立维护的 [OMP / Oh My Pi](https://omp.sh/) Agent 插件，提供原生模型配置、
Studio scoped 模型、流式输出、工具事件、附件、会话续接和引擎安装升级。
插件 ID 保持 `omp`，Agent ID 保持 `plugin:omp/omp`。从 Studio 内置版本升级不会改变数据命名空间。

## 开发和调试

需要 Node.js 24+ 和支持插件 Agent API v1 的 Ekko Studio。仓库可以放在任意目录：

```bash
git clone https://github.com/EKKOLearnAI/ekko-studio-plugin-omp.git
cd ekko-studio-plugin-omp
npm ci --ignore-scripts
npm run harness:check
npm test
ekko-studio plugins link "$PWD"
npm run dev
```

`npm run dev` 登记项目并提示打开 Studio → 插件中心 → 开发插件 → 开始调试。
CLI 和运行中的 Studio 必须使用同一个 `HERMES_WEB_UI_HOME`。此项目直接运行 `.mjs`，无需编译。
宿主先运行 harness，再复制开发快照、监听改动并重载。失败时保留上一可用版本。
调试会替换当前安装的同 ID 插件，保留其数据；需要完全隔离时使用单独的 Studio 数据目录。
停止调试保留最后快照；回到随 Studio 分发的版本可安装 `builtin:omp`。

在 Agent 管理里安装 OMP 引擎，或在 OMP 设置页填写已有可执行文件的绝对路径。
global 模式使用本插件设置的原生模型；scoped 模式使用 Studio 本轮注入的模型。
引擎从官方 GitHub Release 下载并验证校验和，独立于插件版本，不随源码仓库打包。

## 开发文档和 harness

- [架构](docs/ARCHITECTURE.md)、[Studio ctx](docs/STUDIO_CTX.md)、[回传结构](docs/STUDIO_RETURNS.md)
- [开发规范](docs/DEVELOPMENT.md)、[OMP 数据和运行契约](docs/CONTRACTS.md)
- [宿主类型](sdk/src/index.ts)、[Agent 类型](sdk/src/agents.ts)

指南和 SDK 随项目保存，来源为 Studio PR #3774 的 `8c71b43e10a4a2f211e378aad3ec1d85e78253e3`。
升级 SDK 时一起更新指南。修改公开字段或持久化结构时，在同一次提交直接编辑
`contracts/plugin.json` 和相关 Markdown，并修改边界测试；没有文档生成命令。

`npm run harness:check` 检查契约描述、模型引用、版本和必备文档；`npm test` 检查实际
RPC/存储形状、账号隔离、密钥遮蔽、引擎下载完整性以及模拟引擎的运行、续接和取消。
Studio 的宿主集成与浏览器测试保留在 Studio 仓库。模拟引擎测试不需要网络或模型凭证。
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
