#!/bin/bash
# LightMark 安装脚本

set -e

echo "🚀 LightMark 安装脚本"
echo "===================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 18"
    echo "   https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# 检查 Rust
if ! command -v rustc &> /dev/null; then
    echo "⚠️  Rust 未安装，正在安装..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
fi
echo "✅ Rust: $(rustc --version)"

# 检查 Cargo
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo 未找到"
    exit 1
fi
echo "✅ Cargo: $(cargo --version)"

# 安装 Tauri CLI
echo ""
echo "📦 安装 Tauri CLI..."
npm install -g @tauri-apps/cli

# 安装项目依赖
echo ""
echo "📦 安装项目依赖..."
npm install

# 构建 Tauri 应用
echo ""
echo "🔨 构建 Tauri 应用..."
cd src-tauri
cargo check
cd ..

echo ""
echo "✅ 安装完成！"
echo ""
echo "运行以下命令启动开发模式:"
echo "  npm run dev"
echo ""
echo "构建发布版:"
echo "  npm run build"
