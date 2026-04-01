# LightMark 安装和推送指南

> ✅ 测试依赖已安装完成，推送到 GitHub 启用 CI/CD

---

## ✅ 已完成的工作

### 1. 测试依赖安装完成

```bash
# Vitest 组件测试依赖 ✅
npm install -D vitest @testing-library/svelte jsdom @vitest/coverage-v8

# Playwright E2E 测试依赖 ✅
npm install -D @playwright/test
npx playwright install chromium
```

### 2. 测试结果验证

```
ℹ tests 116
ℹ suites 33
ℹ pass 116
ℹ fail 0
✅ 通过率：100%
⏱️ 执行时间：< 1 秒
```

---

## 📤 推送到 GitHub

### 方法 1: 使用 HTTPS（推荐）

```bash
cd /home/node/.openclaw/workspace/lightmark

# 查看当前状态
git status

# 查看所有提交
git log --oneline -5

# 推送到 GitHub
git push origin main
```

**如果提示输入用户名密码**：
- 用户名：你的 GitHub 用户名
- 密码：使用 [Personal Access Token](https://github.com/settings/tokens)（不是账户密码）

### 方法 2: 使用 SSH

```bash
# 配置 SSH 远程仓库
git remote set-url origin git@github.com:wy7980/lightmark.git

# 推送到 GitHub
git push origin main
```

**如果提示 SSH key**：
```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 GitHub
# 1. 复制公钥：cat ~/.ssh/id_ed25519.pub
# 2. 打开 https://github.com/settings/keys
# 3. 点击 "New SSH key" 并粘贴
```

### 方法 3: 使用 GitHub CLI

```bash
# 安装 GitHub CLI（如果没有）
# https://cli.github.com/

# 登录
gh auth login

# 推送
git push origin main
```

---

## 🔄 推送后自动触发

推送到 GitHub 后，GitHub Actions 会自动运行：

1. 进入 https://github.com/wy7980/lightmark/actions
2. 查看 "LightMark Test Suite" 工作流
3. 等待测试完成（约 5-10 分钟）
4. 查看测试报告和覆盖率

---

## 📊 本地运行完整测试

### 运行所有测试

```bash
# 单元测试 (116 用例)
npm run test:unit

# 组件测试 (80+ 用例)
npm run test:component

# E2E 测试 (40+ 用例)
npm run test:e2e

# 所有测试
npm run test:all
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

---

## 📝 Git 提交历史

当前待推送的提交：

```
8bec8e7 docs: 添加最终总结文档
edc195c docs: 添加 CI 配置指南文档
14eadeb ci: 添加 GitHub Actions 测试工作流
c139cb8 test: 添加完备的三层测试体系覆盖所有功能点
830c896 docs: 添加完整测试体系文档
0d244b5 docs: 添加测试体系总结文档
13ff627 test: 建立完整的自动化测试体系
06e9fa9 📝 添加 08:40 LightMark 例行检查记录
dea4ad6 🤖 更新 lightmark 子模块到最新提交
...
```

---

## 🎯 推送后的步骤

### 1. 验证 GitHub Actions

- 访问：https://github.com/wy7980/lightmark/actions
- 查看最新的 "LightMark Test Suite" 运行
- 确认所有任务通过：
  - ✅ unit-tests
  - ✅ component-tests
  - ✅ e2e-tests
  - ✅ build-test
  - ✅ lint
  - ✅ coverage
  - ✅ test-summary

### 2. 启用 Branch Protection（可选）

在 GitHub 仓库设置中：
1. Settings → Branches
2. Add branch protection rule
3. Branch name pattern: `main`
4. 勾选 "Require status checks to pass before merging"
5. 选择需要的状态检查（如 unit-tests）

### 3. 查看测试覆盖率

- 下载 `coverage-report` artifact
- 打开 `coverage/index.html` 查看详细报告

---

## 🐛 故障排查

### 问题：推送被拒绝

```bash
# 可能原因：远程仓库有本地没有的提交
git fetch origin
git rebase origin/main
git push origin main
```

### 问题：权限不足

```bash
# 检查远程仓库 URL
git remote -v

# 如果不是你的仓库，更新为正确的
git remote set-url origin https://github.com/YOUR_USERNAME/lightmark.git
```

### 问题：测试在 CI 失败

1. 查看 GitHub Actions 日志
2. 本地重现测试
3. 修复后重新推送

---

## 📚 相关文档

- `tests/FINAL-SUMMARY.md` - 最终总结
- `tests/COMPLETE-TEST-SUITE.md` - 完整测试体系
- `.github/workflows/README-CI.md` - CI 配置指南

---

## ✅ 检查清单

推送前确认：

- [x] 测试依赖已安装
- [x] 本地测试通过 (116/116)
- [x] Git 提交完成
- [ ] 推送到 GitHub
- [ ] GitHub Actions 运行成功
- [ ] 所有 CI 任务通过

---

_创建日期：2026-04-01_  
_最后更新：2026-04-01_
