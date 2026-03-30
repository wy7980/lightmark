# 🚀 LightMark 自动化流水线配置

## 🎯 功能概述

自动化监控 GitHub Actions 构建任务，每 5 分钟检查一次状态，任务完成后自动规划并触发下一个开发任务。

---

## 📁 文件结构

```
/home/node/.openclaw/workspace/lightmark/
├── pipeline-monitor.js          # 主监控器脚本
├── run-pipeline-cron.sh         # Cron 包装脚本
├── .pipeline-state.json         # 运行状态文件（自动生成）
├── FEATURES_PLAN.md             # 功能规划（已存在）
└── PIPELINE-CRON-SETUP.md       # 本配置文档
```

日志文件位置：
- `/home/node/.openclaw/workspace/logs/lightmark-pipeline.log` - 主日志
- `/home/node/.openclaw/workspace/logs/lightmark-pipeline-cron.log` - Cron 日志

---

## ⚙️ 配置方案

### 方案一：系统 Cron（推荐）

#### 1. 编辑 Crontab

```bash
crontab -e
```

#### 2. 添加定时任务

```bash
# LightMark 自动化流水线 - 每 5 分钟检查一次
*/5 * * * * /home/node/.openclaw/workspace/lightmark/run-pipeline-cron.sh
```

#### 3. 验证 Cron

```bash
# 查看已配置的 cron 任务
crontab -l

# 查看 cron 日志
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline-cron.log
```

---

### 方案二：Node.js 后台进程

#### 1. 直接启动监控器

```bash
cd /home/node/.openclaw/workspace/lightmark
node pipeline-monitor.js
```

#### 2. 后台运行（使用 nohup）

```bash
nohup node /home/node/.openclaw/workspace/lightmark/pipeline-monitor.js > /home/node/.openclaw/workspace/logs/lightmark-pipeline.log 2>&1 &
```

#### 3. 查看进程

```bash
# 查看运行状态
ps aux | grep pipeline-monitor

# 查看 PID
cat /home/node/.openclaw/workspace/logs/lightmark-pipeline.pid
```

#### 4. 停止监控器

```bash
# 方法 1：优雅停止
kill $(cat /home/node/.openclaw/workspace/logs/lightmark-pipeline.pid)

# 方法 2：强制停止
pkill -f pipeline-monitor.js
```

---

### 方案三：使用 OpenClaw Subagent（需要 Gateway 配对）

当 Gateway 配对完成后，可以使用 OpenClaw 的 cron 系统：

```bash
openclaw cron add \
  --name "lightmark-pipeline" \
  --description "LightMark 自动化流水线监控" \
  --cron "*/5 * * * *" \
  --tz "Asia/Shanghai" \
  --system-event "node /home/node/.openclaw/workspace/lightmark/pipeline-monitor.js" \
  --session "main"
```

---

## 🔧 配置选项

### 1. GitHub Token（可选但推荐）

无 Token 时 API 调用有速率限制（60 次/小时）。

**获取 Token**:
1. 访问 https://github.com/settings/tokens
2. 创建新 Token（无需特殊权限，只读即可）
3. 设置环境变量：

```bash
# 临时设置
export GITHUB_TOKEN="your_token_here"

# 永久设置（添加到 ~/.bashrc 或 ~/.profile）
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

### 2. 修改检查间隔

编辑 `pipeline-monitor.js`，找到：

```javascript
const CONFIG = {
    checkInterval: 5 * 60 * 1000, // 5 分钟
};
```

修改为其他值：
- `1 * 60 * 1000` - 1 分钟
- `10 * 60 * 1000` - 10 分钟
- `30 * 60 * 1000` - 30 分钟

### 3. 兰信通知（可选）

编辑 `pipeline-monitor.js`，配置兰信 webhook：

```javascript
lanxin: {
    enabled: true,
    webhook: 'https://your-lanxin-webhook-url',
},
```

---

## 📊 状态文件

自动生成的 `.pipeline-state.json` 包含：

```json
{
  "lastCheck": "2026-03-31T05:30:00.000Z",
  "currentRunId": 12345678,
  "currentStatus": "running",
  "completedFeatures": ["大纲导航", "实时预览模式"],
  "pendingFeatures": ["导出功能", "文件管理"],
  "lastCompletedAt": "2026-03-31T01:48:00.000Z"
}
```

---

## 🔍 管理命令

### 查看状态

```bash
# 查看最新日志
tail -50 /home/node/.openclaw/workspace/logs/lightmark-pipeline.log

