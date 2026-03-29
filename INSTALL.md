# LightMark 安装指南

## 快速安装

### 方法 1: 自动安装脚本（推荐）

```bash
chmod +x setup.sh
./setup.sh
```

### 方法 2: 手动安装

#### 步骤 1: 安装 Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

验证安装:
```bash
rustc --version  # 应该显示 rustc 1.70+
cargo --version
```

#### 步骤 2: 安装 Node.js 依赖

```bash
npm install
```

#### 步骤 3: 安装 Tauri CLI

```bash
npm install -g @tauri-apps/cli
```

#### 步骤 4: 安装系统依赖（Linux）

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install -y webkit2gtk4.1-devel \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    openssl-devel \
    appindicator3-devel \
    librsvg2-devel
```

#### 步骤 5: 启动开发模式

```bash
npm run dev
```

## 系统要求

| 系统 | 要求 |
|------|------|
| **Windows** | Windows 10/11, WebView2 |
| **macOS** | macOS 10.15+, Xcode Command Line Tools |
| **Linux** | WebKit2GTK 4.1+, libgtk-3-dev |

## 常见问题

### Q: Rust 安装失败？

**A:** 检查网络连接，或使用国内镜像：
```bash
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
curl --proto '=https' --tlsv1.2 -sSf https://mirrors.ustc.edu.cn/rust-static/rustup/init.sh | sh
```

### Q: npm install 失败？

**A:** 使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: Tauri 构建失败？

**A:** 确保安装了所有系统依赖（见步骤 4）

### Q: 开发模式启动后窗口是空白？

**A:** 检查控制台错误，确保 Vite 服务器正常运行在 http://localhost:1420

## 构建发布版

```bash
npm run build
```

构建产物位置:
- **Windows**: `src-tauri/target/release/lightmark.exe`
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Linux**: `src-tauri/target/release/bundle/deb/` 或 `appimage/`

## 卸载

```bash
# 删除项目
rm -rf lightmark/

# 删除 Rust (可选)
rustup self uninstall

# 删除全局 npm 包
npm uninstall -g @tauri-apps/cli
```

---

**遇到问题？** 提交 Issue: https://github.com/openclaw/lightmark/issues
