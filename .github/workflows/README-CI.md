# LightMark CI/CD 配置指南

> GitHub Actions 自动化测试和部署配置

---

## 📋 目录

1. [测试工作流](#测试工作流)
2. [配置说明](#配置说明)
3. [本地测试](#本地测试)
4. [故障排查](#故障排查)

---

## 测试工作流

### 工作流文件位置

```
.github/workflows/test.yml
```

### 触发条件

| 事件 | 分支 | 说明 |
|------|------|------|
| `push` | `main`, `develop` | 推送到主分支时触发 |
| `pull_request` | `main` | PR 到主分支时触发 |

### 测试任务

| 任务 | 说明 | 用例数 | 预计时间 |
|------|------|--------|---------|
| `unit-tests` | 单元测试 | 116 | < 1 分钟 |
| `component-tests` | 组件测试 | 80+ | < 5 分钟 |
| `e2e-tests` | E2E 测试 | 40+ | < 10 分钟 |
| `build-test` | 构建测试 | - | < 5 分钟 |
| `lint` | 代码质量 | - | < 1 分钟 |
| `coverage` | 覆盖率报告 | - | < 5 分钟 |
| `test-summary` | 汇总报告 | - | < 1 分钟 |

---

## 配置说明

### Node.js 版本

```yaml
node-version: '20'
```

### 缓存配置

```yaml
cache: 'npm'
```

自动缓存 `node_modules` 加速构建。

### 并行执行

所有测试任务并行执行，总耗时约等于最慢的任务。

---

## 本地测试

### 运行完整测试套件

```bash
# 安装依赖
npm install

# 运行所有测试
npm run test:all

# 运行单元测试
npm run test:unit

# 运行组件测试（需要安装 Vitest）
npm install -D vitest @testing-library/svelte jsdom
npm run test:component

# 运行 E2E 测试（需要安装 Playwright）
npm install -D @playwright/test
npx playwright install
npm run test:e2e
```

### 生成覆盖率报告

```bash
npm install -D @vitest/coverage-v8
npm run test:coverage
```

---

## 故障排查

### 问题：测试在本地通过，CI 失败

**可能原因**:
1. Node.js 版本不一致
2. 依赖版本不一致
3. 操作系统差异

**解决方案**:
```bash
# 检查 Node 版本
node --version  # 应该是 v20

# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新运行测试
npm run test:all
```

### 问题：E2E 测试超时

**解决方案**:
```yaml
# 在 playwright.config.js 中增加超时
export default defineConfig({
  timeout: 60 * 1000,  // 60 秒
  expect: {
    timeout: 10000     // 10 秒
  }
})
```

### 问题：组件测试找不到 Svelte 组件

**解决方案**:
```bash
# 确保安装了 Vitest 依赖
npm install -D vitest @testing-library/svelte jsdom

# 检查 vitest.config.js 配置
cat vitest.config.js
```

### 问题：Playwright 浏览器安装失败

**解决方案**:
```bash
# 使用带依赖的安装
npx playwright install --with-deps

# 或者手动安装系统依赖
sudo apt-get update
sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libasound2 libpango-1.0-0 libcairo2
```

---

## 查看测试结果

### GitHub Actions 页面

1. 进入仓库的 **Actions** 标签
2. 选择对应的工作流运行
3. 查看各个任务的详细日志

### 下载测试产物

1. 在工作流页面底部找到 **Artifacts**
2. 下载对应的测试结果：
   - `unit-test-results`
   - `component-test-results`
   - `e2e-test-results`
   - `coverage-report`

### 测试汇总

在 PR 页面的 **Conversation** 标签可以看到测试汇总：

```markdown
## Test Summary

| Test Suite | Status |
|------------|--------|
| Unit Tests | success |
| Component Tests | success |
| E2E Tests | success |
| Build Test | success |

### Test Statistics
- Total Test Files: 11
- Total Test Cases: 236+
- Unit Tests: 116 cases
- Component Tests: 80+ cases
- E2E Tests: 40+ cases
```

---

## 自定义配置

### 添加新的测试任务

在 `.github/workflows/test.yml` 中添加：

```yaml
custom-tests:
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run custom tests
      run: npm run test:custom
```

### 修改触发条件

```yaml
on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]
```

### 添加定时测试

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 每天 UTC 2:00 运行
```

---

## 性能优化

### 缓存优化

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 并行矩阵测试

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

---

## 最佳实践

### 1. 保持测试快速

- 单元测试应该 < 1 秒
- 组件测试应该 < 5 秒
- E2E 测试应该 < 30 秒

### 2. 测试隔离

每个测试应该独立，不依赖其他测试的状态。

### 3. 有意义的测试名称

```javascript
// ✅ 好的命名
test('TableConfig: renderButton 应该返回有效的 emoji 图标', () => {})

// ❌ 避免模糊命名
test('测试表格', () => {})
```

### 4. 及时修复失败的测试

CI 测试失败应该优先修复，避免累积。

---

## 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [测试体系文档](tests/COMPLETE-TEST-SUITE.md)
- [测试指南](tests/TESTING-GUIDE.md)

---

_最后更新：2026-04-01_
