/**
 * LightMark E2E 核心功能测试
 * 覆盖基本编辑、渲染和界面功能
 * 目标：15-20 个测试，运行时间 2-3 分钟
 */

import { test, expect } from '@playwright/test'

test.describe('LightMark 核心功能 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000) // 等待应用加载
  })

  // ==================== 编辑器加载测试 ====================
  test.describe('编辑器加载', () => {
    test('编辑器应该正常加载并可见', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeVisible({ timeout: 10000 })
    })

    test('编辑器应该可编辑', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeEditable()
    })

    test('编辑器应该能聚焦', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await expect(editor).toBeFocused()
    })
  })

  // ==================== 基本编辑功能 ====================
  test.describe('基本编辑', () => {
    test('应该能输入和显示文本', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('这是测试内容')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('这是测试内容')
    })

    test('应该支持标题语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('# 一级标题\n## 二级标题\n### 三级标题')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('一级标题')
      expect(content).toContain('二级标题')
    })

    test('应该支持粗体和斜体', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('这是**粗体**和*斜体*文本')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('粗体')
      expect(content).toContain('斜体')
    })

    test('应该支持列表语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('- 列表项 1\n- 列表项 2\n- 列表项 3')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('列表项 1')
      expect(content).toContain('列表项 2')
    })

    test('应该支持引用块', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('> 这是一段引用文本')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('这是一段引用文本')
    })
  })

  // ==================== 表格功能 ====================
  test.describe('表格功能', () => {
    test('应该支持 Markdown 表格语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      const tableMarkdown = '| 列 1 | 列 2 |\n|------|------|\n| 单元格 1 | 单元格 2 |'
      await editor.fill(tableMarkdown)
      await page.waitForTimeout(1000)
      
      const table = page.locator('table').first()
      await expect(table).toBeVisible()
      
      // 验证表格内容
      const content = await editor.textContent()
      expect(content).toContain('列 1')
      expect(content).toContain('单元格 1')
    })
  })

  // ==================== 数学公式 ====================
  test.describe('数学公式', () => {
    test('应该支持行内公式', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('这是 $E=mc^2$ 公式')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('E=mc^2')
    })

    test('应该支持块级公式', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('$$\\sum_{i=1}^{n} i$$')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('\\sum')
    })

    test('无效公式不应该导致崩溃', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('无效公式 $$$$ 测试')
      await page.waitForTimeout(500)
      
      // 编辑器应该仍然可编辑
      await expect(editor).toBeEditable()
      
      const content = await editor.textContent()
      expect(content).toContain('无效公式')
    })
  })

  // ==================== 任务列表 ====================
  test.describe('任务列表', () => {
    test('应该支持任务列表语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('- [ ] 未完成任务\n- [x] 已完成任务')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('未完成')
      expect(content).toContain('已完成')
    })
  })

  // ==================== 代码块 ====================
  test.describe('代码块', () => {
    test('应该支持代码块语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('```\nconst x = 1\nconsole.log(x)\n```')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('const x = 1')
    })

    test('应该支持行内代码', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('这是 `code` 行内代码')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('code')
    })
  })

  // ==================== 链接和图片 ====================
  test.describe('链接和图片', () => {
    test('应该支持链接语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('[GitHub](https://github.com)')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('GitHub')
    })

    test('应该支持图片语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('![图片说明](https://example.com/image.png)')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('图片说明')
    })
  })

  // ==================== 界面功能 ====================
  test.describe('界面功能', () => {
    test('工具栏应该存在并可见', async ({ page }) => {
      const toolbar = page.locator('.toolbar').first()
      await expect(toolbar).toBeVisible()
    })

    test('状态栏应该存在并显示字数', async ({ page }) => {
      const statusBar = page.locator('.status-bar').first()
      await expect(statusBar).toBeVisible()
      
      // 输入内容后验证字数统计
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('测试内容')
      await page.waitForTimeout(500)
      
      // 状态栏应该更新
      await expect(statusBar).not.toBeEmpty()
    })

    test('侧边栏应该存在', async ({ page }) => {
      const sidebar = page.locator('.sidebar').first()
      await expect(sidebar).toBeVisible()
    })
  })

  // ==================== 性能和稳定性 ====================
  test.describe('性能和稳定性', () => {
    test('应该能快速输入多个字符', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      const startTime = Date.now()
      await editor.fill('测试内容 '.repeat(100))
      const endTime = Date.now()
      
      // 输入应该在 2 秒内完成
      expect(endTime - startTime).toBeLessThan(2000)
      
      const content = await editor.textContent()
      expect(content.length).toBeGreaterThan(500)
    })

    test('编辑器不应该有 JavaScript 错误', async ({ page }) => {
      const errors = []
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })
      
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('测试内容')
      await page.waitForTimeout(1000)
      
      expect(errors).toHaveLength(0)
    })
  })
})
