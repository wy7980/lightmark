# GitHub Release 权限配置指南

## 问题说明

当前 GitHub Actions 构建成功，但自动创建 Release 失败，错误信息：
```
Resource not accessible by integration
```

这是因为 GitHub Token 没有写入 Releases 的权限。

---

## 配置步骤

### 方法 1：通过 GitHub Web 界面配置（推荐）

#### 步骤 1：打开仓库设置
1. 访问：https://github.com/wy7980/lightmark/settings/actions
2. 或者：进入仓库 → **Settings** → **Actions** → **General**

#### 步骤 2：修改 Workflow 权限
1. 向下滚动到 **Workflow permissions** 部分
2. 选择 **Read and write permissions**
3. ✅ 勾选 **Allow GitHub Actions to create and approve pull requests**
4. 点击 **Save** 保存

#### 步骤 3：验证配置
重新触发构建：
```bash
git tag v0.2.8 && git push origin v0.2.8
```

---

### 方法 2：通过 GitHub CLI 配置（如果已安装）

```bash
# 安装 GitHub CLI（如果未安装）
# Windows: winget install GitHub.cli
# macOS: brew install gh
# Linux: sudo apt install gh

# 登录 GitHub
gh auth login

# 启用仓库的 Actions 写入权限（需要管理员权限）
# 注意：这个 API 目前不支持，仍需通过 Web 界面配置
```

---

## 手动创建 Release（临时方案）

如果不想修改权限，可以手动创建 Release：

### 步骤 1：下载构建产物
1. 访问：https://github.com/wy7980/lightmark/actions/runs/23707380731
2. 点击底部的 **lightmark-windows** 产物
3. 下载 ZIP 文件并解压

### 步骤 2：创建 Release
1. 访问：https://github.com/wy7980/lightmark/releases/new
2. 点击 **Choose a tag** → 输入 `v0.2.7` → 点击 **Create new tag**
3. 填写发布标题：`LightMark v0.2.7 - Windows Release`
4. 填写发布说明（或使用 **Generate release notes**）
5. 上传文件：
   - `LightMark_0.1.0_x64_en-US.msi`
   - `LightMark_0.1.0_x64-setup.exe`
6. 点击 **Publish release**

---

## 自动化 Release 配置

配置权限后，每次推送版本标签会自动创建 Release：

```bash
# 推送新标签
git tag v0.3.0
git push origin v0.3.0

# GitHub Actions 会自动：
# 1. 构建 Windows 安装器
# 2. 创建 GitHub Release
# 3. 上传构建产物
```

---

## 构建产物说明

| 文件 | 说明 | 大小 |
|------|------|------|
| `LightMark_*_x64-setup.exe` | NSIS 安装器（推荐） | ~2 MB |
| `LightMark_*_x64_en-US.msi` | MSI 安装器 | ~2 MB |

---

## 故障排除

### 问题 1：仍然提示 403 错误
**解决**：
1. 确认已保存设置
2. 等待 1-2 分钟让权限生效
3. 重新触发构建

### 问题 2：找不到 Workflow permissions 选项
**原因**：仓库属于组织（Organization）而非个人账户

**解决**：
1. 联系组织管理员
2. 访问组织设置：https://github.com/organizations/ORG_NAME/settings/actions
3. 启用 **Allow GitHub Actions to create and approve pull requests**

### 问题 3：构建成功但没有产物
**解决**：
1. 检查 `.github/workflows/build-windows.yml`
2. 确认 `upload-artifact` 步骤配置正确
3. 查看构建日志确认产物路径

---

## 安全建议

1. **最小权限原则**：只授予必要的权限
2. **定期审查**：定期检查 Actions 日志
3. **使用 OIDC**：对于云部署，使用 OIDC 而非长期 Token

---

## 相关链接

- [GitHub Actions 权限文档](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [管理 Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Workflow 语法参考](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)

---

**配置完成后，运行以下命令测试：**

```bash
cd /home/node/.openclaw/workspace/lightmark
git tag v0.2.8
git push origin v0.2.8
```

然后访问：https://github.com/wy7980/lightmark/actions 查看构建状态
