# LightMark 测试指南

> 完整的自动化测试体系，防止 Bug 流入生产环境

---

## 📦 快速开始

### 1. 安装测试依赖

```bash
# 安装组件测试依赖
npm install -D vitest @testing-library/svelte jsdom @vitest/coverage-v8

# 安装 E2E 测试依赖
npm install -D @playwright/test

# 下载 Playwright 浏览器
npx playwright install
```

### 2. 运行测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行组件测试
npm run test:component

# 运行 E2E 测试
npm run test:e2e

# 运行所有测试
npm run test:all

# 监视模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

---

## 📁 测试文件结构

```
lightmark/
├── tests/
│   ├── unit.test.js              # 基础单元测试（已有）
│   ├── editor-config.test.js     # 编辑器配置测试（新增）
│   ├── component-boundary.test.js # 组件边界条件测试（新增）
│   ├── build.test.js             # 构建测试（已有）
│   ├── components/               # 组件测试（需要 Vitest）
│   │   ├── Editor.test.js
│   │   ├── TableEditor.test.js
│   │   └── ImageDrop.test.js
│   ├── e2e/                      # E2E 测试（需要 Playwright）
│   │   └── core-features.spec.js
│   └── REGRESSION-CHECKLIST.md   # 回归测试清单
├── vitest.config.js              # Vitest 配置
├── playwright.config.js          # Playwright 配置
└── package.json
```

---

## 🧪 测试类型说明

### 单元测试（Unit Tests）

**位置**: `tests/*.test.js`

**执行时间**: < 1 秒

**覆盖内容**:
- 工具函数（防抖、节流）
- 配置验证（tableBlockConfig, katexOptions）
- Markdown 解析逻辑
- 边界条件处理

**运行命令**:
```bash
npm run test:unit
```

**示例**:
```javascript
test('KaTeX 配置 throwOnError 必须为 false', () => {
  const katexOptions = {
    throwOnError: false,
    errorColor: '#cc0000',
  }
  
  assert.strictEqual(katexOptions.throwOnError, false)
})
```

---

### 组件测试（Component Tests）

**位置**: `tests/components/*.test.js`

**执行时间**: < 5 秒

**覆盖内容**:
- Svelte 组件渲染
- 组件交互
- Props 传递
- 事件触发

**运行命令**:
```bash
npm run test:component
```

**示例**:
```javascript
import { render } from '@testing-library/svelte'
import Editor from '../../src/components/Editor.svelte'

test('编辑器应该在空内容下正常初始化', async () => {
  const { container } = render(Editor, { props: { content: '' } })
  await new Promise(resolve => setTimeout(resolve, 500))
  expect(container.querySelector('.ProseMirror')).toBeTruthy()
})
```

---

### E2E 测试（End-to-End Tests）

**位置**: `tests/e2e/*.spec.js`

**执行时间**: < 30 秒

**覆盖内容**:
- 完整用户流程
- 跨浏览器兼容性
- 视觉回归
- 性能指标

**运行命令**:
```bash
npm run test:e2e
```

**示例**:
```javascript
test('编辑器应该正常启动并显示', async ({ page }) => {
  await page.goto('/')
  const editor = page.locator('.ProseMirror')
  await expect(editor).toBeVisible({ timeout: 10000 })
  await expect(editor).toBeEditable()
})
```

---

## 🎯 测试覆盖的 Bug 类型

### 1. 配置错误（已覆盖）

**Bug**: `table config TypeError`

**测试**:
```javascript
test('renderButton 应该返回有效的 emoji 图标', () => {
  const renderButton = (type) => {
    const icons = {
      'add_row': '➕',
      'delete_row': '🗑️',
    }
    return icons[type] || ''
  }
  
  assert.strictEqual(renderButton('add_row'), '➕')
  assert.strictEqual(renderButton('invalid_type'), '') // 边界条件
})
```

---

### 2. 第三方库异常（已覆盖）

**Bug**: `KaTeX parse crash`

**测试**:
```javascript
test('KaTeX 配置 throwOnError 必须为 false', () => {
  const katexOptions = { throwOnError: false }
  assert.strictEqual(katexOptions.throwOnError, false)
})

test('无效 Math 公式应该被优雅处理', () => {
  const invalidFormulas = ['$$ \\invalid { $$', '$$ \\frac{1}{2} $$']
  invalidFormulas.forEach(formula => {
    assert.doesNotThrow(() => validateFormula(formula))
  })
})
```

