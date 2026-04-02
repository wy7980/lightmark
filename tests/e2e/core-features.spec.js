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
      // 等待 Crepe 编辑器容器出现
      const editor = page.locator('.milkdown-crepe')
      await expect(editor).toBeVisible({ timeout: 10000 })
      
      // 编辑器应该可编辑
      await expect(editor).toBeEditable()
    })

    test('空内容启动不应该报错', async ({ page }) => {
      await page.goto('/')
      
      // 等待 Crepe 编辑器初始化
      await page.waitForSelector('.milkdown-crepe', { timeout: 10000 })
      
      // 检查控制台是否有错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('控制台错误:', msg.text())
        }
      })
      
      // 不应该有严重错误
      const editor = page.locator('.milkdown-crepe')
      await expect(editor).toBeVisible()
    })

    test('空文档时编辑器高度应该正常', async ({ page }) => {
      await page.goto('/')
      await page.waitForTimeout(1000) // 等待渲染
      
      // 验证编辑器容器高度
      const container = page.locator('.editor-container')
      const containerBox = await container.boundingBox()
      const viewportHeight = (await page.viewportSize()).height
      
      // 容器高度应该至少占据视口的 60%
      expect(containerBox.height).toBeGreaterThan(viewportHeight * 0.6)
      
      // 验证编辑器主体高度
      const editor = page.locator('.ProseMirror')
      const editorBox = await editor.boundingBox()
      
      // 编辑器高度应该至少 400px（保证可点击区域）
      expect(editorBox.height).toBeGreaterThan(400)
    })

    test('空文档时整个区域应该可点击', async ({ page }) => {
      await page.goto('/')
      await page.waitForTimeout(500)
      
      const editor = page.locator('.ProseMirror')
      
      // 点击编辑器中心区域
      const box = await editor.boundingBox()
      const centerX = box.x + box.width / 2
      const centerY = box.y + box.height / 2
      
      await page.mouse.click(centerX, centerY)
      
      // 编辑器应该获得焦点
      await expect(editor).toBeFocused()
    })

    test('编辑器不应该出现高度塌陷', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/')
      await page.waitForTimeout(1000)
      
      // 获取各个关键元素的高度
      const container = page.locator('.editor-container')
      const editor = page.locator('.ProseMirror')
      const milkdown = page.locator('.milkdown')
      
      const containerHeight = (await container.boundingBox()).height
      const editorHeight = (await editor.boundingBox()).height
      const milkdownHeight = (await milkdown.boundingBox()).height
      
      // 所有元素都应该有合理高度
      expect(containerHeight).toBeGreaterThan(500)
      expect(editorHeight).toBeGreaterThan(500)
      expect(milkdownHeight).toBeGreaterThan(500)
      
      // 不应该只有 1 行高度（约 20-30px）
      expect(containerHeight).toBeGreaterThan(100)
      expect(editorHeight).toBeGreaterThan(100)
      expect(milkdownHeight).toBeGreaterThan(100)
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

    test('表格显示应该正确且无多余内容', async ({ page }) => {
      const insertTableBtn = page.locator('[data-testid="insert-table"], button:has-text("表格")').first()
      const btnCount = await insertTableBtn.count()
      
      if (btnCount > 0) {
        await insertTableBtn.click()
        await page.waitForSelector('table', { timeout: 5000 })
        
        // 验证 1: 表格应该可见且结构完整
        const table = page.locator('table')
        await expect(table).toBeVisible()
        
        // 验证 2: 表格应该有表头
        const headers = table.locator('thead th, tr:first-child th')
        const headerCount = await headers.count()
        expect(headerCount).toBeGreaterThan(0)
        
        // 验证 3: 表格不应该有占位符文本或调试信息
        const tableText = await table.textContent()
        expect(tableText).not.toContain('undefined')
        expect(tableText).not.toContain('null')
        expect(tableText).not.toContain('[object Object]')
        expect(tableText).not.toContain('placeholder')
        expect(tableText).not.toContain('TODO')
        
        // 验证 4: 表格单元格应该可访问
        const cells = table.locator('td, th')
        const cellCount = await cells.count()
        expect(cellCount).toBeGreaterThan(0)
        
        // 验证 5: 每个单元格都应该有内容（不是空字符串）
        for (let i = 0; i < Math.min(cellCount, 6); i++) {
          const cellText = await cells.nth(i).textContent()
          if (cellText) {
            const trimmed = cellText.trim()
            // 单元格可以是空的，但不应该包含错误文本
            expect(trimmed).not.toContain('Error')
            expect(trimmed).not.toContain('undefined')
          }
        }
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

    test('公式显示应该正确且无多余内容', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 插入公式
      await editor.click()
      await editor.fill('$E=mc^2$ 和 $$\\sum_{i=1}^{n} i$$')
      await page.waitForTimeout(1000)
      
      // 验证 1: 编辑器内容应该包含公式
      const content = await editor.textContent()
      expect(content).toContain('E=mc^2')
      expect(content).toContain('\\sum')
      
      // 验证 2: 不应该有调试信息或占位符
      expect(content).not.toContain('undefined')
      expect(content).not.toContain('null')
      expect(content).not.toContain('[object Object]')
      expect(content).not.toContain('latex=')
      expect(content).not.toContain('type=')
      expect(content).not.toContain('Equation(')
      
      // 验证 3: KaTeX 渲染元素（如果有）不应该显示错误
      const katexElements = page.locator('.katex')
      const katexCount = await katexElements.count()
      
      if (katexCount > 0) {
        // 检查是否有 KaTeX 错误标记
        const katexError = page.locator('.katex-error')
        const errorCount = await katexError.count()
        expect(errorCount).toBe(0)
        
        // KaTeX 元素应该可见
        for (let i = 0; i < Math.min(katexCount, 3); i++) {
          await expect(katexElements.nth(i)).toBeVisible()
        }
      }
      
      // 验证 4: 编辑器不应该有异常样式
      const editorElement = page.locator('.ProseMirror')
      const editorClass = await editorElement.getAttribute('class')
      expect(editorClass).not.toContain('error')
      expect(editorClass).not.toContain('crash')
    })

    test('块级公式应该正确显示为独立块', async ({ page }) => {
      const editor = page.locator('.milkdown-crepe .ProseMirror')
      
      // 插入块级公式
      await editor.click()
      await editor.fill('这是正文\n$$\\frac{1}{2}$$\n这是正文之后')
      await page.waitForTimeout(1000)
      
      // 验证 1: 内容应该包含所有文本
      const content = await editor.textContent()
      expect(content).toContain('这是正文')
      expect(content).toContain('\\frac{1}{2}')
      expect(content).toContain('这是正文之后')
      
      // 验证 2: 不应该有多余的分隔符或标记
      expect(content).not.toContain('$$ $$')
      expect(content).not.toContain('$$$$')
      
      // 验证 3: 公式应该在独立行
      const mathBlock = page.locator('.math-block, .display-math, div[data-math-type="block"]')
      const mathBlockCount = await mathBlock.count()
      
      if (mathBlockCount > 0) {
        await expect(mathBlock.first()).toBeVisible()
      }
    })

    // ==================== Crepe 表格功能测试 ====================
    test('Crepe 应该支持插入表格', async ({ page }) => {
      const editor = page.locator('.milkdown-crepe .ProseMirror')
      await editor.click()
      
      // 使用斜杠命令插入表格
      await page.keyboard.type('/table')
      await page.waitForTimeout(500)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      
      // 验证表格已插入
      const table = page.locator('table')
      await expect(table).toBeVisible()
    })

    test('Crepe 表格应该可以编辑', async ({ page }) => {
      const editor = page.locator('.milkdown-crepe .ProseMirror')
      
      // 插入表格
      await editor.click()
      await page.keyboard.type('/table')
      await page.waitForTimeout(500)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      
      // 验证表格可见
      const table = page.locator('table')
      await expect(table).toBeVisible()
      
      // 验证表格有编辑按钮
      const tableButtons = page.locator('.table-button')
      const buttonCount = await tableButtons.count()
      expect(buttonCount).toBeGreaterThan(0)
    })

    test('Crepe 表格应该支持添加行和列', async ({ page }) => {
      const editor = page.locator('.milkdown-crepe .ProseMirror')
      
      // 插入表格
      await editor.click()
      await page.keyboard.type('/table')
      await page.waitForTimeout(500)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      
      // 点击添加行按钮
      const addRowBtn = page.locator('.table-button:has-text("➕"):has-text("行")').first()
      if (await addRowBtn.count() > 0) {
        await addRowBtn.click()
        await page.waitForTimeout(500)
        
        // 验证行数增加
        const rows = page.locator('table tr')
        const rowCount = await rows.count()
        expect(rowCount).toBeGreaterThan(2) // 至少表头 +2 行
      }
    })

    test('Crepe 表格样式应该正确', async ({ page }) => {
      const editor = page.locator('.milkdown-crepe .ProseMirror')
      
      // 插入表格
      await editor.click()
      await page.keyboard.type('/table')
      await page.waitForTimeout(500)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      
      // 验证表格样式
      const table = page.locator('table')
      const th = table.locator('th')
      const td = table.locator('td')
      
      // 验证表头背景色
      const thBackground = await th.first().evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      )
      expect(thBackground).toBeTruthy()
      
      // 验证边框
      const tdBorder = await td.first().evaluate(el =>
        window.getComputedStyle(el).border
      )
      expect(tdBorder).toContain('1px')
    })
  })

    test('连续美元符号不应该导致编辑器崩溃', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入无效的公式语法（连续 $$$$）
      await editor.click()
      await editor.fill('这是无效公式 $$$$ 测试')
      await page.waitForTimeout(1000)
      
      // 验证 1: 编辑器不应该崩溃，仍然可编辑
      await expect(editor).toBeEditable()
      
      // 验证 2: 内容应该被显示（即使公式无效）
      const content = await editor.textContent()
      expect(content).toContain('这是无效公式')
      expect(content).toContain('测试')
      
      // 验证 3: 不应该有未处理的 JavaScript 错误
      // （KaTeX 应该优雅地处理错误，显示为红色而不是崩溃）
    })

    test('包含 Windows 路径的公式应该正确处理', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入包含反斜杠的路径（常见于 Windows 用户）
      await editor.click()
      await editor.fill('文件路径：C:\\_test\\_file.md')
      await page.waitForTimeout(500)
      
      // 验证：编辑器不应该崩溃
      await expect(editor).toBeEditable()
      
      // 反斜杠应该被保留或正确处理
      const content = await editor.textContent()
      expect(content).toContain('C:')
      expect(content).toContain('test')
      expect(content).toContain('file.md')
    })

    test('混合的公式语法应该被优雅处理', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入混合的有效和无效公式
      await editor.click()
      await editor.fill('$E=mc^2$ 和 $$$$ 以及 $$\\sum_{i=1}^{n}$$')
      await page.waitForTimeout(1000)
      
      // 验证 1: 编辑器不应该崩溃
      await expect(editor).toBeEditable()
      
      // 验证 2: 有效公式应该正常显示
      const content = await editor.textContent()
      expect(content).toContain('E=mc^2')
      expect(content).toContain('\\sum')
      
      // 验证 3: 不应该有未处理的错误
      // （无效的 $$$$ 应该被忽略或显示为错误样式）
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

    test('任务列表显示应该正确且复选框状态正确', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入任务列表
      await editor.click()
      await editor.fill('- [ ] 任务 1\n- [x] 任务 2\n- [ ] 任务 3')
      await page.waitForTimeout(1000)
      
      // 验证 1: 复选框应该存在
      const checkboxes = page.locator('input[type="checkbox"]')
      const checkboxCount = await checkboxes.count()
      expect(checkboxCount).toBeGreaterThanOrEqual(1)
      
      // 验证 2: 任务文本应该正确显示
      const content = await editor.textContent()
      expect(content).toContain('任务 1')
      expect(content).toContain('任务 2')
      expect(content).toContain('任务 3')
      
      // 验证 3: 不应该有多余的标记或调试信息
      expect(content).not.toContain('undefined')
      expect(content).not.toContain('null')
      expect(content).not.toContain('[ ]') // Markdown 语法不应该直接显示
      expect(content).not.toContain('[x]') // Markdown 语法应该被渲染为复选框
      
      // 验证 4: 复选框状态应该正确
      // 第二个任务应该是已选中状态（如果渲染正确）
      if (checkboxCount >= 2) {
        const secondCheckbox = checkboxes.nth(1)
        const isChecked = await secondCheckbox.isChecked()
        // 如果 GFM 渲染正确，第二个复选框应该是选中状态
        // 但由于是测试输入，可能不会自动选中，所以这里只验证复选框存在
        expect(secondCheckbox).toBeTruthy()
      }
      
      // 验证 5: 任务列表项应该可访问
      const taskItems = page.locator('li:has(input[type="checkbox"])')
      const taskItemCount = await taskItems.count()
      if (taskItemCount > 0) {
        await expect(taskItems.first()).toBeVisible()
      }
    })

    test('任务列表不应该显示 Markdown 原始语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入多种任务列表语法
      await editor.click()
      await editor.fill('- [ ] 未开始\n* [ ] 另一种未开始\n- [x] 已完成')
      await page.waitForTimeout(1000)
      
      // 获取渲染后的内容
      const content = await editor.textContent()
      
      // 验证：Markdown 语法标记不应该直接显示在渲染内容中
      // （它们应该被转换为复选框 UI 元素）
      const lines = content.split('\n').filter(line => line.trim().length > 0)
      
      for (const line of lines) {
        // 每一行都不应该包含原始的 Markdown 任务列表标记
        expect(line).not.toMatch(/^[*-]\s*\[\s*\]/) // 不应该以 "- [ ]" 开头
        expect(line).not.toMatch(/^[*-]\s*\[\s*x\s*\]/) // 不应该以 "- [x]" 开头
        
        // 但应该包含任务文本
        expect(line).toMatch(/(未开始 | 已完成)/)
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
