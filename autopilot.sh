#!/bin/bash

# LightMark 自动化流水线 - 完全自动化版本启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/home/node/.openclaw/workspace/logs"
MONITOR_PID_FILE="${LOG_DIR}/lightmark-monitor.pid"
DEVAGENT_PID_FILE="${LOG_DIR}/lightmark-devagent.pid"
MONITOR_LOG="${LOG_DIR}/lightmark-pipeline.log"
DEVAGENT_LOG="${LOG_DIR}/lightmark-devagent.log"

# 确保日志目录存在
mkdir -p "${LOG_DIR}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 停止现有进程
stop_existing() {
    print_status "检查现有进程..."
    
    if [ -f "${MONITOR_PID_FILE}" ]; then
        PID=$(cat "${MONITOR_PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            print_status "停止监控器 (PID: ${PID})..."
            kill "${PID}" 2>/dev/null
            sleep 1
        fi
        rm -f "${MONITOR_PID_FILE}"
    fi
    
    if [ -f "${DEVAGENT_PID_FILE}" ]; then
        PID=$(cat "${DEVAGENT_PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            print_status "停止开发代理 (PID: ${PID})..."
            kill "${PID}" 2>/dev/null
            sleep 1
        fi
        rm -f "${DEVAGENT_PID_FILE}"
    fi
}

# 启动监控器
start_monitor() {
    print_status "启动流水线监控器..."
    
    cd "${SCRIPT_DIR}"
    nohup node pipeline-monitor.js > "${MONITOR_LOG}" 2>&1 &
    MONITOR_PID=$!
    
    echo "${MONITOR_PID}" > "${MONITOR_PID_FILE}"
    
    sleep 2
    
    if kill -0 "${MONITOR_PID}" 2>/dev/null; then
        print_success "监控器启动成功 (PID: ${MONITOR_PID})"
        return 0
    else
        print_error "监控器启动失败"
        return 1
    fi
}

# 启动开发代理
start_devagent() {
    print_status "启动自动开发代理..."
    
    cd "${SCRIPT_DIR}"
    nohup node dev-agent.js > "${DEVAGENT_LOG}" 2>&1 &
    DEVAGENT_PID=$!
    
    echo "${DEVAGENT_PID}" > "${DEVAGENT_PID_FILE}"
    
    sleep 2
    
    if kill -0 "${DEVAGENT_PID}" 2>/dev/null; then
        print_success "开发代理启动成功 (PID: ${DEVAGENT_PID})"
        return 0
    else
        print_error "开发代理启动失败"
        return 1
    fi
}

# 显示状态
show_status() {
    echo ""
    echo "══════════════════════════════════════════════"
    echo "📊 LightMark 自动化流水线状态"
    echo "══════════════════════════════════════════════"
    
    # 监控器状态
    if [ -f "${MONITOR_PID_FILE}" ]; then
        PID=$(cat "${MONITOR_PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            print_success "监控器运行中 (PID: ${PID})"
        else
            print_error "监控器未运行 (stale PID)"
        fi
    else
        print_warning "监控器未启动"
    fi
    
    # 开发代理状态
    if [ -f "${DEVAGENT_PID_FILE}" ]; then
        PID=$(cat "${DEVAGENT_PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            print_success "开发代理运行中 (PID: ${PID})"
        else
            print_error "开发代理未运行 (stale PID)"
        fi
    else
        print_warning "开发代理未启动"
    fi
    
    # 状态文件
    if [ -f "${SCRIPT_DIR}/.pipeline-state.json" ]; then
        echo ""
        print_status "当前状态:"
        cat "${SCRIPT_DIR}/.pipeline-state.json" | head -20
    fi
    
    echo ""
    echo "══════════════════════════════════════════════"
    echo "📁 日志文件:"
    echo "   监控器：${MONITOR_LOG}"
    echo "   开发代理：${DEVAGENT_LOG}"
    echo ""
    echo "🔧 管理命令:"
    echo "   启动：$0 start"
    echo "   停止：$0 stop"
    echo "   重启：$0 restart"
    echo "   状态：$0 status"
    echo "   日志：tail -f ${MONITOR_LOG}"
    echo "══════════════════════════════════════════════"
}

# 主逻辑
case "$1" in
    start)
        print_status "启动 LightMark 自动化流水线..."
        echo ""
        
        stop_existing
        sleep 1
        
        start_monitor
        start_devagent
        
        echo ""
        print_success "✅ 自动化流水线启动完成！"
        echo ""
        print_status "工作流程:"
        echo "  1️⃣  监控器每 2 分钟检查 GitHub Actions 构建状态"
        echo "  2️⃣  构建中等待，超过 10 分钟或完成则继续"
        echo "  3️⃣  自动选择高优先级待开发功能"
        echo "  4️⃣  开发代理自动编码和测试"
        echo "  5️⃣  自动提交代码到 GitHub"
        echo "  6️⃣  GitHub Actions 自动触发新构建"
        echo "  7️⃣  回到步骤 1，形成闭环"
        echo ""
        print_status "查看日志：tail -f ${MONITOR_LOG}"
        ;;
    
    stop)
        print_status "停止 LightMark 自动化流水线..."
        echo ""
        stop_existing
        print_success "✅ 已停止所有进程"
        ;;
    
    restart)
        print_status "重启 LightMark 自动化流水线..."
        echo ""
        stop_existing
        sleep 2
        start_monitor
        start_devagent
        print_success "✅ 重启完成"
        ;;
    
    status)
        show_status
        ;;
    
    logs)
        echo "📊 实时监控日志 (Ctrl+C 退出):"
        tail -f "${MONITOR_LOG}"
        ;;
    
    *)
        echo "LightMark 自动化流水线管理脚本"
        echo ""
        echo "用法：$0 {start|stop|restart|status|logs}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动监控器和开发代理"
        echo "  stop    - 停止所有进程"
        echo "  restart - 重启所有进程"
        echo "  status  - 查看运行状态"
        echo "  logs    - 实时查看日志"
        echo ""
        echo "示例:"
        echo "  $0 start     # 启动流水线"
        echo "  $0 status    # 查看状态"
        echo "  $0 logs      # 查看实时日志"
        ;;
esac
