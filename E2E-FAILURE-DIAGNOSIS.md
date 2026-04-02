# 🔍 E2E 测试失败诊断报告

> 分析时间：2026-04-02 22:45 GMT+8  
> 失败运行：提交 21a9968 (e880eed 之前)

---

## 📊 已知信息

### CI 运行日志分析

**运行开始时间**: 14:26:03  
**运行结束时间**: 约 14:52 (根据 URL 推断)  
**运行时长**: 约 26 分钟  
**失败阶段**: e2e-tests

### 构建阶段观察

从日志看到：
1. ✅ Checkout 成功
2. ✅ Node.js 设置成功 (v20.20.2)
3. ✅ npm install 成功 (410 个包)
4. ✅ Playwright Chromium 安装成功
5. ✅ 前端构建成功 (1129 个模块转换)
6. ❌ E2E 测试失败 (具体错误未知)

### 构建警告（非失败原因）

**A11y 无障碍警告** (不影响测试):
- App.svelte: modal-overlay 点击事件
- CrepeEditor.svelte: div 点击处理器
- Toolbar.svelte: 未使用的 CSS 选择器
- TableEditor.svelte: 未使用的 CSS 选择器
- ExportDialog.svelte: label 未关联控件
- Sidebar.svelte: li 点击事件
- Outline.svelte: li 点击事件

**这些警告不会导致测试失败**。

---

## 🐛 可能的失败原因

### 原因 1: 服务器启动失败 ⭐⭐⭐

**最可能的原因**：playwright.config.js 的 webServer 配置

```javascript
// 当前配置
webServer: process.env.CI ? undefined : {
  command: 'npm run build:frontend && npx vite preview --port 5173',
  // ...
}
```

**问题**:
- CI 环境中 webServer 被禁用 (`undefined`)
- 但 workflow 中手动启动服务器
- 可能存在竞态条件或端口占用

**证据**:
- 日志显示构建成功，但没有看到服务器启动日志
- E2E 测试需要访问 `http://localhost:5173`

---

### 原因 2: 测试超时 ⭐⭐

**可能性**: 中等

**当前配置**:
```javascript
timeout: 60 * 1000,  // 60 秒
expect: { timeout: 10000 }  // 10 秒
```

**问题**:
- 28 个测试，每个最多 60 秒
- 如果应用加载慢，可能超时
- CI 环境比本地慢

---

### 原因 3: 选择器不匹配 ⭐⭐

**可能性**: 中等

**当前测试使用**:
```javascript
const editor = page.locator('.ProseMirror').first()
```

**问题**:
- Crepe 编辑器可能使用不同的类名
- 需要验证 `.ProseMirror` 是否存在

---

### 原因 4: 应用加载失败 ⭐

**可能性**: 低

**问题**:
- 前端构建成功
- 但运行时可能有 JavaScript 错误
- Crepe 初始化可能失败

---

## 🔧 建议的修复方案

### 修复 1: 改进服务器启动（推荐）

**修改 `.github/workflows/test.yml`**:

```yaml
- name: Start preview server
  run: |
    npx vite preview --port 5173 --host 0.0.0.0 &
    echo "Server starting..."
  
- name: Wait for server
  run: |
    echo "Waiting for server..."
    for i in {1..60}; do
      if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ Server ready!"
        exit 0
      fi
      echo "Waiting... ($i/60)"
      sleep 1
    done
    echo "❌ Server failed to start"
    exit 1
```

---

### 修复 2: 增加调试输出

**修改 workflow**:

```yaml
- name: Debug server
  run: |
    echo "=== Server Status ==="
    curl -v http://localhost:5173 || echo "Failed"
    ps aux | grep vite || echo "No vite process"
    netstat -tlnp | grep 5173 || echo "Port 5173 not in use"
```

---

### 修复 3: 简化测试

**减少测试数量到 10-15 个核心用例**:

```javascript
// 只保留最核心的测试
test.describe('编辑器加载', () => {
  test('编辑器应该正常加载', async ({ page }) => {
    // ...
  })
})

test.describe('基本编辑', () => {
  test('应该能输入文本', async ({ page }) => {
    // ...
  })
})

// 移除复杂测试（表格编辑、公式修改等）
```

---

### 修复 4: 增加超时保护

**修改 `playwright.config.js`**:

```javascript
export default defineConfig({
  timeout: 90 * 1000,  // 增加到 90 秒
  expect: { timeout: 15000 },  // 增加到 15 秒
  
  // 添加全局重试
  retries: process.env.CI ? 2 : 0,
})
```

---

## 📝 诊断步骤

### 步骤 1: 查看完整日志

```bash
# 访问 GitHub Actions
https://github.com/wy7980/lightmark/actions

# 点击失败的 e2e-tests job
# 展开 "Run E2E tests" 步骤
# 查看具体错误信息
```

### 步骤 2: 本地复现

```bash
cd /home/node/.openclaw/workspace/lightmark

# 构建
npm run build:frontend

# 启动预览
npx vite preview --port 5173

# 运行测试
npx playwright test --project=chromium --reporter=list
```

### 步骤 3: 检查选择器

```javascript
// 在浏览器控制台执行
document.querySelector('.ProseMirror')
document.querySelector('.milkdown-crepe')
document.querySelector('.crepe-container')
```

---

## 🎯 下一步行动

1. **立即**: 查看 GitHub Actions 完整日志
2. **短期**: 添加调试输出到 workflow
3. **中期**: 简化测试到 15 个核心用例
4. **长期**: 建立稳定的 E2E 测试框架

---

_报告生成时间：2026-04-02 22:45 GMT+8_  
_等待完整日志分析..._
