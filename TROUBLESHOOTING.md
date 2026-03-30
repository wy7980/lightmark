# LightMark 故障排查指南

## 🐛 问题：安装后打开显示空白窗口

### 症状
- 窗口能正常打开
- 标题栏显示 "LightMark"
- 内容区域是空白的
- 有水印（企业内部环境）

### 可能原因

#### 1. WebView2 运行时未安装或版本过旧 ⭐ 最常见

**检查方法**：
```powershell
# PowerShell 中运行
Get-AppxPackage -Name Microsoft.Web.WebView2
```

**解决方案**：
1. 下载 WebView2 运行时：https://developer.microsoft.com/en-us/microsoft-edge/webview2/
2. 选择 **常青版引导程序** (Evergreen Bootstrapper)
3. 安装后重启应用程序

#### 2. 前端资源加载失败

**检查方法**：
1. 按 `Ctrl + Shift + I` 或 `F12` 打开开发者工具
2. 查看 Console 标签页的错误信息
3. 查看 Network 标签页查看资源加载状态

**常见错误**：
- `Failed to load resource` - 资源文件缺失
- `ERR_FILE_NOT_FOUND` - dist 目录路径错误
- `net::ERR_FAILED` - WebView2 无法访问本地文件

**解决方案**：
```powershell
# 重新构建前端
cd lightmark
npm run build:frontend

# 检查 dist 目录
ls dist/
# 应该看到：
# - index.html
# - assets/
```

#### 3. 企业安全策略限制

**症状**：
- 有企业水印
- WebView2 被组策略限制
- 无法加载本地文件

**解决方案**：
1. 联系 IT 部门将 LightMark 加入白名单
2. 或尝试以管理员身份运行
3. 检查企业安全软件日志

#### 4. 端口冲突（开发模式）

**症状**：
- 只在开发模式出现
- 生产模式正常

**解决方案**：
```powershell
# 检查端口占用
netstat -ano | findstr :1420

# 修改 vite.config.mts 中的端口
server: {
  port: 1421,  // 改为其他端口
}
```

---

## 🔍 调试步骤

### 步骤 1: 检查 WebView2 版本

```powershell
# 查看已安装的 WebView2 版本
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" /v pv
```

最低要求：WebView2 版本 >= 86.0.616.0

### 步骤 2: 查看应用日志

```powershell
# 启用调试模式
$env:RUST_LOG="debug"
$env:TAURI_DEBUG="true"

# 运行应用
.\LightMark.exe
```

日志会显示：
- WebView2 初始化状态
- 资源加载情况
- 任何错误信息

### 步骤 3: 检查文件完整性

```powershell
# 检查安装目录
ls "C:\Program Files\LightMark\"

# 应该包含：
# - LightMark.exe
# - dist/
#   - index.html
#   - assets/
```

### 步骤 4: 尝试便携版

如果安装版有问题，尝试下载绿色便携版：
1. 解压到任意目录
2. 双击 `LightMark.exe`
3. 观察是否仍然白屏

---

## 🛠️ 解决方案

### 方案 1: 安装 WebView2（推荐）

下载地址：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

选择对应的安装包：
- **企业部署**：常青版固定版本
- **个人使用**：常青版引导程序

### 方案 2: 重新构建

```bash
# 清理
rm -rf dist/
rm -rf src-tauri/target/release/

# 重新构建
npm run build
```

### 方案 3: 检查 CSP 配置

编辑 `src-tauri/tauri.conf.json`：

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    }
  }
}
```

### 方案 4: 联系支持

如果以上方案都无效，请提供：
1. Windows 版本（winver 命令）
2. WebView2 版本
3. 开发者工具 Console 截图
4. 企业安全软件名称

---

## 📊 常见错误代码

| 错误 | 含义 | 解决方案 |
|------|------|---------|
| `0x80070002` | 文件未找到 | 检查 dist 目录 |
| `0x80131500` | WebView2 初始化失败 | 安装 WebView2 |
| `ERR_FAILED` | 资源加载失败 | 检查文件权限 |
| `net::ERR_ACCESS_DENIED` | 访问被拒绝 | 检查安全策略 |

---

## 📞 获取帮助

- **GitHub Issues**: https://github.com/wy7980/lightmark/issues
- **构建日志**: https://github.com/wy7980/lightmark/actions
- **文档**: https://github.com/wy7980/lightmark/blob/main/README.md
