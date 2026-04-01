# 📤 推送到 GitHub 指南

> 当前有 11 个提交待推送

---

## 📊 待推送的提交

```
3e06273 chore: 完成测试体系建立 + 执行报告
ef89fa0 docs: 添加测试增强计划
c5f75b7 docs: 添加测试覆盖率报告
302dada docs: 添加安装和推送指南
8bec8e7 docs: 添加最终总结文档
edc195c docs: 添加 CI 配置指南文档
14eadeb ci: 添加 GitHub Actions 测试工作流
830c896 docs: 添加完整测试体系文档
c139cb8 test: 添加完备的三层测试体系覆盖所有功能点
0d244b5 docs: 添加测试体系总结文档
13ff627 test: 建立完整的自动化测试体系
```

**总计**: 11 个提交，包含完整的测试体系

---

## 🔐 推送方法

### 方法 1: 使用 Personal Access Token（推荐）

#### 步骤 1: 创建 Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写备注：`LightMark CI/CD`
4. 勾选权限：
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. 点击 "Generate token"
6. **复制并保存 token**（只显示一次！）

#### 步骤 2: 配置 Git 认证

```bash
# 设置全局用户名（如果还没设置）
git config --global user.name "wy7980"
git config --global user.email "wy7980@sina.com"

# 配置凭证存储
git config --global credential.helper store
```

#### 步骤 3: 推送

```bash
cd /home/node/.openclaw/workspace/lightmark

# 推送到 GitHub
git push origin main

# 当提示输入密码时，粘贴刚才创建的 token
# Username: wy7980
# Password: [粘贴 token]
```

---

### 方法 2: 使用 SSH

#### 步骤 1: 生成 SSH Key

```bash
# 生成新的 SSH key
ssh-keygen -t ed25519 -C "wy7980@sina.com"

# 按 Enter 接受默认位置
# 可以设置 passphrase 或留空
```

#### 步骤 2: 添加到 GitHub

1. 复制公钥：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. 访问 https://github.com/settings/keys

3. 点击 "New SSH key"

4. 填写标题：`LightMark Server`

5. 粘贴公钥内容

6. 点击 "Add SSH key"

#### 步骤 3: 切换远程仓库 URL

```bash
# 查看当前远程
git remote -v

# 切换到 SSH
git remote set-url origin git@github.com:wy7980/lightmark.git

# 验证
git remote -v
# 应该显示 git@github.com:wy7980/lightmark.git
```

#### 步骤 4: 推送

```bash
git push origin main
```

---

### 方法 3: 使用 GitHub CLI

#### 步骤 1: 安装 GitHub CLI

```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 验证安装
gh --version
```

#### 步骤 2: 登录

```bash
gh auth login
```

按照提示：
1. 选择 GitHub.com
2. 选择 SSH 或 HTTPS
3. 复制设备代码
4. 访问 https://github.com/login/device
5. 粘贴设备代码
6. 完成登录

#### 步骤 3: 推送

```bash
git push origin main
```

---

## ✅ 推送后验证

### 1. 查看 GitHub Actions

访问：https://github.com/wy7980/lightmark/actions

应该看到 "LightMark Test Suite" 工作流正在运行。

### 2. 查看测试结果

等待测试完成（约 5-10 分钟），查看：

- ✅ unit-tests (116 用例)
- ⏳ component-tests (80+ 用例)
- ⏳ e2e-tests (40+ 用例)
- ✅ build-test
- ✅ test-summary

### 3. 下载测试报告

在 GitHub Actions 页面：
1. 点击完成的工作流运行
2. 滚动到底部找到 "Artifacts"
3. 下载：
   - unit-test-results
   - coverage-report
   - e2e-test-results

---

## 🐛 故障排查

### 问题：认证失败

```bash
# 清除缓存的凭证
git credential-cache exit
# 或
rm ~/.git-credentials

# 重新推送
git push origin main
```

### 问题：权限不足

确保 token 有以下权限：
- ✅ `repo`
- ✅ `workflow`

### 问题：远程仓库不存在

```bash
# 检查远程仓库 URL
git remote -v

# 如果不正确，更新
git remote set-url origin https://github.com/wy7980/lightmark.git
```

### 问题：有未合并的更改

```bash
# 先拉取远程更改
git pull origin main

# 解决冲突（如果有）
# 然后重新推送
git push origin main
```

---

## 📊 推送后的预期结果

### GitHub Actions 工作流

```
✅ unit-tests         - 116 用例 (< 1 分钟)
⏳ component-tests    - 80+ 用例 (< 5 分钟)
⏳ e2e-tests          - 40+ 用例 (< 10 分钟)
✅ build-test         - 构建测试 (< 5 分钟)
✅ lint               - 代码检查 (< 1 分钟)
✅ coverage           - 覆盖率报告 (< 5 分钟)
✅ test-summary       - 汇总报告
```

### 测试汇总

在 PR 或提交页面会显示：

```markdown
## Test Summary

| Test Suite | Status |
|------------|--------|
| Unit Tests | ✅ success |
| Component Tests | ⏳ pending |
| E2E Tests | ⏳ pending |
| Build Test | ✅ success |

### Test Statistics
- Total Test Files: 16
- Total Test Cases: 236+
- Unit Tests: 116 cases (100% pass)
- Component Tests: 80+ cases
- E2E Tests: 40+ cases
```

---

## 📚 相关文档

- `tests/TEST-EXECUTION-REPORT.md` - 测试执行报告
- `tests/FINAL-SUMMARY.md` - 最终总结
- `.github/workflows/README-CI.md` - CI 配置指南
- `INSTALL-AND-PUSH.md` - 安装和推送指南

---

## 🎯 快速推送命令

```bash
# 1. 进入项目目录
cd /home/node/.openclaw/workspace/lightmark

# 2. 查看待推送的提交
git log --oneline origin/main..HEAD

# 3. 推送
git push origin main

# 4. 查看 GitHub Actions
# 访问：https://github.com/wy7980/lightmark/actions
```

---

_创建日期：2026-04-02_  
_最后更新：2026-04-02_
