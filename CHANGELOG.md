# 禅意笔记本 - 开发进度报告

> 本地优先的 AI 记事本，支持双模 AI 引擎（WebLLM + Ollama）

---

## 📌 当前版本: v0.1.0-alpha

**最后更新**: 2024-12-14

---

## ✅ Phase 1: 双模 AI 引擎 (已完成)

### 已完成功能

- [x] **项目初始化**
  - Electron + Vite + React 架构
  - macOS vibrancy 窗口效果
  - WebGPU 支持配置

- [x] **LLM 服务抽象层**
  - `types.ts` - 统一类型定义
  - `OllamaService.ts` - Ollama HTTP 客户端
  - `WebLLMService.ts` - WebLLM 服务封装
  - `llm.worker.ts` - Web Worker 运行 AI 模型

- [x] **双引擎自动检测**
  - 启动时探测 Ollama (localhost:11434)
  - 获取已安装模型列表
  - 自动降级到 WebLLM

- [x] **UI 组件**
  - `StatusIndicator.tsx` - 引擎状态指示器
  - `ChatPanel.tsx` - iMessage 风格聊天界面
  - `Sidebar.tsx` - 笔记列表
  - `Editor.tsx` - 文本编辑器
  - 模型选择下拉菜单

- [x] **错误处理**
  - WebGPU 可用性检测
  - 错误信息显示
  - 重新检测按钮

### 技术细节

| 组件 | 技术方案 |
|------|----------|
| Ollama 默认模型 | 自动选择第一个已安装模型 |
| WebLLM 默认模型 | `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` |
| 检测超时 | 3 秒 |
| 流式响应 | 支持，打字机效果 |

---

## 🚧 Phase 2: 待开发功能

- [ ] 笔记持久化 (本地 JSON 存储)
- [ ] 笔记搜索功能
- [ ] AI 笔记摘要
- [ ] 笔记导出 (Markdown)
- [ ] 深色模式优化

---

## 📝 版本历史

### v0.1.0-alpha (2024-12-14)

**新增**
- 初始化项目结构
- 实现双模 AI 引擎架构
- Ollama 自动检测与模型切换
- WebLLM 降级支持
- macOS 原生视觉风格

**修复**
- 修复 vite-plugin-electron 启动配置
- 修复 WebLLM 模型 ID
- 添加 WebGPU 检测逻辑
- 改进错误提示

---

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 📁 项目结构

```
禅意笔记本/
├── electron/
│   ├── main.ts           # Electron 主进程
│   └── preload.ts        # 预加载脚本
├── src/
│   ├── components/       # React 组件
│   ├── hooks/            # React Hooks
│   ├── services/         # LLM 服务
│   └── styles/           # CSS 样式
├── package.json
├── vite.config.ts
└── CHANGELOG.md          # 本文件
```

---

## 🐛 已知问题

1. **WebGPU 兼容性**: 部分 Mac 机型可能不支持 WebGPU
2. **首次加载慢**: WebLLM 模型首次加载需要下载权重文件

---

## 📞 联系方式

如有问题，请在 GitHub Issues 中反馈。
