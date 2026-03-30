# LightMark 白屏问题诊断和修复

## 🔍 问题诊断

### 症状
- ✅ 窗口能正常打开
- ✅ 标题栏显示 "LightMark"
- ❌ 内容区域完全空白
- ✅ 有企业安全水印（说明窗口已渲染）

### 根本原因分析

根据代码审查，发现了 **Tauri 2.0 的重大变化**：

#### Tauri 1.x vs 2.0 的区别

**Tauri 1.x**:
- 默认允许加载本地文件
- `frontendDist` 指向目录即可

**Tauri 2.0**:
- 默认**禁用**本地文件协议
- 需要显式启用 `assetProtocol`
- 需要配置访问范围（scope）

### 当前配置问题

**tauri.conf.json**:
```json
{
  "build": {
    "frontendDist": "../dist"  // ❌ 缺少 assetProtocol 配置
  }
}
```

这导致 WebView2 无法加载 `asset://` 协议的资源文件。

---

## ✅ 修复方案

### 方案 1: 启用 assetProtocol（推荐）

编辑 `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "frontendDist": "../dist",
    "assetProtocol": {
      "scope": ["**"],
      "enable": true
    }
  }
}
```

### 方案 2: 使用 HTTP 模式（开发环境）

如果是开发环境，确保：
```json
{
  "build": {
    "devUrl": "http://localhost:1420"
  }
}
```

### 方案 3: 检查 Cargo.toml 的 Tauri 功能

确保 `Cargo.toml` 包含必要的功能：
```toml
[dependencies]
tauri = { version = "2.0", features = ["protocol-asset"] }
```

---

## 🔧 立即修复步骤

### 步骤 1: 更新 tauri.conf.json

```bash
cd /home/node/.openclaw/workspace/lightmark
```

编辑 `src-tauri/tauri.conf.json`，添加：

```json
"build": {
  "frontendDist": "../dist",
  "assetProtocol": {
    "scope": ["**"],
    "enable": true
  }
}
```

### 步骤 2: 更新 Cargo.toml

编辑 `src-tauri/Cargo.toml`:

```toml
tauri = { version = "2.0", features = ["protocol-asset"] }
```

### 步骤 3: 重新构建

```bash
# 清理旧的构建
rm -rf dist/
rm -rf src-tauri/target/release/

# 重新构建前端
npm run build:frontend

# 重新构建 Tauri
cd src-tauri
cargo build --release
```

### 步骤 4: 测试

运行新构建的应用程序，检查是否正常显示。

---

## 🐛 如果仍然白屏

### 检查清单

- [ ] WebView2 已安装（https://developer.microsoft.com/en-us/microsoft-edge/webview2/）
- [ ] dist 目录存在且包含文件
- [ ] index.html 能正确引用 JS/CSS 文件
- [ ] Console 没有 JavaScript 错误
- [ ] Network 没有资源加载失败

### 调试步骤

1. **按 F12 打开开发者工具**
   ```
   Ctrl + Shift + I
   或
   F12
   ```

2. **查看 Console 标签页**
   - 查找红色错误信息
   - 截图发给我

3. **查看 Network 标签页**
   - 刷新页面（Ctrl+R）
   - 查看是否有失败的请求（红色）
   - 检查资源路径是否正确

4. **检查元素**
   - 切换到 Elements 标签页
   - 查看 `<div id="app">` 是否有内容
   - 查看是否有内联错误信息

---

## 📊 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Failed to load resource: net::ERR_FAILED` | assetProtocol 未启用 | 添加 assetProtocol 配置 |
| `net::ERR_FILE_NOT_FOUND` | dist 目录路径错误 | 检查 frontendDist 配置 |
| `Uncaught ReferenceError` | JS 加载失败 | 检查 script 标签路径 |
| 空白 + 无错误 | WebView2 未安装 | 安装 WebView2 Runtime |

---

## 📞 下一步

请按以下顺序操作：

1. ✅ 按 F12 打开开发者工具
2. ✅ 截图 Console 标签页的错误信息
3. ✅ 截图 Network 标签页（如果有红色失败项）
4. ✅ 告诉我具体的错误内容

这样我能更精确地帮你定位问题！🔍
