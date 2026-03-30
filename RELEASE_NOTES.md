# LightMark v0.1.0 发布说明

## 🎉 发布信息

- **版本**: v0.1.0
- **发布日期**: 2026-03-30
- **平台**: Windows 10/11
- **构建**: GitHub Actions 自动构建

---

## ✨ 核心修复

### 1. Windows 10 白屏问题 ✅

**问题描述**:
- 应用窗口能打开但内容区域完全空白
- Tauri 2.0 默认禁用本地文件协议导致

**修复内容**:
- 启用 `assetProtocol` 允许加载本地资源
- 添加 `protocol-asset` 功能支持
- 配置访问范围 `scope: ["**"]`

**配置文件**:
```json
{
  "app": {
    "assetProtocol": {
      "scope": ["**"],
      "enable": true
    }
  }
}
```

```toml
[dependencies]
tauri = { version = "2.0", features = ["protocol-asset"] }
```

### 2. 构建流程优化 ✅

**修复内容**:
- 简化 GitHub Actions 配置
- 使用 `npm install` 代替 `npm ci`
- 分离前端构建和 Tauri 构建
- 添加详细的构建状态跟踪

---

## 📦 安装包说明

### 下载方式

#### 方式 1: GitHub Releases（推荐）
访问：https://github.com/wy7980/lightmark/releases

#### 方式 2: GitHub Actions
访问：https://github.com/wy7980/lightmark/actions
- 选择最新的成功构建
- 在 "Artifacts" 下载

### 安装包类型

1. **NSIS 安装程序** (`LightMark_*.exe`)
   - 适合普通用户
   - 自动创建桌面快捷方式
   - 支持卸载

2. **绿色便携版** (`LightMark.exe`)
   - 无需安装
   - 双击即可运行
   - 适合 U 盘携带

---

## 🚀 使用指南

### 安装步骤

1. 下载 `LightMark_*.exe`
2. 双击运行安装程序
3. 选择安装目录
4. 完成安装

### 首次运行

1. 双击桌面快捷方式或 `LightMark.exe`
2. 按 `F12` 可以打开开发者工具（调试用）
3. 开始编辑 Markdown 文件！

### 功能特性

- ✅ Markdown 实时预览
- ✅ 文件打开/保存
- ✅ 字数统计
- ✅ 侧边栏文件管理
- ✅ 工具栏快捷操作

---

## 🐛 已知问题

### 1. 企业环境可能需要管理员权限

**症状**: 安装后无法启动
**解决**: 右键 → 以管理员身份运行

### 2. WebView2 未安装

**症状**: 白屏或无法加载
**解决**: 安装 WebView2 Runtime
下载地址：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 3. 企业安全软件拦截

**症状**: 启动后被安全软件阻止
**解决**: 联系 IT 部门加入白名单

---

## 📊 构建状态

| 组件 | 状态 | 说明 |
|------|------|------|
| 前端构建 | ✅ 成功 | Vite + Svelte |
| Tauri 构建 | ✅ 成功 | Rust + WebView2 |
| NSIS 打包 | ✅ 成功 | 安装程序 |
| 便携版 | ✅ 成功 | 绿色版 |
| 自动发布 | ✅ 成功 | GitHub Releases |

---

## 🔧 技术栈

- **前端**: Vite + Svelte + CodeMirror
- **后端**: Rust + Tauri 2.0
- **渲染**: WebView2 (Chromium)
- **Markdown**: pulldown-cmark
- **构建**: GitHub Actions

---

## 📝 更新日志

### v0.1.0 (2026-03-30)

**新增**:
- ✅ 基础 Markdown 编辑功能
- ✅ 实时预览
- ✅ 文件打开/保存
- ✅ 字数统计
- ✅ GitHub Actions 自动构建

**修复**:
- ✅ Windows 10 白屏问题
- ✅ 构建流程优化
- ✅ assetProtocol 配置

---

## 📞 问题反馈

### 遇到问题？

1. **查看故障排查指南**: `TROUBLESHOOTING.md`
2. **查看构建状态**: `BUILD_STATUS.md`
3. **提交 Issue**: https://github.com/wy7980/lightmark/issues

### 提供信息

- Windows 版本（运行 `winver`）
- 错误截图
- 开发者工具 Console 错误（按 F12）

---

## 📄 许可证

MIT License - 详见 `LICENSE` 文件

---

## 👏 致谢

感谢以下开源项目：
- [Tauri](https://tauri.app/)
- [Svelte](https://svelte.dev/)
- [Vite](https://vitejs.dev/)
- [CodeMirror](https://codemirror.net/)

---

*最后更新：2026-03-30 13:38*
