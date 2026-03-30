#!/bin/bash

# LightMark 流水线监控器 - 启动/停止/重启脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/home/node/.openclaw/workspace/logs"
LOG_FILE="${LOG_DIR}/lightmark-pipeline.log"
PID_FILE="${LOG_DIR}/lightmark-pipeline.pid"

# 确保日志目录存在
mkdir -p "${LOG_DIR}"

# 处理参数
case "$1" in
    stop)
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
        exit 0
        ;;
    
    restart)
        echo "🔄 重启 LightMark 自动化流水线监控器..."
        "$0" stop
        sleep 2
        ;;
    
    status)
        if [ -f "${PID_FILE}" ]; then
            PID=$(cat "${PID_FILE}")
            if kill -0 "${PID}" 2>/dev/null; then
                echo "✅ 监控器运行中 (PID: ${PID})"
                echo ""
                echo "📊 最新日志:"
                tail -5 "${LOG_FILE}"
                exit 0
            fi
        fi
        echo "❌ 监控器未运行"
        exit 1
        ;;
    
    *)
        # 默认启动
        ;;
esac

echo "🚀 启动 LightMark 自动化流水线监控器..."

# 检查是否已经在运行
if [ -f "${PID_FILE}" ]; then
    OLD_PID=$(cat "${PID_FILE}")
    if kill -0 "${OLD_PID}" 2>/dev/null; then
        echo "⚠️  监控器已在运行 (PID: ${OLD_PID})"
        echo "💡 提示：使用 '$0 restart' 重启"
        exit 1
    else
        echo "ℹ️  检测到 stale PID 文件，清理中..."
        rm -f "${PID_FILE}"
    fi
fi

# 启动监控器
cd "${SCRIPT_DIR}"
nohup node pipeline-monitor.js > "${LOG_FILE}" 2>&1 &
NEW_PID=$!

# 记录 PID
echo "${NEW_PID}" > "${PID_FILE}"

# 等待一小段时间确认进程启动
sleep 2

if kill -0 "${NEW_PID}" 2>/dev/null; then
    echo "✅ 监控器启动成功！"
    echo ""
    echo "📊 进程信息:"
    echo "   PID: ${NEW_PID}"
    echo "   日志：${LOG_FILE}"
    echo ""
    echo "🔧 管理命令:"
    echo "   # 查看实时日志"
    echo "   tail -f ${LOG_FILE}"
    echo ""
    echo "   # 查看进程状态"
    echo "   ps aux | grep pipeline-monitor"
    echo ""
    echo "   # 停止监控器"
    echo "   ${SCRIPT_DIR}/pipeline-start.sh stop"
    echo ""
    echo "   # 重启监控器"
    echo "   ${SCRIPT_DIR}/pipeline-start.sh restart"
    echo ""
else
    echo "❌ 监控器启动失败"
    echo "📄 查看日志：${LOG_FILE}"
    rm -f "${PID_FILE}"
    exit 1
fi
