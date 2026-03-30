# LightMark 发布指南

## 🚀 自动构建和发布

本项目已配置 GitHub Actions 自动构建，支持 Windows、Linux、macOS 三个平台。

---

## 📦 下载预构建版本

### 从 GitHub Releases 下载

访问：https://github.com/wy7980/lightmark/releases

选择对应平台的安装包：
- **Windows**: `LightMark_*.exe` (NSIS 安装程序)
- **Linux**: `lightmark_*.AppImage` 或 `lightmark_*.deb`
- **macOS**: `LightMark_*.dmg`

### 从 GitHub Actions 下载（开发版本）

1. 访问 https://github.com/wy7980/lightmark/actions
2. 选择最新的工作流运行
3. 在页面底部 "Artifacts" 下载

---

## 🏷️ 发布新版本

### 1. 更新版本号

编辑 `src-tauri/tauri.conf.json`：
```json
{
  "version": "0.1.1"  // 更新版本号
}
```

### 2. 提交并打标签

```bash
git add src-tauri/tauri.conf.json
git commit -m "release: v0.1.1"
git tag v0.1.1
git push origin v0.1.1
```

### 3. 等待自动构建

GitHub Actions 会自动：
1. ✅ 构建 Windows、Linux、macOS 三个平台
2. ✅ 创建 GitHub Release
3. ✅ 上传所有安装包

约 15-20 分钟后，新版本会在 Releases 页面可见。

---

## 📝 版本命名规范

遵循 [Semantic Versioning](https://semver.org/)：

- **MAJOR.MINOR.PATCH** (主版本号。次版本号。修订号)
- 例如：`0.1.0`, `1.0.0`, `2.1.3`

### 版本号含义

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修正

### 预发布版本

- `0.1.0-alpha.1` - 内部测试版
- `0.1.0-beta.1` - 公开测试版
- `0.1.0-rc.1` - 候选发布版

---

## 🔧 手动构建

如果自动构建失败，可以手动构建：

### Windows

```powershell
# 安装依赖
npm install --include=dev

# 构建
npm run build

# 输出位置
src-tauri/target/release/bundle/nsis/LightMark_*.exe
```

### Linux

```bash
# 安装系统依赖
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# 安装依赖
npm install --include=dev

# 构建
npm run build

# 输出位置
src-tauri/target/release/bundle/appimage/*.AppImage
src-tauri/target/release/bundle/deb/*.deb
```

### macOS

```bash
# 安装依赖
npm install --include=dev

# 构建
npm run build

# 输出位置
src-tauri/target/release/bundle/dmg/*.dmg
```

---

## 📊 构建状态

### 当前状态

[![Build Status](https://github.com/wy7980/lightmark/actions/workflows/build.yml/badge.svg)](https://github.com/wy7980/lightmark/actions/workflows/build.yml)

### 历史构建

访问 https://github.com/wy7980/lightmark/actions 查看所有构建历史。

---

## 🐛 构建问题反馈

如果构建失败或安装包有问题，请：

1. **查看构建日志**
   - GitHub → Actions → 选择运行 → 查看日志

2. **报告问题**
   - 访问 https://github.com/wy7980/lightmark/issues
   - 提供：
     - 操作系统版本
     - 错误信息截图
     - 构建日志链接

3. **临时解决方案**
   - 下载上一个稳定版本
   - 或手动构建

---

## 📅 发布计划

### v0.1.0 (当前版本)
- ✅ 基础 Markdown 编辑功能
- ✅ 即时预览
- ✅ 文件打开/保存
- ✅ Windows/Linux/macOS 支持

### v0.2.0 (计划中)
- [ ] 语法高亮主题
- [ ] 导出 PDF/HTML
- [ ] 图片拖放上传
- [ ] 自动保存

### v1.0.0 (未来)
- [ ] 插件系统
- [ ] 云同步
- [ ] 协作编辑
- [ ] 移动端支持

---

## 📞 联系方式

- **GitHub Issues**: https://github.com/wy7980/lightmark/issues
- **Email**: (待添加)
- **Discord**: (待添加)

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
