# 📊 E2E 测试失败分析报告

> 分析时间：2026-04-02 19:38 GMT+8  
> 最新提交：c4a3701 (修复 E2E 超时问题)

---

## 🔍 可能的失败原因

### 1️⃣ Crepe 选择器不匹配

**问题**: E2E 测试使用了 `.milkdown-crepe` 选择器，但 Crepe 可能使用不同的类名

**测试代码**:
```javascript
const editor = page.locator('.milkdown-crepe')
await expect(editor).toBeVisible({ timeout: 10000 })
```

**可能的问题**:
- Crepe 的根容器类名可能不是 `.milkdown-crepe`
- 可能是 `.milkdown` 或其他类名
- 需要验证实际的 DOM 结构

**解决方案**:
```javascript
// 尝试多个选择器
const editor = page.locator('.milkdown, .milkdown-crepe, .ProseMirror').first()
```

---

### 2️⃣ 斜杠命令不可用

**问题**: 测试尝试使用 `/table` 斜杠命令，但 Crepe 可能未启用此功能

**测试代码**:
```javascript
await page.keyboard.type('/table')
await page.keyboard.press('Enter')
```

**可能的问题**:
- Crepe 的 slashCommands 功能可能未启用
- 或者需要使用不同的语法
- 可能需要先聚焦编辑器

**解决方案**:
```javascript
// 方案 1: 使用 Markdown 语法直接插入表格
await editor.fill('| 列 1 | 列 2 |\n|------|------|\n| 单元格 | 单元格 |')

// 方案 2: 确保启用了 slashCommands
editor = new Crepe({
  features: {
    slashCommands: true,  // 确保启用
  }
})
```

---

### 3️⃣ 服务器启动失败

**问题**: vite preview 服务器可能启动失败或超时

**CI 配置**:
```yaml
- name: Start preview server
  run: npx vite preview --port 5173 --host &

- name: Wait for server
  run: |
    for i in {1..60}; do
      if curl -s http://localhost:5173 > /dev/null; then
        exit 0
      fi
      sleep 1
    done
```

**可能的问题**:
- 构建产物不存在
- 端口被占用
- 超时时间不够

**解决方案**:
```yaml
# 添加调试输出
- name: Debug server start
  run: |
    echo "Checking server..."
    curl -v http://localhost:5173 || echo "Server not responding"
```

---

### 4️⃣ Playwright 浏览器启动失败

**问题**: Chromium 浏览器可能启动失败

**可能的问题**:
- 缺少系统依赖
- 内存不足
- 超时设置太短

**解决方案**:
```yaml
# 确保安装完整依赖
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

---

### 5️⃣ 测试超时

**问题**: 测试可能因为等待时间过长而超时

**当前配置**:
```javascript
// playwright.config.js
timeout: 60 * 1000,  // 60 秒
expect: { timeout: 10000 }  // 10 秒
```

**可能的问题**:
- 某些操作需要更长时间
- CI 环境较慢

**解决方案**:
```javascript
// 针对慢测试增加超时
test('慢测试', async ({ page }) => {
  await page.waitForTimeout(5000)  // 显式等待
}, { timeout: 120000 })  // 单独设置超时
```

---

## 🔧 立即修复方案

### 修复 1: 更新选择器

```javascript
// tests/e2e/core-features.spec.js

// 修复前
const editor = page.locator('.milkdown-crepe')

// 修复后
const editor = page.locator('.milkdown, .ProseMirror').first()
```

### 修复 2: 使用 Markdown 语法而非斜杠命令

```javascript
// 修复前
await page.keyboard.type('/table')
await page.keyboard.press('Enter')

// 修复后
await editor.fill('| 列 1 | 列 2 |\n|------|------|\n| 单元格 1 | 单元格 2 |')
await page.waitForTimeout(1000)
```

### 修复 3: 增加调试日志

```yaml
# .github/workflows/test.yml

- name: Debug server
  run: |
    echo "=== Server Status ==="
    curl -v http://localhost:5173 || echo "Failed"
    ps aux | grep vite || echo "No vite process"
```

---

## 📝 建议的调试步骤

### 步骤 1: 查看 CI 日志

```bash
# 访问 GitHub Actions
https://github.com/wy7980/lightmark/actions

# 查看失败的 job
# 查看 e2e-tests 的详细输出
```

### 步骤 2: 本地复现

```bash
cd /home/node/.openclaw/workspace/lightmark

# 构建
npm run build:frontend

# 启动预览
npx vite preview --port 5173

# 运行 E2E 测试
npx playwright test --project=chromium --reporter=list
```

### 步骤 3: 检查 Crepe 实际渲染

```javascript
// 在浏览器控制台执行
document.querySelector('.milkdown')
document.querySelector('.ProseMirror')
document.querySelector('.milkdown-crepe')
```

---

## 🎯 下一步行动

1. **查看 CI 详细日志** - 确定具体失败原因
2. **本地复现测试** - 验证是否能正常运行
3. **修复选择器** - 使用正确的 CSS 选择器
4. **简化测试** - 先用简单测试验证环境正常
5. **逐步添加** - 逐步添加复杂测试

---

_报告生成时间：2026-04-02 19:38 GMT+8_  
_等待 CI 日志详情..._
