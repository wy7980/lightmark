# ⚡ LightMark 流水线 - 快速参考

## 🚀 一键启动

```bash
cd /home/node/.openclaw/workspace/lightmark
./pipeline-start.sh
```

## 🛑 停止

```bash
./pipeline-start.sh stop
```

## 📊 查看状态

```bash
./pipeline-start.sh status
```

## 📋 查看日志

```bash
# 实时查看
tail -f /home/node/.openclaw/workspace/logs/lightmark-pipeline.log

# 最新 20 行
tail -20 /home/node/.openclaw/workspace/logs/lightmark-pipeline.log
```

## 📁 关键文件

| 文件 | 说明 |
|------|------|
| `pipeline-monitor.js` | 主监控器 |
| `pipeline-start.sh` | 启动脚本 |
| `.pipeline-state.json` | 运行状态 |
| `FEATURES_PLAN.md` | 功能规划 |

## ⚙️ 配置

- **检查间隔**: 5 分钟（可修改 `pipeline-monitor.js`）
- **GitHub Token**: 建议设置环境变量 `GITHUB_TOKEN`
- **日志位置**: `/home/node/.openclaw/workspace/logs/`

## 🎯 当前状态

监控器运行中，每 5 分钟检查一次 GitHub Actions 构建状态。

构建完成后自动：
1. ✅ 分析构建结果
2. 📋 解析功能规划
3. 🎯 选择下一个开发目标
4. 📝 记录状态并通知

---

**详细文档**: `PIPELINE-README.md` | `PIPELINE-CRON-SETUP.md`
