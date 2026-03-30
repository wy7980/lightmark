#!/bin/bash

# LightMark 流水线监控器 - Cron 包装脚本
# 用于系统 cron 定时调用

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/home/node/.openclaw/workspace/logs"
LOG_FILE="${LOG_DIR}/lightmark-pipeline-cron.log"
PID_FILE="${LOG_DIR}/lightmark-pipeline.pid"

# 确保日志目录存在
mkdir -p "${LOG_DIR}"

# 记录启动
echo "[$(date -Iseconds)] Cron 触发检查" >> "${LOG_FILE}"

# 检查是否已经在运行（避免重复）
if [ -f "${PID_FILE}" ]; then
    OLD_PID=$(cat "${PID_FILE}")
    if kill -0 "${OLD_PID}" 2>/dev/null; then
        echo "[$(date -Iseconds)] 监控器已在运行 (PID: ${OLD_PID})，跳过本次检查" >> "${LOG_FILE}"
        exit 0
    else
        echo "[$(date -Iseconds)] 检测到 stale PID 文件，清理中..." >> "${LOG_FILE}"
        rm -f "${PID_FILE}"
    fi
fi

# 运行监控器（单次检查模式）
cd "${SCRIPT_DIR}"
node pipeline-monitor.js >> "${LOG_FILE}" 2>&1 &
NEW_PID=$!

# 记录 PID
echo "${NEW_PID}" > "${PID_FILE}"

# 等待一小段时间确认进程启动
sleep 2

if kill -0 "${NEW_PID}" 2>/dev/null; then
    echo "[$(date -Iseconds)] 监控器启动成功 (PID: ${NEW_PID})" >> "${LOG_FILE}"
else
    echo "[$(date -Iseconds)] 监控器启动失败" >> "${LOG_FILE}"
    rm -f "${PID_FILE}"
    exit 1
fi

exit 0
