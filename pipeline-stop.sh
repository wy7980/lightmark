#!/bin/bash

# LightMark 流水线监控器 - 停止脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/home/node/.openclaw/workspace/logs"
PID_FILE="${LOG_DIR}/lightmark-pipeline.pid"

echo "🛑 停止 LightMark 自动化流水线监控器..."

if [ -f "${PID_FILE}" ]; then
    PID=$(cat "${PID_FILE}")
    if kill -0 "${PID}" 2>/dev/null; then
        kill "${PID}"
        sleep 1
        
        if kill -0 "${PID}" 2>/dev/null; then
            echo "⚠️  进程未响应，强制终止..."
            kill -9 "${PID}"
        fi
        
        rm -f "${PID_FILE}"
        echo "✅ 监控器已停止 (PID: ${PID})"
    else
        echo "ℹ️  进程未运行，清理 PID 文件"
        rm -f "${PID_FILE}"
    fi
else
    # 尝试通过进程名查找
    PID=$(pgrep -f "pipeline-monitor.js")
    if [ -n "${PID}" ]; then
        kill "${PID}" 2>/dev/null
        sleep 1
        kill -9 "${PID}" 2>/dev/null
        echo "✅ 监控器已停止 (PID: ${PID})"
    else
        echo "ℹ️  未找到运行中的监控器进程"
    fi
fi

echo ""
echo "📄 日志文件位置：${LOG_DIR}/lightmark-pipeline.log"
echo "💡 提示：使用 'tail -f ${LOG_DIR}/lightmark-pipeline.log' 查看历史日志"
