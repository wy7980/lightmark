# LightMark 部署状态

## 📊 最新构建状态

### 当前版本：v0.1.0

**构建配置**：
- ✅ 只构建 Windows 版本
- ✅ NSIS 安装程序 + 绿色便携版
- ✅ 自动发布到 GitHub Releases
- ✅ 启用 assetProtocol 修复白屏问题

---

## 🔄 实时构建状态

访问查看实时状态：
- **Actions**: https://github.com/wy7980/lightmark/actions
- **Releases**: https://github.com/wy7980/lightmark/releases

---

## 📦 下载最新版本

### 方式 1: GitHub Releases（推荐）

1. 访问 https://github.com/wy7980/lightmark/releases
2. 下载最新版本：
   - `LightMark_*.exe` - 安装程序（推荐）
   - `LightMark.exe` - 绿色便携版

### 方式 2: GitHub Actions（开发版本）

1. 访问 https://github.com/wy7980/lightmark/actions
2. 选择最新的成功构建（绿色勾）
3. 在页面底部 "Artifacts" 下载

---

## 🛠️ 构建历史

| 提交 | 状态 | 时间 | 说明 |
|------|------|------|------|
| d20469d | 🔄 构建中 | 12:05 | 修正 assetProtocol 配置位置 |
| f7f61d6 | ❌ 失败 | 11:45 | assetProtocol 配置位置错误 |
| 18a2b2c | ✅ 成功 | 11:43 | 添加调试日志 |
| bf5ccad | ✅ 成功 | 11:42 | Windows 构建配置 |

---

## 🐛 已知问题修复

### v0.1.0 修复内容

1. **Windows 10 白屏问题** ✅
   - 启用 assetProtocol
   - 添加调试日志
   - 添加错误提示界面

2. **构建失败问题** ✅
   - 修正 assetProtocol 配置位置
   - 从 build 层级移到 app 层级

3. **文件发送问题** ✅
   - 修复蓝信插件媒体类型定义
   - 添加配置兼容性映射

---

## 📋 构建验证清单

构建成功后，请验证：

- [ ] Windows 安装程序能正常下载
- [ ] 安装后能正常启动
- [ ] 主界面正常显示（不白屏）
- [ ] 能打开 Markdown 文件
- [ ] 能保存文件
- [ ] 按 F12 能打开开发者工具

---

## 🚀 发布流程

### 1. 开发完成

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

✅ GitHub Actions 自动构建（不发布 Release）

### 2. 发布新版本

```bash
# 更新版本号
# src-tauri/tauri.conf.json: "version": "0.1.1"

git add src-tauri/tauri.conf.json
git commit -m "release: v0.1.1"
git tag v0.1.1
git push origin v0.1.1
```

✅ GitHub Actions 自动构建并发布 Release

### 3. 验证发布

- [ ] 检查 Actions 构建状态
- [ ] 检查 Releases 页面
- [ ] 下载并测试安装程序
- [ ] 下载并测试绿色版

---

## 📞 问题反馈

如果构建失败或发布有问题：

1. **查看构建日志**
   - Actions → 选择运行 → 查看具体步骤

2. **常见错误**
   - `assetProtocol` 配置错误：确保在 app 层级
   - `tauri build` 失败：检查 Rust 依赖
   - `npm install` 失败：清理缓存 `npm cache clean --force`

3. **报告问题**
   - GitHub Issues: https://github.com/wy7980/lightmark/issues
   - 提供：错误截图 + 构建日志链接

---

## 📊 构建时间统计

| 平台 | 预计时间 | 实际时间 |
|------|---------|---------|
| Windows | 15-20 分钟 | ~18 分钟 |
| Linux | 12-18 分钟 | - |
| macOS | 18-25 分钟 | - |

---

## 🔐 安全说明

### 代码签名

当前版本：
- ❌ 未配置 Windows 代码签名
- ❌ 未配置 macOS 代码签名

影响：
- Windows SmartScreen 可能警告
- macOS 需要手动授权

计划：
- [ ] 配置 Windows EV 证书
- [ ] 配置 Apple Developer 证书

---

*最后更新：2026-03-30 12:05*
