# Windows 10 白屏问题修复说明

## 🔧 已应用的修复

### 1. 添加缺失的图标文件
- 创建 `src/public/vite.svg`
- 修复 `src/index.html` 中的图标路径

### 2. 修复 Tauri 配置
- 添加 `withGlobalTauri: true`
- 添加窗口 `visible: true` 设置
- 添加 `webviewBackgroundTransparent: false`
- 配置 NSIS 安装模式为 `currentUser`
- 添加图标配置

### 3. 添加错误处理
- `App.svelte` 添加错误边界
- `main.ts` 添加全局错误监听
- 显示友好的错误提示界面

### 4. 优化 Vite 配置
- 添加 `base: './'` 确保相对路径正确
- 统一使用 `chrome105` 目标（Windows 兼容性更好）
- 添加代码分割优化
- 添加依赖预优化

### 5. 添加 Tauri 插件
- 添加 `tauri-plugin-fs` 文件系统支持
- 开发模式下自动打开 DevTools 便于调试

---

## 📦 Windows 构建步骤

### 前置条件
确保 Windows 10 已安装：
1. **Node.js >= 18** - https://nodejs.org/
2. **Rust** - https://rustup.rs/
3. **WebView2 Runtime** - https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 构建命令

```powershell
# 1. 进入项目目录
cd lightmark

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 构建 Tauri 应用
cd src-tauri
cargo build --release

# 5. 或使用一键构建
cd ..
npm run build
```

### 输出位置
构建完成后，Windows 安装包位于：
```
src-tauri/target/release/bundle/nsis/LightMark_0.1.0_x64-setup.exe
```

---

## 🐛 如果仍然白屏

### 1. 启用调试模式
```powershell
$env:TAURI_DEBUG="true"
$env:RUST_LOG="debug"
npm run dev
```

### 2. 检查 WebView2
打开 PowerShell 运行：
```powershell
Get-AppxPackage -Name Microsoft.Web.WebView2
```
如果未安装，下载：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 3. 查看日志
- 打开 Windows 事件查看器
- 导航到：Windows 日志 → 应用程序
- 查找 LightMark 相关错误

### 4. 以兼容模式运行
- 右键 `LightMark.exe`
- 属性 → 兼容性
- 勾选"以兼容模式运行"
- 选择 Windows 8

### 5. 检查防火墙
确保 Windows 防火墙没有阻止：
- `LightMark.exe`
- 端口 1420（开发模式）

---

## 📝 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| 50080 | 无效的用户 ID | 检查蓝信配置 |
| 40060 | 消息格式错误 | 检查 API 参数 |
| -5 | API 路径错误 | 检查 gatewayUrl |

---

## 📞 获取帮助

如果问题仍未解决，请提供：
1. Windows 版本号（winver 命令）
2. 错误截图
3. 日志文件内容
