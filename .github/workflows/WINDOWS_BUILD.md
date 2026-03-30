# Windows 自动构建配置

## 📋 工作流说明

### 触发条件
- **Push 到 main 分支**: 自动构建 Windows 版本（不发布 Release）
- **创建标签 (v*)**: 自动构建并创建 GitHub Release
- **Pull Request**: 自动构建验证

### 构建产物
1. **NSIS 安装程序**: `LightMark_*.exe`
   - 位置：`src-tauri/target/release/bundle/nsis/`
   - 适合普通用户安装使用

2. **绿色便携版**: `LightMark.exe`
   - 位置：`src-tauri/target/release/`
   - 无需安装，双击即可运行

### 自动发布

当创建标签时（如 `v0.1.0`）：
- ✅ 自动构建 Windows 版本
- ✅ 创建 GitHub Release
- ✅ 上传安装程序和绿色版
- ✅ 自动生成发布说明

---

## 🚀 使用方法

### 1. 日常开发构建

```bash
git add .
git commit -m "fix: bug fix"
git push origin main
```

构建产物可在 **Actions → Artifacts** 下载（保留 90 天）。

### 2. 发布新版本

```bash
# 1. 更新版本号 (src-tauri/tauri.conf.json)
# 2. 提交
git add src-tauri/tauri.conf.json
git commit -m "release: v0.1.0"
# 3. 打标签
git tag v0.1.0
# 4. 推送标签
git push origin v0.1.0
```

约 **15-20 分钟**后，新版本会在 Releases 页面可见：
https://github.com/wy7980/lightmark/releases

---

## 📊 构建时间

| 步骤 | 预计时间 |
|------|---------|
| 检出代码 | 30 秒 |
| 安装 Node.js | 30 秒 |
| 安装 Rust | 1 分钟 |
| npm install | 2-3 分钟 |
| 前端构建 | 1 分钟 |
| Tauri 构建 | 10-15 分钟 |
| 上传产物 | 1 分钟 |
| **总计** | **15-20 分钟** |

---

## 🔧 自定义配置

### 修改构建参数

编辑 `.github/workflows/build.yml`：

```yaml
# 修改 Node.js 版本
with:
  node-version: '18'  # 或 '20'

# 修改 Rust 版本
uses: dtolnay/rust-toolchain@stable
with:
  toolchain: '1.70.0'  # 指定版本

# 调试模式
with:
  args: --verbose --debug
```

### 添加代码检查

```yaml
- name: Lint
  run: npm run lint

- name: Rust check
  run: cargo clippy
  working-directory: src-tauri
```

---

## 🐛 故障排查

### 构建失败

1. **查看日志**
   - GitHub → Actions → 选择运行 → 查看具体步骤

2. **常见错误**
   - `npm ci` 失败：检查 package-lock.json
   - `rustc` 错误：检查 Rust 版本
   - `tauri build` 失败：检查系统依赖

3. **本地重现**
   ```powershell
   npm run build
   ```

### 产物未上传

检查 `if-no-files-found` 配置：
- `error`: 文件不存在时构建失败
- `warn`: 文件不存在时警告
- `ignore`: 忽略

### Release 未创建

确保：
1. 标签格式正确：`v0.1.0`（必须有 `v` 前缀）
2. 推送了标签：`git push origin v0.1.0`
3. 工作流触发条件包含 `tags: ['v*']`

---

## 📦 下载构建产物

### 从 Actions 下载（开发版本）

1. 访问 https://github.com/wy7980/lightmark/actions
2. 选择最新的工作流运行
3. 在页面底部 "Artifacts" 下载
4. 解压后使用

### 从 Releases 下载（正式版本）

1. 访问 https://github.com/wy7980/lightmark/releases
2. 选择对应版本
3. 下载：
   - `LightMark_*.exe` - 安装程序
   - `LightMark.exe` - 绿色版

---

## 🔐 安全说明

### 权限配置

工作流使用以下权限：
```yaml
permissions:
  contents: write  # 用于创建 Release
```

### Secrets

必需配置：
- `GITHUB_TOKEN`: GitHub 自动提供，无需手动配置

可选配置（未来扩展）：
- `APPLE_CERTIFICATE`: macOS 代码签名（当前未使用）

---

## 📊 构建状态徽章

添加到 README.md：

```markdown
[![Build Status](https://github.com/wy7980/lightmark/actions/workflows/build.yml/badge.svg)](https://github.com/wy7980/lightmark/actions/workflows/build.yml)
```

---

## 📞 获取帮助

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Tauri Action 文档](https://github.com/tauri-apps/tauri-action)
- [Tauri 官方文档](https://tauri.app/distribute/ci/)
