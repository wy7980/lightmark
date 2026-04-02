#!/bin/bash

# ============================================
# LightMark E2E 测试环境安装脚本
# ============================================
# 用途：安装 Playwright 浏览器和系统依赖
# 执行：bash scripts/install-playwright.sh
# ============================================

set -e  # 遇到错误立即退出

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "🚀 LightMark E2E 测试环境安装"
echo "============================================"
echo ""
echo "📁 项目目录：$PROJECT_DIR"
echo ""

# 检查 Node.js
echo "📦 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js"
    echo "请先安装 Node.js >= 18"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js 版本：$NODE_VERSION"
echo ""

# 检查 npm
echo "📦 检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到 npm"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm 版本：$NPM_VERSION"
echo ""

# 进入项目目录
cd "$PROJECT_DIR"

# 安装依赖
echo "📦 安装 npm 依赖..."
npm install
echo "✅ npm 依赖安装完成"
echo ""

# 安装 Playwright 浏览器
echo "🌐 安装 Playwright 浏览器..."
echo "   这将下载 Chromium, Firefox, WebKit"
echo "   可能需要几分钟..."
echo ""

npx playwright install

echo "✅ Playwright 浏览器安装完成"
echo ""

# 检查是否有 sudo 权限
echo "🔧 检查系统依赖安装权限..."
if command -v sudo &> /dev/null; then
    HAS_SUDO=true
    echo "✅ 检测到 sudo 权限"
else
    HAS_SUDO=false
    echo "⚠️  未检测到 sudo 权限"
fi
echo ""

# 安装系统依赖
if [ "$HAS_SUDO" = true ]; then
    echo "🔧 安装 Playwright 系统依赖..."
    echo "   需要 sudo 权限安装系统库"
    echo ""
    
    # 尝试使用 playwright 的自动安装
    if npx playwright install-deps 2>/dev/null; then
        echo "✅ 系统依赖安装完成"
    else
        echo "⚠️  自动安装失败，尝试手动安装..."
        echo ""
        
        # 检测 Linux 发行版
        if [ -f /etc/debian_version ]; then
            echo "📋 检测到 Debian/Ubuntu 系统"
            echo "正在安装系统依赖..."
            sudo apt-get update
            sudo apt-get install -y \
                libnspr4 \
                libnss3 \
                libatk1.0-0 \
                libatk-bridge2.0-0 \
                libcups2 \
                libdrm2 \
                libdbus-1-3 \
                libxkbcommon0 \
                libxcomposite1 \
                libxdamage1 \
                libxfixes3 \
                libxrandr2 \
                libgbm1 \
                libasound2 \
                libpango-1.0-0 \
                libcairo2 \
                libglib2.0-0 \
                libpixman-1-0 \
                libx11-xcb1 \
                libxcb1 \
                libxext6 \
                libxrender1 \
                libxtst6 \
                libgtk-3-0 \
                libgdk-pixbuf2.0-0 \
                libharfbuzz-icu0 \
                libicu66 \
                libegl1 \
                libopengl0 \
                libgles2 \
                libevent-2.1-7 \
                libjpeg8 \
                libpng16-16 \
                libwebp7 \
                libtiff6 \
                libffi7 \
                libwayland-client0 \
                libwayland-server0 \
                libxkbcommon-x11-0 \
                libqt5core5a \
                libqt5dbus5 \
                libqt5gui5 \
                libqt5widgets5 \
                libqt5printsupport5 \
                fonts-wqy-zenhei \
                fonts-wqy-microhei \
                fonts-noto-color-emoji
            echo "✅ 系统依赖安装完成"
        elif [ -f /etc/redhat-release ]; then
            echo "📋 检测到 RedHat/CentOS 系统"
            echo "正在安装系统依赖..."
            sudo yum install -y \
                nss \
                atk \
                atk-bridge2.0 \
                cups-libs \
                dbus-libs \
                libdrm \
                libxcomposite \
                libxdamage \
                libxfixes \
                libxrandr \
                alsa-lib \
                pango \
                cairo \
                glib2 \
                gtk3 \
                gdk-pixbuf2 \
                harfbuzz \
                libicu \
                mesa-libgbm \
                mesa-libEGL \
                mesa-libGL \
                fonts-wqy-zenhei \
                fonts-wqy-microhei
            echo "✅ 系统依赖安装完成"
        else
            echo "⚠️  未知的 Linux 发行版，请手动安装依赖"
            echo "参考：https://playwright.dev/docs/browsers#install-system-dependencies"
        fi
    fi
else
    echo "⚠️  没有 sudo 权限，无法安装系统依赖"
    echo ""
    echo "请手动安装系统依赖，或联系管理员执行："
    echo "  sudo npx playwright install-deps"
    echo ""
fi

echo ""
echo "============================================"
echo "✅ 安装完成！"
echo "============================================"
echo ""
echo "🎯 运行 E2E 测试："
echo "   cd $PROJECT_DIR"
echo "   npm run test:e2e"
echo ""
echo "🎯 运行所有测试："
echo "   npm run test:all"
echo ""
echo "🎯 只运行 Chromium 测试："
echo "   npx playwright test --project=chromium"
echo ""
echo "🎯 查看测试报告："
echo "   npx playwright show-report"
echo ""
echo "============================================"
