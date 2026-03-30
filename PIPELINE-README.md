# 🚀 LightMark 自动化流水线

> **每 5 分钟自动检查构建状态，任务完成后自动继续开发下一个功能**

---

## 📋 目录

- [快速开始](#快速开始)
- [文件结构](#文件结构)
- [工作原理](#工作原理)
- [管理命令](#管理命令)
- [配置选项](#配置选项)
- [日志查看](#日志查看)
- [故障排查](#故障排查)

---

## 🎯 功能特性

✅ **自动监控** - 每 5 分钟检查 GitHub Actions 构建状态  
✅ **智能分析** - 构建完成后自动分析结果  
✅ **自动规划** - 根据功能规划自动选择下一个开发目标  
✅ **通知推送** - 支持兰信等渠道通知（需配置）  
✅ **状态持久化** - 自动保存运行状态，重启不丢失  

---

## 🚀 快速开始

### 1. 启动监控器

```bash
cd /home/node/.openclaw/workspace/lightmark
./pipeline-start.sh
```

### 2. 查看状态

```bash
./pipeline-start.sh status
```

### 3. 查看日志

```bash
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

### 4. 停止监控器

```bash
./pipeline-start.sh stop
```

---

## 📁 文件结构

```
lightmark/
├── pipeline-monitor.js          # 主监控器脚本 ⭐
├── pipeline-start.sh            # 启动/停止/重启脚本
├── pipeline-stop.sh             # 停止脚本
├── run-pipeline-cron.sh         # Cron 包装脚本（备用）
├── trigger-dev-task.js          # 开发任务触发器
├── install-pipeline.sh          # 一键安装脚本
├── PIPELINE-CRON-SETUP.md       # 详细配置文档
├── PIPELINE-README.md           # 本文档
├── .pipeline-state.json         # 运行状态（自动生成）
└── FEATURES_PLAN.md             # 功能规划（已存在）
```

**日志文件**:
- `/home/node/.openclaw/workspace/logs/lightmark-pipeline.log` - 主日志
- `/home/node/.openclaw/workspace/logs/lightmark-pipeline-cron.log` - Cron 日志

---

## ⚙️ 工作原理

```
┌─────────────────┐
│  启动监控器     │
│  (pipeline-     │
│   start.sh)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  每 5 分钟检查    │
│  GitHub Actions │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ 运行中 │──────┐
    └────────┘     │ 继续等待
         │         │
         ▼         │
    ┌────────┐     │
    │ 已完成 │─────┘
    └───┬────┘
        │
        ▼
   ┌────┴─────┐
   │ 成功？   │
   └─┬─────┬──┘
     │     │
    是     否
     │     │
     ▼     ▼
┌────────┐ ┌────────┐
│ 解析   │ │ 发送   │
│ 功能   │ │ 失败   │
│ 规划   │ │ 通知   │
└───┬────┘ └────────┘
    │
    ▼
┌──────────┐
│ 选择下   │
│ 一个功能 │
└───┬──────┘
    │
    ▼
┌──────────┐
│ 记录状   │
│ 态并通知 │
└──────────┘
```

---

## 🔧 管理命令

### 启动

```bash
# 启动监控器
./pipeline-start.sh

# 重启监控器
./pipeline-start.sh restart

# 查看状态
./pipeline-start.sh status
```

### 停止

```bash
# 停止监控器
./pipeline-start.sh stop

# 或者
./pipeline-stop.sh
```

### 日志

```bash
# 实时查看日志
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log

# 查看最新 50 行
tail -50 /home/node/.openclaw/workspace/logs/lightmark-pipeline.log

# 搜索特定内容
grep "下一个开发目标" /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

### 进程管理

```bash
# 查看进程
ps aux | grep pipeline-monitor

# 查看 PID
cat /home/node/.openclaw/workspace/logs/lightmark-pipeline.pid

# 手动停止
kill $(cat /home/node/.openclaw/workspace/logs/lightmark-pipeline.pid)
```

---

## ⚙️ 配置选项

### 1. GitHub Token（推荐）

无 Token 时 API 调用有限制（60 次/小时）。

```bash
# 临时设置
export GITHUB_TOKEN="your_token_here"

# 永久设置
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

### 2. 修改检查间隔

编辑 `pipeline-monitor.js`：

```javascript
const CONFIG = {
    checkInterval: 5 * 60 * 1000, // 改为其他值（毫秒）
};
```

常用间隔：
- `1 * 60 * 1000` - 1 分钟
- `10 * 60 * 1000` - 10 分钟
- `30 * 60 * 1000` - 30 分钟

### 3. 兰信通知（可选）

编辑 `pipeline-monitor.js`，配置 webhook：

```javascript
lanxin: {
    enabled: true,
    webhook: 'https://your-lanxin-webhook-url',
},
```

---

## 📊 日志示例

```
[2026-03-30T21:16:24.574Z] 🚀 LightMark 自动化流水线监控器启动
[2026-03-30T21:16:24.575Z] 📋 检查间隔：5 分钟
[2026-03-30T21:16:24.576Z] 🔍 检查构建任务状态...
[2026-03-30T21:16:25.465Z] 📊 当前运行 #23759307939: completed (success)
[2026-03-30T21:16:25.466Z] ✅ 构建成功！
[2026-03-30T21:16:25.467Z] 📝 通知：✅ LightMark 构建 #23759307939 成功
[2026-03-30T21:16:25.468Z] 📋 解析到 37 个功能
[2026-03-30T21:16:25.469Z] 🎯 下一个开发目标：内联预览（行内 Markdown 渲染） (P?)
[2026-03-30T21:16:25.469Z] 📝 通知：🎯 下一步：开发 内联预览（行内 Markdown 渲染）
```

---

## 🚨 故障排查

### 监控器未运行

```bash
# 检查进程
ps aux | grep pipeline-monitor

# 手动启动
./pipeline-start.sh

# 查看错误日志
tail -50 /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

### GitHub API 错误

```bash
# 检查网络连接
curl -I https://api.github.com

# 检查 Token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### 权限问题

```bash
# 确保脚本可执行
chmod +x *.sh *.js

# 检查文件所有权
ls -la
```

### 重置状态

```bash
# 删除状态文件（重新从头开始）
rm .pipeline-state.json

# 重启监控器
./pipeline-start.sh restart
```

---

## 📈 当前功能规划

根据 `FEATURES_PLAN.md`，待开发功能：

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 内联预览 | Typora 风格所见即所得 |
| P0 | 焦点模式 | 当前段落高亮 |
| P1 | 代码折叠 | 折叠/展开代码块 |
| P2 | 文件树 | 文件浏览和管理 |
| P3 | 全文搜索 | 搜索和替换 |

---

## 📞 技术支持

- **配置文档**: `PIPELINE-CRON-SETUP.md`
- **功能规划**: `FEATURES_PLAN.md`
- **项目 README**: `README.md`
- **日志目录**: `/home/node/.openclaw/workspace/logs/`

---

## 🎉 成功标志

当你看到以下日志时，说明系统正常运行：

```
✅ 监控器启动成功！
📋 检查间隔：5 分钟
🔍 检查构建任务状态...
📊 当前运行 #XXXXXX: in_progress (或 completed)
```

---

**创建时间**: 2026-03-31  
**项目地址**: https://github.com/wy7980/lightmark  
**自动化系统**: OpenClaw Pipeline Monitor v1.0
