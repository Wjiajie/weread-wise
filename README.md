# WeRead Wise

移动优先的微信读书知识导入与 AI 对话 PWA 原型。

## 已实现范围

- 项目内 vendored 微信读书官方 skill 资源：`skills/Tencent-WeChatReading/skill/weread-skills`
- WeRead 接入层：`WeReadConnector` 隔离官方 Agent Gateway 和本地样例/Markdown 兼容源
- 移动优先 PWA：manifest、service worker、可安装图标、底部四 Tab 导航
- 书架体验：微信读书风格书架、同步入口、筛选、书籍详情、划线预览
- 对话体验：DeepSeek、豆包、Kimi、MiniMax、智谱、千问 provider 抽象，多项目上下文引用，RAG 检索样例
- 项目体验：文件夹式项目、上下文索引状态、对话引用开关
- 设置体验：WeRead Skill 能力清单、LLM 网关、PWA 与隐私说明

## WeRead Skill 能力

官方 skill 通过 `POST https://i.weread.qq.com/api/agent/gateway` 调用，认证为
`Authorization: Bearer $WEREAD_API_KEY`，每次请求需要携带 `skill_version`。

本项目映射的能力包括：

- `bookshelf.list` -> `/shelf/sync`
- `stats.get` -> `/readdata/detail`
- `notes.list` -> `/user/notebooks`
- `notes.export` -> `/book/bookmarklist` + `/review/list/mine`
- `book.search` -> `/store/search`
- `book.detail` -> `/book/info` + `/book/chapterinfo` + `/book/getprogress`
- `book.reviews` -> review APIs
- `recommendations.list` -> discover APIs

## 本地运行

```bash
npm install
npm run dev
```

可选环境变量：

```bash
WEREAD_API_KEY=wrk_xxxxx
DEEPSEEK_API_KEY=...
DOUBAO_API_KEY=...
KIMI_API_KEY=...
MINIMAX_API_KEY=...
ZHIPU_API_KEY=...
QIANWEN_API_KEY=...
```

未配置 API Key 时，应用使用本地样例数据，便于移动端 UI 和数据流验证。
