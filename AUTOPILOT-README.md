# 🚀 LightMark 自动化流水线 - 完全自动化版本

> **自动检查 → 自动开发 → 自动提交 → 自动构建 → 循环执行**

---

## 🎯 系统特点

### 完全自动化闭环

```
┌──────────────────────────────────────────────────────────────────┐
│                       自动化闭环流程                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ① 监控构建 ──► ② 构建完成/超时 ──► ③ 选择功能                  │
│       ▲                                       │                  │
│       │                                       ▼                  │
│       │                                 ④ AI 开发                 │
│       │                                       │                  │
│       │                                       ▼                  │
│       │                                 ⑤ 自动提交               │
│       │                                       │                  │
│       │                                       ▼                  │
│       └───────────── ⑥ GitHub 构建 ◄──────────┘                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 核心能力

✅ **智能等待** - 构建中等待，超过 10 分钟自动继续  
✅ **优先级调度** - 自动选择最高优先级的待开发功能  
✅ **AI 开发** - 调用 AI 代理自动编码和测试  
✅ **自动提交** - 开发完成后自动 git commit & push  
✅ **循环执行** - 形成完整闭环，无需人工干预  

---

## 🚀 快速开始

### 1. 启动自动化流水线

```bash
cd /home/node/.openclaw/workspace/lightmark
./autopilot.sh start
```

### 2. 查看状态

```bash
./autopilot.sh status
```

### 3. 查看实时日志

```bash
./autopilot.sh logs
```

---

## 📁 文件结构

```
lightmark/
├── autopilot.sh                 ⭐ 统一启动/停止脚本
├── pipeline-monitor.js          ⭐ 主监控器（检查构建 + 调度）
├── dev-agent.js                 ⭐ 自动开发代理（执行编码）
├── .pipeline-state.json         运行状态（自动生成）
├── .trigger-dev-agent           开发触发文件（临时）
├── .dev-complete                开发完成标记（临时）
├── .current-task.md             当前开发任务（临时）
├── FEATURES_PLAN.md             功能规划清单
├── AUTOPILOT-README.md          本文档
└── AUTOPILOT-QUICKREF.md        快速参考
```

**日志文件**:
- `/home/node/.openclaw/workspace/logs/lightmark-pipeline.log` - 监控器日志
- `/home/node/.openclaw/workspace/logs/lightmark-devagent.log` - 开发代理日志

---

## ⚙️ 工作流程详解

### 阶段 1: 监控构建

```javascript
// 每 2 分钟检查一次
检查 GitHub Actions 构建状态
    ├─ 构建进行中 → 等待 2 分钟后重试
    ├─ 构建成功 → 进入阶段 2
    ├─ 构建失败 → 记录错误，进入阶段 2
    └─ 超过 10 分钟 → 超时，进入阶段 2
```

### 阶段 2: 选择功能

```javascript
读取 FEATURES_PLAN.md
    ├─ 解析所有待开发功能
    ├─ 按优先级排序（P0 > P1 > P2 > P3）
    └─ 选择第一个未完成的功能
```

### 阶段 3: AI 开发

```javascript
创建开发任务文件
    ├─ 写入 .trigger-dev-agent
    ├─ 开发代理检测到任务
    ├─ 执行自动编码
    │   ├─ 分析现有代码
    │   ├─ 创建组件文件
    │   ├─ 编写单元测试
    │   └─ 更新功能规划文档
    └─ 写入 .dev-complete 标记完成
```

### 阶段 4: 自动提交

```javascript
Git 自动化操作
    ├─ git config 用户信息
    ├─ git add .
    ├─ git commit -m "feat: 添加 XXX 功能"
    └─ git push origin main
         └─► GitHub Actions 自动触发构建
```

### 阶段 5: 循环

```javascript
等待 2 分钟
    └─► 回到阶段 1
```

---

## 🔧 管理命令

### 启动

```bash
# 启动所有服务（监控器 + 开发代理）
./autopilot.sh start
```

输出示例：
```
ℹ️  启动 LightMark 自动化流水线...

