# LightMark Windows 10 白屏问题修复总结

## ✅ 已完成的修复

### 1. 添加缺失的静态资源
- ✅ 创建 `src/public/vite.svg` 图标文件
- ✅ 修复 `src/index.html` 中的图标路径

### 2. 修复 Vite 配置 (`vite.config.mts`)
- ✅ 添加 `base: './'` 确保相对路径正确
- ✅ 统一使用 `chrome105` 目标（Windows WebView2 兼容性更好）
- ✅ 添加代码分割优化（vendor chunk）
- ✅ 添加依赖预优化配置

### 3. 修复 Tauri 配置 (`src-tauri/tauri.conf.json`)
- ✅ 添加 `withGlobalTauri: true`
- ✅ 添加窗口 `visible: true` 设置
- ✅ 配置 NSIS 安装模式为 `currentUser`
- ✅ 添加图标配置 `"icons/icon.ico"`

### 4. 添加错误处理
- ✅ `App.svelte` 添加错误边界和错误显示界面
- ✅ `main.ts` 添加全局错误监听
- ✅ 添加错误容器样式

### 5. 添加 Tauri 插件支持
- ✅ 添加 `tauri-plugin-fs` 文件系统插件
- ✅ 开发模式下自动打开 DevTools

### 6. 前端构建成功
```
../dist/index.html                   0.96 kB │ gzip:  0.56 kB
../dist/assets/vite-DuUfVdO9.svg     1.45 kB │ gzip:  0.76 kB
../dist/assets/index-BM7YNTzU.css    2.80 kB │ gzip:  0.81 kB
../dist/assets/index-ClFiJ7kD.js   257.41 kB │ gzip: 96.46 kB
../dist/assets/vendor-BdMXHpte.js  277.16 kB │ gzip: 91.11 kB
```

---

## 📦 Windows 构建说明

### 前置条件
在 Windows 10 上构建前，确保已安装：

1. **Node.js >= 18**
   ```powershell
   # 检查版本
   node --version
   ```
   下载地址：https://nodejs.org/

2. **Rust**
   ```powershell
   # 检查安装
   rustc --version
   ```
   下载地址：https://rustup.rs/

3. **WebView2 Runtime**（Windows 10 必需）
   ```powershell
   # 检查是否已安装
   Get-AppxPackage -Name Microsoft.Web.WebView2
   ```
   下载地址：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 构建步骤

```powershell
# 1. 进入项目目录
cd lightmark

# 2. 安装依赖（确保 devDependencies 也安装）
npm install --include=dev

# 3. 构建前端和 Tauri 应用
npm run build
```

### 输出文件

构建完成后，Windows 安装包位于：
```
src-tauri/target/release/bundle/nsis/LightMark_0.1.0_x64-setup.exe
```

绿色版（免安装）位于：
```
src-tauri/target/release/LightMark.exe
```

---

## 🐛 如果仍然白屏

### 1. 启用调试模式
```powershell
$env:TAURI_DEBUG="true"
$env:RUST_LOG="debug"
npm run dev
```

### 2. 检查控制台错误
- 开发模式下会自动打开 DevTools
- 查看 Console 标签页的错误信息
- 查看 Network 标签页的资源加载情况

### 3. 检查 WebView2
如果 WebView2 未安装或不兼容：
- 下载离线安装包：https://go.microsoft.com/fwlink/p/?LinkId=2124703
- 安装后重启计算机

### 4. 查看 Windows 事件日志
- 打开"事件查看器"
- 导航到：Windows 日志 → 应用程序
- 查找 LightMark 相关错误

### 5. 以兼容模式运行
- 右键 `LightMark.exe`
- 属性 → 兼容性
- 勾选"以兼容模式运行"
- 选择 Windows 8

---

## 📝 常见错误及解决方案

### 错误 1: `npm run build` 失败，提示 `vite: not found`
**原因**: devDependencies 未安装
**解决**: 
```powershell
npm install --include=dev
```

### 错误 2: 构建成功但运行时白屏
**原因**: WebView2 未安装或版本过旧
**解决**: 安装 WebView2 Runtime

### 错误 3: 提示"找不到入口点"
**原因**: dist 目录未生成
**解决**: 
```powershell
npm run build
```

### 错误 4: Rust 编译错误
**原因**: Rust 版本过旧或依赖未安装
**解决**: 
```powershell
rustup update
cd src-tauri
cargo check
```

---

## 🔧 开发模式运行

```powershell
# 启动开发服务器（自动热重载）
npm run dev

# 开发模式下会自动打开 DevTools 便于调试
```

---

## 📞 获取帮助

如果问题仍未解决，请提供：
1. Windows 版本号（运行 `winver` 命令）
2. 错误截图
3. 控制台错误信息
4. 日志文件内容

---

## 📚 相关文档

- [Tauri 官方文档](https://tauri.app/)
- [Vite 官方文档](https://vitejs.dev/)
- [Svelte 官方文档](https://svelte.dev/)
- [WebView2 官方文档](https://docs.microsoft.com/en-us/microsoft-edge/webview2/)