# 查看状态文件
cat /home/node/.openclaw/workspace/lightmark/.pipeline-state.json

# 检查进程
ps aux | grep pipeline-monitor
```

### 手动测试

```bash
# 立即运行一次检查
node /home/node/.openclaw/workspace/lightmark/pipeline-monitor.js

# 测试 Cron 脚本
/home/node/.openclaw/workspace/lightmark/run-pipeline-cron.sh
```

### 重置状态

```bash
# 删除状态文件（重新从头开始）
rm /home/node/.openclaw/workspace/lightmark/.pipeline-state.json

# 清空日志
> /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

---

## 📋 工作流程

```
┌─────────────────┐
│  启动监控器     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  检查最新构建   │◄──────┐
└────────┬────────┘       │
         │                │
         ▼                │
    ┌────────┐       ┌────┴─────┐
    │ 运行中 │──────►│  等待    │
    └────────┘       └──────────┘
         │
         ▼
    ┌────────┐
    │ 已完成 │
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
│ 分析   │ │ 发送   │
│ 下一项 │ │ 失败   │
│ 功能   │ │ 通知   │
└───┬────┘ └────────┘
    │
    ▼
┌──────────┐
│ 触发新   │
│ 构建任务 │
└──────────┘
```

---

## 🚨 故障排查

### 1. 监控器未运行

```bash
# 检查进程
ps aux | grep pipeline-monitor

# 如果没有，手动启动
nohup node /home/node/.openclaw/workspace/lightmark/pipeline-monitor.js > /home/node/.openclaw/workspace/logs/lightmark-pipeline.log 2>&1 &
```

### 2. GitHub API 错误

```bash
# 检查网络连接
curl -I https://api.github.com

# 检查 Token（如果设置了）
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### 3. Cron 未执行

```bash
# 检查 cron 服务状态
systemctl status cron

# 查看 cron 日志
grep CRON /var/log/syslog | tail -20

# 验证 crontab 语法
crontab -l | grep lightmark
```

### 4. 权限问题

```bash
# 确保脚本可执行
chmod +x /home/node/.openclaw/workspace/lightmark/*.sh
chmod +x /home/node/.openclaw/workspace/lightmark/*.js

# 检查文件所有权
ls -la /home/node/.openclaw/workspace/lightmark/
```

---

## 📈 日志示例

```
[2026-03-31T05:30:00.000Z] 🚀 LightMark 自动化流水线监控器启动
[2026-03-31T05:30:00.000Z] 📋 检查间隔：5 分钟
[2026-03-31T05:30:01.000Z] 🔍 检查构建任务状态...
[2026-03-31T05:30:02.000Z] 📊 当前运行 #12345678: in_progress
[2026-03-31T05:30:02.000Z] 🚀 构建任务正在运行中...
[2026-03-31T05:35:00.000Z] 🔍 检查构建任务状态...
[2026-03-31T05:35:01.000Z] 📊 当前运行 #12345678: completed (success)
[2026-03-31T05:35:01.000Z] ✅ 构建成功！
[2026-03-31T05:35:01.000Z] 🎯 下一个开发目标：导出功能 (P3)
```

---

## 🎯 当前功能规划

根据 `FEATURES_PLAN.md`，待开发功能：

| 优先级 | 功能 | 预计工时 |
|--------|------|---------|
| P3 | 导出功能（PDF/HTML/Word） | 2h |
| P3 | 文件管理（文件树/最近文件） | 1h |
| P3 | 搜索替换（全文搜索/正则） | 1h |

---

## 📞 技术支持

- 监控器源码：`pipeline-monitor.js`
- Cron 脚本：`run-pipeline-cron.sh`
- 功能规划：`FEATURES_PLAN.md`
- 日志目录：`/home/node/.openclaw/workspace/logs/`

---

**配置时间**: 2026-03-31  
**项目地址**: https://github.com/wy7980/lightmark  
**自动化系统**: OpenClaw Pipeline Monitor v1.0