ℹ️  检查现有进程...
ℹ️  停止监控器 (PID: 12345)...
ℹ️  停止开发代理 (PID: 12346)...

ℹ️  启动流水线监控器...
✅ 监控器启动成功 (PID: 33625)

ℹ️  启动自动开发代理...
✅ 开发代理启动成功 (PID: 33626)

✅ 自动化流水线启动完成！

ℹ️  工作流程:
  1️⃣  监控器每 2 分钟检查 GitHub Actions 构建状态
  2️⃣  构建中等待，超过 10 分钟或完成则继续
  3️⃣  自动选择高优先级待开发功能
  4️⃣  开发代理自动编码和测试
  5️⃣  自动提交代码到 GitHub
  6️⃣  GitHub Actions 自动触发新构建
  7️⃣  回到步骤 1，形成闭环

ℹ️  查看日志：tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

### 停止

```bash
./autopilot.sh stop
```

### 重启

```bash
./autopilot.sh restart
```

### 查看状态

```bash
./autopilot.sh status
```

输出示例：
```
══════════════════════════════════════════════
📊 LightMark 自动化流水线状态
══════════════════════════════════════════════
✅ 监控器运行中 (PID: 33625)
✅ 开发代理运行中 (PID: 33626)

ℹ️  当前状态:
{
  "lastCheck": "2026-03-31T05:30:00.000Z",
  "currentRunId": 23759307939,
  "currentStatus": "building",
  "currentFeature": null,
  "completedFeatures": [],
  "cycleCount": 0
}

══════════════════════════════════════════════
📁 日志文件:
   监控器：/home/node/.openclaw/workspace/logs/lightmark-pipeline.log
   开发代理：/home/node/.openclaw/workspace/logs/lightmark-devagent.log

🔧 管理命令:
   启动：./autopilot.sh start
   停止：./autopilot.sh stop
   重启：./autopilot.sh restart
   状态：./autopilot.sh status
   日志：tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
══════════════════════════════════════════════
```

### 查看日志

```bash
# 实时查看（Ctrl+C 退出）
./autopilot.sh logs

# 或
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

---

## ⚙️ 配置选项

### 修改检查间隔

编辑 `pipeline-monitor.js`，找到：

```javascript
checkInterval: 2 * 60 * 1000, // 2 分钟
```

修改为其他值（毫秒）：
- `1 * 60 * 1000` - 1 分钟
- `5 * 60 * 1000` - 5 分钟

### 修改构建超时时间

编辑 `pipeline-monitor.js`：

```javascript
buildTimeout: 10 * 60 * 1000, // 10 分钟
```

### 修改开发超时时间

编辑 `pipeline-monitor.js` 中的 `waitForDevelopment` 调用：

```javascript
const devComplete = await waitForDevelopment(feature, 30 * 60 * 1000); // 30 分钟
```

### 配置 Git 用户信息

编辑 `pipeline-monitor.js`：

```javascript
git: {
    userName: 'Your Name',
    userEmail: 'your@email.com',
    branch: 'main',
},
```

---

## 📊 日志示例

### 完整循环日志

```
══════════════════════════════════════════════
🔄 第 1 轮循环
══════════════════════════════════════════════
🔍 检查构建任务状态...
📊 构建运行中 #23759307939: in_progress (已运行 3 分钟)
⏳ 构建进行中，等待下次检查...

