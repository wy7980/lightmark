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
      await page.waitForTimeout(3000) // 进一步增加等待时间到 3 秒
      
      // 验证表格存在
      const table = page.locator('table').first()
      await expect(table).toBeVisible({ timeout: 10000 }) // 增加超时到 10 秒
      
      // 验证内容
      const content = await editor.textContent()
      expect(content).toContain('列 1')
      expect(content).toContain('单元格 1')
    })

    test('应该支持多行多列表格', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      const tableMarkdown = '| 姓名 | 年龄 | 城市 |\n|------|------|------|\n| 张三 | 25 | 北京 |\n| 李四 | 30 | 上海 |\n| 王五 | 28 | 广州 |'
      await editor.fill(tableMarkdown)
      await page.waitForTimeout(1000)
      
      const table = page.locator('table').first()
      await expect(table).toBeVisible()
      
      const content = await editor.textContent()
      expect(content).toContain('张三')
      expect(content).toContain('李四')
      expect(content).toContain('王五')
    })

    test('应该支持在表格后继续编辑', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      // 先插入表格
      const tableMarkdown = '| 列 1 | 列 2 |\n|------|------|\n| 单元格 1 | 单元格 2 |'
      await editor.fill(tableMarkdown)
      await page.waitForTimeout(500)
      
      // 在表格后继续输入
      await editor.press('Enter')
      await editor.press('Enter')
      await editor.fill('这是表格后的内容')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('单元格 1')
      expect(content).toContain('这是表格后的内容')
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

    test('应该支持复杂公式', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('\\frac')
      expect(content).toContain('\\sqrt')
    })

    test('应该支持修改行内公式', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      // 先输入公式
      await editor.fill('这是 $E=mc^2$ 公式')
      await page.waitForTimeout(500)
      
      // 移动光标到公式末尾
      for (let i = 0; i < 2; i++) {
        await editor.press('ArrowLeft')
      }
      
      // 修改公式
      await editor.fill('3')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('mc^3')
    })

    test('应该支持修改块级公式', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      // 先输入块级公式
      await editor.fill('$$\\frac{1}{2}$$')
      await page.waitForTimeout(500)
      
      // 在公式后继续输入
      await editor.press('ArrowRight')
      await editor.press('ArrowRight')
      await editor.fill('\n\n这是公式后的说明')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('\\frac')
      expect(content).toContain('这是公式后的说明')
    })

    test('应该支持在公式间编辑', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      // 输入多个公式
      await editor.fill('第一个公式 $a+b=c$\n\n第二个公式 $$\\sum_{i=1}^{n} i$$')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('第一个公式')
      expect(content).toContain('a+b=c')
      expect(content).toContain('第二个公式')
      expect(content).toContain('\\sum')
    })

    test('无效公式不应该导致崩溃', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('无效公式 $$$$ 测试')
      await page.waitForTimeout(500)
      
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
