#!/bin/bash

# LightMark 真正的全自动开发流水线 - 启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/home/node/.openclaw/workspace/logs"
MONITOR_PID_FILE="${LOG_DIR}/autodev-monitor.pid"
AIDEV_PID_FILE="${LOG_DIR}/ai-developer.pid"

mkdir -p "${LOG_DIR}"

print_status() { echo -e "\033[0;34mℹ️  $1\033[0m"; }
print_success() { echo -e "\033[0;32m✅ $1\033[0m"; }
print_error() { echo -e "\033[0;31m❌ $1\033[0m"; }

stop_existing() {
    print_status "停止现有进程..."
    
    if [ -f "${MONITOR_PID_FILE}" ]; then
        PID=$(cat "${MONITOR_PID_FILE}")
        kill "${PID}" 2>/dev/null && print_status "停止监控器 (PID: ${PID})"
        rm -f "${MONITOR_PID_FILE}"
    fi
    
    if [ -f "${AIDEV_PID_FILE}" ]; then
        PID=$(cat "${AIDEV_PID_FILE}")
        kill "${PID}" 2>/dev/null && print_status "停止 AI 开发者 (PID: ${PID})"
        rm -f "${AIDEV_PID_FILE}"
    fi
}

start_monitor() {
    print_status "启动全自动监控器..."
    
    cd "${SCRIPT_DIR}"
    nohup node autodev-monitor.js > "${LOG_DIR}/autodev-monitor.log" 2>&1 &
    PID=$!
    echo "${PID}" > "${MONITOR_PID_FILE}"
    
    sleep 2
    
    if kill -0 "${PID}" 2>/dev/null; then
        print_success "监控器启动成功 (PID: ${PID})"
        return 0
    else
        print_error "监控器启动失败"
        return 1
    fi
}

start_aidev() {
    print_status "启动 AI 开发者..."
    
    cd "${SCRIPT_DIR}"
    nohup node ai-developer.js > "${LOG_DIR}/ai-developer.log" 2>&1 &
    PID=$!
    echo "${PID}" > "${AIDEV_PID_FILE}"
    
    sleep 2
    
    if kill -0 "${PID}" 2>/dev/null; then
        print_success "AI 开发者启动成功 (PID: ${PID})"
        return 0
    else
        print_error "AI 开发者启动失败"
        return 1
    fi
}

show_status() {
    echo ""
    echo "══════════════════════════════════════════════"
    echo "📊 LightMark 全自动开发流水线状态"
    echo "══════════════════════════════════════════════"
    
    if [ -f "${MONITOR_PID_FILE}" ]; then
        PID=$(cat "${MONITOR_PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            print_success "监控器运行中 (PID: ${PID})"
        else
            print_error "监控器未运行"
        fi
    else
        print_error "监控器未启动"
    fi
    
    if [ -f "${AIDEV_PID_FILE}" ]; then
        PID=$(cat "${AIDEV_PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            print_success "AI 开发者运行中 (PID: ${PID})"
        else
            print_error "AI 开发者未运行"
        fi
    else
        print_error "AI 开发者未启动"
    fi
    
    echo ""
    echo "📁 日志文件:"
    echo "   监控器：${LOG_DIR}/autodev-monitor.log"
    echo "   AI 开发者：${LOG_DIR}/ai-developer.log"
    echo ""
    echo "🔧 管理命令:"
    echo "   $0 start     - 启动"
    echo "   $0 stop      - 停止"
    echo "   $0 restart   - 重启"
    echo "   $0 status    - 状态"
    echo "══════════════════════════════════════════════"
}

case "$1" in
    start)
        print_status "启动 LightMark 真正的全自动开发流水线..."
        stop_existing
        sleep 1
        start_monitor
        start_aidev
        print_success "✅ 全自动开发流水线启动完成！"
        echo ""
        print_status "工作流程:"
        echo "  1️⃣  监控器每 2 分钟检查 GitHub Actions 构建"
        echo "  2️⃣  构建完成/超时后选择下一个功能"
        echo "  3️⃣  AI 开发者自动编写代码"
        echo "  4️⃣  自动提交推送到 GitHub"
        echo "  5️⃣  GitHub Actions 自动触发新构建"
        echo "  6️⃣  循环继续"
        echo ""
        print_status "查看日志：tail -f ${LOG_DIR}/autodev-monitor.log"
        ;;
    
    stop)
        stop_existing
        print_success "✅ 已停止所有进程"
        ;;
    
    restart)
        print_status "重启 LightMark 全自动开发流水线..."
        stop_existing
        sleep 2
        start_monitor
        start_aidev
        print_success "✅ 重启完成"
        ;;
    
    status)
        show_status
        ;;
    
    *)
        echo "LightMark 全自动开发流水线管理脚本"
        echo ""
        echo "用法：$0 {start|stop|restart|status}"
        ;;
esac