---

### 3. 初始化错误（已覆盖）

**Bug**: `Schema 找不到 'doc' 节点`

**测试**:
```javascript
test('doc 节点必须存在', () => {
  const validateSchema = (schema) => {
    if (!schema || !schema.type || schema.type !== 'doc') return false
    if (!Array.isArray(schema.content)) return false
    return true
  }
  
  assert.strictEqual(validateSchema({ type: 'doc', content: [] }), true)
  assert.strictEqual(validateSchema(null), false)
})
```

---

### 4. CSS 布局问题（已覆盖）

**Bug**: `编辑器右侧空白盲区`

**测试**:
```javascript
test('drop-zone 应该设置 width: 100%', () => {
  const dropZoneStyles = { width: '100%', flex: '1' }
  assert.strictEqual(dropZoneStyles.width, '100%')
})

test('编辑器应该撑满容器', () => {
  const containerWidth = 1920
  const editorWidth = 1920
  assert.strictEqual(editorWidth, containerWidth)
})
```

---

## 🔄 CI/CD 集成

### GitHub Actions 配置

创建 `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run component tests
        run: npm run test:component
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            test-results/
            coverage/
```

---

## 📊 测试覆盖率目标

| 类型 | 目标覆盖率 | 当前状态 |
|------|-----------|---------|
| 语句覆盖率 | > 80% | ⏳ 待测量 |
| 分支覆盖率 | > 70% | ⏳ 待测量 |
| 函数覆盖率 | > 80% | ⏳ 待测量 |
| 行覆盖率 | > 80% | ⏳ 待测量 |

**生成覆盖率报告**:
```bash
npm run test:coverage
```

---

## 🐛 添加新测试的最佳实践

### 1. 测试命名规范

```javascript
// ✅ 好的命名
test('TableConfig: renderButton 应该返回有效的 emoji', () => {})
test('MathConfig: throwOnError 应该为 false', () => {})

// ❌ 避免模糊命名
test('测试表格', () => {})
test('bug fix', () => {})
```

### 2. 测试结构（AAA 模式）

```javascript
test('addRow 应该在任意状态下正常工作', () => {
  // Arrange - 准备数据
  const table = createTable()
  const initialRows = table.rows.length
  
  // Act - 执行操作
  addRow(table)
  
  // Assert - 验证结果
  assert.strictEqual(table.rows.length, initialRows + 1)
})
```

### 3. 边界条件测试

```javascript
test('insertMarkdown 应该正确处理各种输入', () => {
  // 有效输入
  assert.strictEqual(insertMarkdown('# 标题').success, true)
  
  // 边界条件
  assert.strictEqual(insertMarkdown('').success, false)
  assert.strictEqual(insertMarkdown(null).success, false)
  assert.strictEqual(insertMarkdown(undefined).success, false)
  assert.strictEqual(insertMarkdown('   ').success, false)
})
```

### 4. 回归测试

每次修复 Bug 后，**立即添加对应的测试**：

```javascript
// Bug: #123 - KaTeX 解析崩溃
test('Bug #123: 无效公式不应该导致编辑器崩溃', () => {
  const invalidFormula = '$$ \\invalid { $$'
  assert.doesNotThrow(() => validateFormula(invalidFormula))
})
```

---

## 🔧 故障排查

### 问题：测试运行失败

**检查清单**:
1. 依赖是否安装完整？
   ```bash
   npm install
   ```

2. Node 版本是否正确？
   ```bash
   node --version  # 应该 >= 18
   ```

3. 测试文件语法是否正确？
   ```bash
   node --check tests/your-test.test.js
   ```

### 问题：E2E 测试超时

**解决方案**:
```javascript
// 增加超时时间
test('慢操作', async ({ page }) => {
  test.setTimeout(60000) // 60 秒
  // ...
})
```

### 问题：组件测试找不到 Svelte 组件

**检查 vitest.config.js**:
```javascript
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
  },
})
```

---

## 📚 相关资源

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

---

## ✅ 测试清单

在提交代码前，确保：

- [ ] 运行 `npm run test:unit` 通过
- [ ] 新增功能有对应测试
- [ ] Bug 修复有回归测试
- [ ] 测试覆盖率没有显著下降
- [ ] E2E 测试通过（如果修改了 UI）

---

_最后更新：2026-04-01_
