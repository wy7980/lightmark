#!/bin/bash

# LightMark 自动化流水线 - 一键安装脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/home/node/.openclaw/workspace/logs"
CRON_FILE="/home/node/.openclaw/workspace/lightmark/run-pipeline-cron.sh"

echo "🚀 LightMark 自动化流水线安装程序"
echo "===================================="
echo ""

# 1. 确保日志目录存在
echo "📁 创建日志目录..."
mkdir -p "${LOG_DIR}"

# 2. 设置脚本权限
echo "🔐 设置脚本权限..."
chmod +x "${SCRIPT_DIR}/pipeline-monitor.js"
chmod +x "${SCRIPT_DIR}/run-pipeline-cron.sh"
chmod +x "${SCRIPT_DIR}/trigger-dev-task.js"

# 3. 检查 GitHub Token
echo ""
echo "🔑 GitHub Token 配置"
echo "-------------------"
if [ -n "${GITHUB_TOKEN}" ]; then
    echo "✅ GITHUB_TOKEN 已设置（推荐）"
else
    echo "⚠️  GITHUB_TOKEN 未设置"
    echo "   建议设置以避免 API 速率限制："
    echo "   export GITHUB_TOKEN='your_token_here'"
    echo ""
    read -p "是否现在设置？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "输入 GitHub Token: " -s TOKEN
        echo ""
        export GITHUB_TOKEN="${TOKEN}"
        echo "export GITHUB_TOKEN='${TOKEN}'" >> ~/.bashrc
        echo "✅ Token 已保存"
    fi
fi

# 4. 配置 Cron
echo ""
echo "⏰ 配置定时任务"
echo "--------------"

# 检查是否已存在
if crontab -l 2>/dev/null | grep -q "lightmark-pipeline"; then
    echo "⚠️  检测到已存在的 LightMark cron 任务"
    read -p "是否重新配置？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 移除旧的
        crontab -l 2>/dev/null | grep -v "lightmark-pipeline" | crontab -
        echo "✅ 已移除旧的 cron 任务"
    else
        echo "ℹ️  跳过 cron 配置"
        SKIP_CRON=true
    fi
fi

if [ "${SKIP_CRON}" != "true" ]; then
    # 添加新的 cron 任务
    (crontab -l 2>/dev/null; echo "*/5 * * * * ${CRON_FILE}") | crontab -
    echo "✅ 已添加 cron 任务（每 5 分钟检查一次）"
fi

# 5. 测试运行
echo ""
echo "🧪 测试运行..."
cd "${SCRIPT_DIR}"
timeout 5 node pipeline-monitor.js || true

# 6. 显示状态
echo ""
echo "📊 安装完成！"
echo "=============="
echo ""
echo "✅ 文件已就绪:"
echo "   - pipeline-monitor.js (主监控器)"
echo "   - run-pipeline-cron.sh (Cron 包装)"
echo "   - trigger-dev-task.js (开发触发器)"
echo "   - PIPELINE-CRON-SETUP.md (配置文档)"
echo ""
echo "✅ Cron 任务已配置:"
crontab -l | grep lightmark || echo "   (未配置 cron)"
echo ""
echo "📁 日志文件:"
echo "   - ${LOG_DIR}/lightmark-pipeline.log"
echo "   - ${LOG_DIR}/lightmark-pipeline-cron.log"
echo ""
echo "🔧 管理命令:"
echo "   # 查看状态"
echo "   tail -f ${LOG_DIR}/lightmark-pipeline.log"
echo ""
echo "   # 手动运行一次"
echo "   node ${SCRIPT_DIR}/pipeline-monitor.js"
echo ""
echo "   # 停止监控器"
echo "   pkill -f pipeline-monitor.js"
echo ""
echo "   # 查看 cron"
echo "   crontab -l | grep lightmark"
echo ""
echo "🎉 安装完成！监控器将每 5 分钟检查一次构建状态。"
echo ""