══════════════════════════════════════════════
🔄 第 2 轮循环
══════════════════════════════════════════════
🔍 检查构建任务状态...
📊 最近构建 #23759307939: completed (success)
✅ 构建成功！
🚀 开始开发新流程
🎯 下一个开发目标：内联预览（行内 Markdown 渲染） (P0)
🤖 启动 AI 开发代理：内联预览（行内 Markdown 渲染）
📝 任务文件已创建：/home/node/.openclaw/workspace/lightmark/.current-task.md
🔔 触发文件已创建：/home/node/.openclaw/workspace/lightmark/.trigger-dev-agent
⏳ 等待开发完成（超时：30 分钟）...
[DevAgent] 🎯 开始开发：内联预览（行内 Markdown 渲染）
[DevAgent] 📋 优先级：P0
[DevAgent] 📝 分析现有代码结构...
[DevAgent] 🔧 创建组件文件...
[DevAgent] 🧪 编写单元测试...
[DevAgent] 📄 更新功能规划文档...
[DevAgent] ✅ 开发完成！
✅ 开发完成！
📦 开始提交代码...
🔧 执行：git config user.name OpenClaw Bot
🔧 执行：git config user.email openclaw@localhost
🔧 执行：git add .
🔧 执行：git commit -m feat: 添加 内联预览（行内 Markdown 渲染）功能
✅ 提交成功：feat: 添加 内联预览（行内 Markdown 渲染）功能
🚀 推送到 GitHub...
🔧 执行：git push origin main
✅ 推送成功！GitHub Actions 将自动触发构建
✅ 代码已推送，等待 GitHub Actions 构建...

══════════════════════════════════════════════
🔄 第 3 轮循环
══════════════════════════════════════════════
🔍 检查构建任务状态...
📊 构建运行中 #23759308001: in_progress (已运行 0 分钟)
⏳ 构建进行中，等待下次检查...
```

---

## 🚨 故障排查

### 监控器未运行

```bash
# 检查进程
ps aux | grep pipeline-monitor

# 查看状态
./autopilot.sh status

# 重启
./autopilot.sh restart
```

### 开发代理未运行

```bash
# 检查进程
ps aux | grep dev-agent

# 查看日志
tail -50 /home/node/.openclaw/workspace/logs/lightmark-devagent.log

# 重启
./autopilot.sh restart
```

### Git 推送失败

```bash
# 检查 Git 配置
cd /home/node/.openclaw/workspace/lightmark
git config user.name
git config user.email

# 检查远程仓库
git remote -v

# 手动测试推送
git add .
git commit -m "test"
git push origin main
```

### GitHub API 错误

```bash
# 检查 Token
export GITHUB_TOKEN="your_token_here"

# 测试连接
curl -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/user
```

### 重置状态

```bash
# 删除状态文件
rm .pipeline-state.json
rm .trigger-dev-agent
rm .dev-complete

# 重启流水线
./autopilot.sh restart
```

---

## 📈 开发进度追踪

### 查看已完成功能

```bash
cat .pipeline-state.json | grep -A 20 "completedFeatures"
```

### 查看待开发功能

```bash
cat FEATURES_PLAN.md | grep -A 50 "待开发功能"
```

### 查看当前循环次数

```bash
cat .pipeline-state.json | grep "cycleCount"
```

---

## 🎯 实际运行建议

### 1. 首次启动前

```bash
# 检查 Git 配置
cd /home/node/.openclaw/workspace/lightmark
git remote -v

# 测试 GitHub API
export GITHUB_TOKEN="your_token_here"
curl -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/wy7980/lightmark/actions/runs?per_page=1
```

### 2. 启动后监控

```bash
# 新开一个终端，实时监控日志
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

### 3. 定期检查

```bash
# 每几小时检查一次状态
./autopilot.sh status

# 查看 completedFeatures 是否增加
cat .pipeline-state.json
```

---

## 📞 技术支持

| 文档 | 用途 |
|------|------|
| `AUTOPILOT-QUICKREF.md` | 快速参考卡片 |
| `FEATURES_PLAN.md` | 功能规划清单 |
| `PIPELINE-README.md` | 监控器详细文档 |

---

## 🎉 成功标志

当你看到以下日志时，说明系统正常运行：

```
✅ 监控器启动成功
✅ 开发代理启动成功
✅ 构建成功！
✅ 开发完成！
✅ 提交成功
✅ 推送成功！GitHub Actions 将自动触发构建
```

然后系统会自动进入下一个循环，持续开发新功能！

---

**完全自动化版本** · 2026-03-31 · 赛文加开发 🤖

**启动命令**: `./autopilot.sh start`
