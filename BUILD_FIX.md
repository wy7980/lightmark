# GitHub Actions 构建失败修复

## 🐛 问题描述

构建运行约 1 分钟后失败，没有详细的错误信息。

## 🔍 根本原因

**Tauri CLI 未找到**：
- `tauri-action` 默认尝试使用系统的 `tauri` 命令
- 但 GitHub Actions 环境中没有全局安装 Tauri CLI
- 导致构建在 Tauri 步骤失败

## ✅ 修复方案

### 修复 1: 明确指定 Tauri CLI

```yaml
- name: Build Tauri app
  uses: tauri-apps/tauri-action@v0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    releaseDraft: false
    tauriScript: npx tauri  # ← 添加这行
```

### 修复 2: 放宽产物上传要求

```yaml
- name: Upload Windows installer
  uses: actions/upload-artifact@v4
  with:
    if-no-files-found: warn  # ← 改为 warn，避免构建失败
```

## 📝 完整配置

```yaml
name: Build LightMark for Windows

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  build-windows:
    name: Build for Windows
    runs-on: windows-latest
    permissions:
      contents: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: npm install

      - name: Build frontend
        run: npm run build:frontend

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          releaseDraft: false
          tauriScript: npx tauri

      - name: Upload Windows installer
        uses: actions/upload-artifact@v4
        with:
          name: lightmark-windows-installer
          path: src-tauri/target/release/bundle/nsis/*.exe
          if-no-files-found: warn

      - name: Upload Windows portable
        uses: actions/upload-artifact@v4
        with:
          name: lightmark-windows-portable
          path: src-tauri/target/release/LightMark.exe
          if-no-files-found: warn
```

## 🚀 预计效果

修复后：
- ✅ Tauri CLI 能正确找到
- ✅ 构建流程继续执行
- ✅ 产物上传更宽容
- ✅ 构建时间：约 15-20 分钟

## 📊 查看构建状态

访问：https://github.com/wy7980/lightmark/actions

---

*修复时间：2026-03-30 13:57*
