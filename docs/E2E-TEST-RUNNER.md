# 🧪 LightMark E2E 测试本地运行指南

## 📋 前提条件

- Node.js >= 18
- npm >= 8
- Linux/macOS/Windows
- 至少 2GB 可用磁盘空间（用于浏览器）

---

## 🚀 快速开始

### 方法 1: 自动安装脚本（推荐）

```bash
# 进入项目目录
cd /home/node/.openclaw/workspace/lightmark

# 运行安装脚本
bash scripts/install-playwright.sh
```

**脚本会自动**:
- ✅ 检查 Node.js 和 npm
- ✅ 安装 npm 依赖
- ✅ 下载 Playwright 浏览器（Chromium, Firefox, WebKit）
- ✅ 安装系统依赖（需要 sudo 权限）

### 方法 2: 手动安装

```bash
# 1. 安装依赖
npm install

# 2. 安装浏览器
npx playwright install

# 3. 安装系统依赖（Linux，需要 sudo）
sudo npx playwright install-deps
```

---

## ▶️ 运行测试

### 运行所有 E2E 测试

```bash
npm run test:e2e
```

### 只运行 Chromium 测试（更快）

```bash
npx playwright test --project=chromium
```

### 运行特定测试文件

```bash
npx playwright test tests/e2e/core-features.spec.js
```

### 运行特定测试用例

```bash
npx playwright test --grep "空文档"
```

### 有头模式（可以看到浏览器）

```bash
npx playwright test --headed
```

### 调试模式

```bash
npx playwright test --debug
```

---

## 📊 查看测试报告

```bash
# 生成 HTML 报告
npx playwright show-report
```

报告会默认在浏览器中打开，显示：
- ✅ 通过的测试
- ❌ 失败的测试
- 📸 截图（失败时自动截取）
- 🎥 视频（失败时自动录制）

---

## 🐛 常见问题

### 问题 1: 缺少系统依赖

**错误信息**:
```
error while loading shared libraries: libnspr4.so: cannot open shared object file: No such file or directory
```

**解决方案**:
```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0

# 或使用自动安装
sudo npx playwright install-deps
```

### 问题 2: 浏览器下载失败

**错误信息**:
```
Failed to download browsers
```

**解决方案**:
```bash
# 清除缓存
rm -rf ~/.cache/ms-playwright

# 重新下载
npx playwright install
```

### 问题 3: 测试超时

**错误信息**:
```
Test timeout of 30000ms exceeded
```

**解决方案**:
```bash
# 增加超时时间
npx playwright test --timeout=60000
```

### 问题 4: 没有 sudo 权限

**解决方案**:
1. 联系管理员安装系统依赖
2. 或只使用 Chromium（部分功能可能受限）
3. 或在 CI/CD 中运行 E2E 测试

---

## 🎯 测试覆盖

### 核心功能测试 (core-features.spec.js)
- ✅ 编辑器初始化
- ✅ 表格功能
- ✅ 数学公式
- ✅ 任务列表
- ✅ 图片功能
- ✅ 布局验证
- ✅ 文件操作
- ✅ 主题切换

### 文件操作测试 (file-operations.spec.js)
- ✅ 新建文件
- ✅ 打开文件
- ✅ 保存文件
- ✅ 自动保存
- ✅ 文件状态

### 视觉回归测试 (visual-regression.spec.js)
- ✅ 布局测试
- ✅ 主题测试
- ✅ 响应式测试
- ✅ 截图对比
- ✅ 字体和排版

### 布局回归测试 (layout-regression.spec.js)
- ✅ 空文档状态
- ✅ Toolbar 和状态栏
- ✅ 侧边栏
- ✅ 响应式布局
- ✅ 内容填充后布局
- ✅ 视觉一致性

---

## 📈 测试统计

| 测试类型 | 用例数 | 浏览器 | 总计 |
|---------|--------|--------|------|
| 核心功能 | 21 | ×5 | 105 |
| 文件操作 | 18 | ×5 | 90 |
| 视觉回归 | 15 | ×5 | 75 |
| 布局回归 | 14 | ×5 | 70 |
| **总计** | **68** | **×5** | **340** |

**预计运行时间**: 5-10 分钟（取决于硬件）

---

## 🔧 配置选项

### playwright.config.js

```javascript
export default defineConfig({
  timeout: 30000,        // 测试超时
  expect: { timeout: 5000 },
  retries: 2,            // 失败重试次数
  workers: 4,            // 并行工作线程
  reporter: 'html',      // 报告格式
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

---

## 💡 最佳实践

### 1. 本地开发
```bash
# 只运行 Chromium（快速反馈）
npx playwright test --project=chromium

# 运行失败的测试
npx playwright test --last-failed
```

### 2. 提交前
```bash
# 运行所有测试
npm run test:e2e
```

### 3. CI/CD
```bash
# GitHub Actions 会自动运行所有测试
# 无需手动配置
```

---

## 📚 相关文档

- [Playwright 官方文档](https://playwright.dev)
- [测试编写指南](https://playwright.dev/docs/writing-tests)
- [测试运行器](https://playwright.dev/docs/running-tests)
- [调试工具](https://playwright.dev/docs/debug)

---

## 🆘 需要帮助？

1. 查看错误日志
2. 运行 `npx playwright test --debug`
3. 查看 [GitHub Issues](https://github.com/wy7980/lightmark/issues)
4. 联系开发团队

---

_最后更新：2026-04-02_
