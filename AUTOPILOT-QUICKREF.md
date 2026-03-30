# ⚡ LightMark 自动化流水线 - 快速参考

## 🚀 一键启动（完全自动化）

```bash
cd /home/node/.openclaw/workspace/lightmark
./autopilot.sh start
```

## 🛑 停止

```bash
./autopilot.sh stop
```

## 🔄 重启

```bash
./autopilot.sh restart
```

## 📊 查看状态

```bash
./autopilot.sh status
```

## 📋 查看日志

```bash
# 实时查看
./autopilot.sh logs

# 或
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

---

## 🔄 自动化闭环流程

```
┌─────────────────────────────────────────────────────────────┐
│                    完全自动化闭环                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ① 检查构建 ──► 构建中？ ──是──► 等待（2 分钟后重试）       │
│     │                │                                     │
│     │               否                                      │
│     │                │                                     │
│     ▼                ▼                                     │
│  超时/完成 ◄──超过 10 分钟？──是                             │
│     │                                                       │
│     ▼                                                       │
│  ② 选择下一个高优先级功能                                    │
│     │                                                       │
│     ▼                                                       │
│  ③ 触发 AI 开发代理                                          │
│     │                                                       │
│     ▼                                                       │
│  ④ 等待开发完成（编码 + 测试）                               │
│     │                                                       │
│     ▼                                                       │
│  ⑤ 自动提交代码到 GitHub                                     │
│     │                                                       │
│     ▼                                                       │
│  ⑥ 推送代码 ──► GitHub Actions 自动触发构建                 │
│     │                                                       │
│     └───────────────► 回到①                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 核心配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 检查间隔 | 2 分钟 | 检查构建状态的频率 |
| 构建超时 | 10 分钟 | 超过此时间不再等待 |
| 开发超时 | 30 分钟 | 开发任务最大时长 |
| Git 用户 | OpenClaw Bot | 自动提交的作者 |

---

## 📁 关键文件

| 文件 | 说明 |
|------|------|
| `pipeline-monitor.js` | 主监控器（检查构建 + 触发开发） |
| `dev-agent.js` | 自动开发代理（执行编码任务） |
| `autopilot.sh` | 统一启动/停止脚本 |
| `.pipeline-state.json` | 运行状态（自动维护） |
| `.trigger-dev-agent` | 触发开发的任务文件 |
| `.dev-complete` | 开发完成标记文件 |

---

## 🎯 当前状态

启动后系统自动：

1. ✅ 每 2 分钟检查 GitHub Actions 构建
2. ✅ 构建中等待（最多 10 分钟）
3. ✅ 构建完成/超时后选择下一个功能
4. ✅ 自动触发 AI 开发代理
5. ✅ 开发完成后自动提交推送
6. ✅ GitHub 自动触发新构建
7. ✅ 循环继续

---

## 🔧 管理命令

```bash
# 启动
./autopilot.sh start

# 停止
./autopilot.sh stop

# 重启
./autopilot.sh restart

# 查看状态
./autopilot.sh status

# 查看实时日志
./autopilot.sh logs

# 查看最新 20 行日志
tail -20 /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

---

## 📊 日志示例

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
⏳ 等待开发完成（超时：30 分钟）...
✅ 开发完成！
📦 开始提交代码...
✅ 提交成功：feat: 添加 内联预览（行内 Markdown 渲染）功能
🚀 推送到 GitHub...
✅ 推送成功！GitHub Actions 将自动触发构建
```

---

## 🚨 故障排查

### 查看进程状态
```bash
./autopilot.sh status
```

### 查看日志
```bash
tail -50 /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
tail -50 /home/node/.openclaw/workspace/logs/lightmark-devagent.log
```

### 手动重启
```bash
./autopilot.sh restart
```

### 重置状态
```bash
rm .pipeline-state.json
./autopilot.sh restart
```

---

## 📞 完整文档

| 文档 | 说明 |
|------|------|
| `AUTOPILOT-README.md` | 完全自动化版本使用指南 |
| `PIPELINE-README.md` | 监控器详细文档 |
| `FEATURES_PLAN.md` | 功能规划清单 |

---

**完全自动化版本** · 2026-03-31 · 赛文加开发 🤖
