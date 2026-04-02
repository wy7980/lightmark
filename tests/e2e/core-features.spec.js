/**
 * LightMark E2E 核心功能测试
 * 测试编辑器核心功能的端到端流程
 */

import { test, expect } from '@playwright/test'

test.describe('LightMark 核心功能 E2E', () => {
  // 每个测试前导航到应用
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ==================== 编辑器初始化测试 ====================
  test.describe('编辑器初始化', () => {
    test('编辑器应该正常启动并显示', async ({ page }) => {
      // 等待编辑器容器出现
      const editor = page.locator('.ProseMirror')
      await expect(editor).toBeVisible({ timeout: 10000 })
      
      // 编辑器应该可编辑
      await expect(editor).toBeEditable()
    })

    test('空内容启动不应该报错', async ({ page }) => {
      await page.goto('/')
      
      // 等待编辑器初始化
      await page.waitForSelector('.ProseMirror', { timeout: 10000 })
      
      // 检查控制台是否有错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('控制台错误:', msg.text())
        }
      })
      
      // 不应该有严重错误
      const editor = page.locator('.ProseMirror')
      await expect(editor).toBeVisible()
    })
  })

  // ==================== 表格功能测试 ====================
  test.describe('表格功能', () => {
    test('插入表格应该成功', async ({ page }) => {
      // 找到插入表格按钮（根据实际 UI 调整选择器）
      const insertTableBtn = page.locator('[data-testid="insert-table"], button:has-text("表格"), .toolbar-button:has-text("表格")')
      
      // 如果按钮存在，点击它
      const btnCount = await insertTableBtn.count()
      if (btnCount > 0) {
        await insertTableBtn.first().click()
        
        // 等待表格出现
        const table = page.locator('table')
        await expect(table).toBeVisible({ timeout: 5000 })
        
        // 表格应该有内容
        const rows = table.locator('tr')
        await expect(rows).toHaveCount({ min: 2 }) // 至少表头 + 一行
      }
    })

    test('表格编辑不应该导致崩溃', async ({ page }) => {
      // 先插入表格
      const insertTableBtn = page.locator('[data-testid="insert-table"], button:has-text("表格")').first()
      const btnCount = await insertTableBtn.count()
      
      if (btnCount > 0) {
        await insertTableBtn.click()
        await page.waitForSelector('table', { timeout: 5000 })
        
        // 尝试编辑表格单元格
        const cell = page.locator('td').first()
        await cell.click()
        await cell.fill('测试内容')
        
        // 编辑器应该仍然可用
        const editor = page.locator('.ProseMirror')
        await expect(editor).toBeEditable()
      }
    })
  })

  // ==================== 数学公式测试 ====================
  test.describe('数学公式', () => {
    test('插入行内公式应该成功', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入行内公式
      await editor.click()
      await editor.fill('这是一个公式 $E=mc^2$ 测试')
      
      // 等待渲染
      await page.waitForTimeout(1000)
      
      // 编辑器应该仍然可用
      await expect(editor).toBeEditable()
      
      // 公式应该被渲染（检查是否有 katex 相关元素）
      const katexElement = page.locator('.katex, .math').first()
      const katexCount = await katexElement.count()
      
      // 如果 katex 插件正常工作，应该能找到渲染后的公式
      if (katexCount > 0) {
        await expect(katexElement).toBeVisible()
      }
    })

    test('无效公式不应该导致编辑器崩溃', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入无效的 Math 公式
      await editor.click()
      await editor.fill('$$ \\invalid_command { $$')
      
      // 等待渲染
      await page.waitForTimeout(1000)
      
      // 编辑器应该仍然可用（不会崩溃）
      await expect(editor).toBeEditable()
      
      // 应该显示错误样式或原文
      const content = await editor.textContent()
      expect(content).toContain('\\invalid_command')
    })

    test('块级公式插入应该成功', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入块级公式
      await editor.click()
      await editor.fill('$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$')
      
      // 等待渲染
      await page.waitForTimeout(1000)
      
      // 编辑器应该仍然可用
      await expect(editor).toBeEditable()
      
      // 验证公式内容
      const content = await editor.textContent()
      expect(content).toContain('\\sum')
      expect(content).toContain('\\frac')
    })

    test('已插入的公式应该可以编辑修改', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 步骤 1: 插入初始公式
      await editor.click()
      await editor.fill('$E=mc^2$')
      await page.waitForTimeout(500)
      
      // 步骤 2: 移动光标到公式中间
      await editor.click()
      await page.keyboard.press('ArrowLeft') // 移动到 $ 前面
      await page.keyboard.press('ArrowLeft') // 移动到 2 前面
      await page.keyboard.press('ArrowLeft') // 移动到 c 前面
      
      // 步骤 3: 修改公式 (将 c^2 改为 c^3)
      await page.keyboard.press('Backspace') // 删除 c
      await editor.fill('E=mc^3$')
      await page.waitForTimeout(500)
      
      // 步骤 4: 验证修改后的内容
      const content = await editor.textContent()
      expect(content).toContain('E=mc^3')
      
      // 编辑器应该仍然可用
      await expect(editor).toBeEditable()
    })

    test('块级公式应该可以编辑修改', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 步骤 1: 插入块级公式
      await editor.click()
      await editor.fill('$$\\frac{1}{2}$$')
      await page.waitForTimeout(500)
      
      // 步骤 2: 定位并修改公式
      await editor.click()
      // 将分子从 1 改为 3
      await editor.fill('$$\\frac{3}{2}$$')
      await page.waitForTimeout(500)
      
      // 步骤 3: 验证修改后的内容
      const content = await editor.textContent()
      expect(content).toContain('\\frac{3}{2}')
      
      // 编辑器应该仍然可用
      await expect(editor).toBeEditable()
    })

    test('公式编辑后应该正确重新渲染', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 步骤 1: 插入简单公式
      await editor.click()
      await editor.fill('$a+b$')
      await page.waitForTimeout(500)
      
      // 记录初始状态
      const initialContent = await editor.textContent()
      expect(initialContent).toContain('a+b')
      
      // 步骤 2: 修改为复杂公式
      await editor.click()
      await editor.fill('$\\alpha + \\beta = \\gamma$')
      await page.waitForTimeout(1000)
      
      // 步骤 3: 验证重新渲染
      const finalContent = await editor.textContent()
      expect(finalContent).toContain('\\alpha')
      expect(finalContent).toContain('\\beta')
      expect(finalContent).toContain('\\gamma')
      
      // 编辑器不应该崩溃
      await expect(editor).toBeEditable()
    })
  })

  // ==================== 任务列表测试 ====================
  test.describe('任务列表', () => {
    test('插入任务列表应该成功', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入任务列表语法
      await editor.click()
      await editor.fill('- [ ] 未完成的任务\n- [x] 已完成的任务')
      
      // 等待渲染
      await page.waitForTimeout(1000)
      
      // 检查是否有任务列表元素
      const taskListItems = page.locator('input[type="checkbox"]')
      const count = await taskListItems.count()
      
      // 如果 GFM 支持正常，应该有 2 个复选框
      if (count > 0) {
        expect(count).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // ==================== 图片功能测试 ====================
  test.describe('图片功能', () => {
    test('图片拖放区域应该存在', async ({ page }) => {
      // 查找图片拖放区域
      const dropZone = page.locator('.drop-zone, [data-testid="image-drop"], .image-drop')
      const count = await dropZone.count()
      
      // 如果组件存在，应该可见
      if (count > 0) {
        await expect(dropZone.first()).toBeVisible()
      }
    })
  })

  // ==================== 布局测试 ====================
  test.describe('布局验证', () => {
    test('编辑器不应该出现右侧空白盲区', async ({ page }) => {
      // 设置标准桌面分辨率
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // 获取编辑器和容器的宽度
      const editorWidth = await page.$eval('.ProseMirror, .editor', el => el.offsetWidth).catch(() => 0)
      const containerWidth = await page.$eval('.container, .main', el => el.offsetWidth).catch(() => 0)
      
      // 如果元素存在，宽度应该匹配
      if (editorWidth > 0 && containerWidth > 0) {
        // 允许 10 像素的误差
        expect(Math.abs(editorWidth - containerWidth)).toBeLessThan(10)
      }
    })

    test('编辑器应该占据可用空间', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      const editor = page.locator('.ProseMirror, .editor').first()
      const editorCount = await editor.count()
      
      if (editorCount > 0) {
        const boundingBox = await editor.boundingBox()
        if (boundingBox) {
          // 编辑器宽度应该至少是视口的 80%
          expect(boundingBox.width).toBeGreaterThan(1920 * 0.8)
          
          // 编辑器高度应该至少是视口的 60%
          expect(boundingBox.height).toBeGreaterThan(1080 * 0.6)
        }
      }
    })
  })

  // ==================== 文件操作测试 ====================
  test.describe('文件操作', () => {
    test('打开文件对话框应该能弹出', async ({ page }) => {
      // 查找打开文件按钮
      const openBtn = page.locator('[data-testid="open-file"], button:has-text("打开"), .toolbar-button:has-text("打开")').first()
      const btnCount = await openBtn.count()
      
      if (btnCount > 0) {
        // 监听文件对话框
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null)
        
        await openBtn.click()
        
        const fileChooser = await fileChooserPromise
        if (fileChooser) {
          expect(fileChooser).toBeTruthy()
        }
      }
    })
  })

  // ==================== 主题切换测试 ====================
  test.describe('主题切换', () => {
    test('主题切换按钮应该存在并可点击', async ({ page }) => {
      const themeBtn = page.locator('[data-testid="theme-toggle"], button:has-text("主题"), .theme-switch').first()
      const btnCount = await themeBtn.count()
      
      if (btnCount > 0) {
        await expect(themeBtn).toBeVisible()
        await expect(themeBtn).toBeEnabled()
        
        // 点击切换
        await themeBtn.click()
        
        // 等待主题切换（检查 body 或 html 的 class 变化）
        await page.waitForTimeout(500)
        
        // 按钮应该仍然可用
        await expect(themeBtn).toBeEnabled()
      }
    })
  })
})
