# GitHub Actions 自动构建配置

## 📋 工作流说明

### `build.yml` - 自动构建和发布

#### 触发条件
- **Push 到 main 分支**: 自动构建所有平台
- **创建标签 (v*)**: 自动构建并创建 GitHub Release
- **Pull Request**: 自动构建验证

#### 构建平台
1. **Windows** (windows-latest)
   - 输出：NSIS 安装程序 (.exe) + 绿色版 (.exe)
   - 架构：x86_64

2. **Linux** (ubuntu-22.04)
   - 输出：AppImage + deb 包
   - 架构：x86_64

3. **macOS** (macos-latest)
   - 输出：DMG + App
   - 架构：Universal (Intel + Apple Silicon)

#### 产物
构建完成后，可在 GitHub Actions 页面下载：
- Windows 安装程序
- Windows 绿色版
- Linux AppImage
- Linux deb 包
- macOS DMG
- macOS App

如果是标签发布（如 `v0.1.0`），会自动创建 GitHub Release 并上传所有产物。

---

## 🔧 配置 Secrets

### 必需配置（macOS 签名）

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

#### macOS 代码签名（可选，但推荐）
```
APPLE_CERTIFICATE         # Apple 开发者证书（base64 编码）
APPLE_CERTIFICATE_PASSWORD # 证书密码
APPLE_SIGNING_IDENTITY   # 签名身份
APPLE_ID                 # Apple ID
APPLE_PASSWORD           # Apple ID 密码（应用专用密码）
APPLE_TEAM_ID            # Apple Team ID
```

#### GitHub Token（自动配置）
```
GITHUB_TOKEN  # GitHub 自动提供，无需手动配置
```

### 获取 Apple 证书

1. 导出证书：
```bash
# 在 macOS 上导出证书
security find-identity -v -p codesigning
security export -k ~/Library/Keychains/login.keychain-db -t cert -f x509 -p certpass -o apple-cert.p12 "Developer ID Application: Your Name"
```

2. 转换为 base64：
```bash
base64 -i apple-cert.p12
```

3. 将输出复制到 GitHub Secrets

---

## 🚀 使用方法

### 1. 自动构建（每次 push）
```bash
git add .
git commit -m "fix: some bug fix"
git push origin main
```

GitHub Actions 会自动开始构建，可在 Actions 标签页查看进度。

### 2. 发布新版本
```bash
# 更新版本号（src-tauri/tauri.conf.json）
# 然后打标签
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions 会：
1. 构建所有平台
2. 创建 GitHub Release
3. 上传所有安装包

### 3. 查看构建产物

#### 开发版本
- 进入 GitHub → 仓库 → Actions
- 选择对应的工作流运行
- 在底部 "Artifacts" 下载

#### 发布版本
- 进入 GitHub → 仓库 → Releases
- 下载对应平台的安装包

---

## 📝 自定义配置

### 修改构建参数

编辑 `.github/workflows/build.yml`：

```yaml
# 修改 Node.js 版本
with:
  node-version: '18'  # 改为 18 或 20

# 修改 Rust 版本
uses: dtolnay/rust-toolchain@stable
with:
  toolchain: '1.70.0'  # 指定版本

# 修改构建参数
with:
  args: --verbose --debug  # 调试模式
```

### 添加测试

```yaml
- name: Run tests
  run: npm test

- name: Run Rust tests
  run: cargo test
  working-directory: src-tauri
```

### 添加代码质量检查

```yaml
- name: Lint
  run: npm run lint

- name: Check Rust code
  run: cargo clippy
  working-directory: src-tauri
```

---

## 🔍 故障排查

### 构建失败

1. **查看日志**
   - GitHub → Actions → 选择运行 → 查看具体步骤日志

2. **常见错误**
   - `npm ci` 失败：检查 package-lock.json 是否最新
   - `rustc` 错误：检查 Rust 版本兼容性
   - `tauri build` 失败：检查系统依赖是否安装

3. **本地重现**
   ```bash
   # 本地构建测试
   npm run build
   ```

### 产物未上传

检查 `if-no-files-found` 配置：
- `error`: 文件不存在时构建失败
- `warn`: 文件不存在时警告
- `ignore`: 忽略

### macOS 签名失败

1. 检查证书是否过期
2. 检查应用专用密码是否正确
3. 检查 Team ID 是否正确

---

## 📊 构建时间优化

### 使用缓存
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/bin/
      ~/.cargo/registry/index/
      ~/.cargo/registry/cache/
      ~/.cargo/git/db/
      node_modules/
    key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json', '**/Cargo.lock') }}
```

### 并行构建
当前配置已并行构建三个平台，总时间 ≈ 最慢平台的时间

### 使用矩阵构建
```yaml
strategy:
  matrix:
    os: [windows-latest, ubuntu-22.04, macos-latest]

runs-on: ${{ matrix.os }}
```

---

## 📞 获取帮助

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Tauri Action 文档](https://github.com/tauri-apps/tauri-action)
- [Tauri 官方文档](https://tauri.app/distribute/ci/)
