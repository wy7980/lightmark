# LightMark - 高性能 Markdown 编辑器

🚀 **Notepad++ 的启动速度 + Typora 的即时渲染**

## 特性

- ⚡ 极速启动 (< 500ms)
- 💾 轻量级 (安装包 < 15MB, 内存 < 80MB)
- 📝 实时 Markdown 预览
- 🔧 自动保存
- 🎨 暗色主题
- 📊 字数统计

## 技术栈

### 前端
- **Svelte 4** - 无运行时开销
- **CodeMirror 6** - 高性能编辑器引擎
- **Vite** - 极速构建工具

### 后端
- **Tauri 2.0** - 轻量级桌面应用框架
- **Rust** - 系统级性能
- **pulldown-cmark** - 高速 Markdown 解析器

## 开发环境要求

- Node.js >= 18
- Rust >= 1.70
- npm 或 pnpm

## 快速开始

### 1. 安装依赖

```bash
cd lightmark
npm install
```

### 2. 开发模式

```bash
npm run dev
```

这会同时启动:
- Vite 开发服务器 (http://localhost:1420)
- Tauri 应用窗口

### 3. 构建发布版

```bash
npm run build
```

构建产物在 `src-tauri/target/release/` 目录

## 项目结构

```
lightmark/
├── src/                      # 前端代码
│   ├── components/
│   │   ├── Editor.svelte     # 编辑器组件
│   │   ├── Toolbar.svelte    # 工具栏
│   │   └── Sidebar.svelte    # 侧边栏
│   ├── App.svelte            # 主应用
│   └── main.ts               # 入口
├── src-tauri/                # Rust 后端
│   ├── src/
│   │   └── main.rs           # 主程序
│   ├── Cargo.toml            # Rust 依赖
│   └── tauri.conf.json       # Tauri 配置
├── package.json              # Node 依赖
└── vite.config.ts            # Vite 配置
```

## 性能优化

### 已实现
- ✅ Rust 后端 Markdown 解析
- ✅ 防抖处理 (50ms)
- ✅ 增量解析支持
- ✅ 虚拟滚动 (CodeMirror 内置)
- ✅ 懒加载组件

### 待实现
- ⏳ Web Worker 异步解析
- ⏳ 文件树缓存
- ⏳ 插件系统
- ⏳ 主题切换

## 路线图

| 版本 | 目标 | 状态 |
|------|------|------|
| v0.1 | 核心编辑功能 | 🚧 进行中 |
| v0.2 | 文件管理 | ⏳ 计划中 |
| v0.3 | 图片/表格支持 | ⏳ 计划中 |
| v1.0 | 正式发布 | ⏳ 计划中 |

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request!

---

**开发中项目，请勿用于生产环境**
