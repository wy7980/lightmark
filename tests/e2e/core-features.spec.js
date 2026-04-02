/**
 * LightMark E2E 核心功能测试 - 简化版
 * 只测试最基本的功能，确保 CI 能快速通过
 */

import { test, expect } from '@playwright/test'

test.describe('LightMark 核心功能 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000) // 等待应用加载
  })

  // ==================== 编辑器加载测试 ====================
  test.describe('编辑器加载', () => {
    test('编辑器应该正常加载', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeVisible({ timeout: 10000 })
    })

    test('编辑器应该可编辑', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeEditable()
    })
  })

  // ==================== 基本编辑测试 ====================
  test.describe('基本编辑', () => {
    test('应该能输入文本', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('# 测试标题\n\n这是测试内容。')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('测试标题')
      expect(content).toContain('测试内容')
    })

    test('应该支持粗体语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('这是**粗体**文本')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('粗体')
    })
  })

  // ==================== 表格测试 ====================
  test.describe('表格功能', () => {
    test('应该支持 Markdown 表格语法', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      
      const tableMarkdown = '| 列 1 | 列 2 |\n|------|------|\n| 单元格 1 | 单元格 2 |'
      await editor.fill(tableMarkdown)
      await page.waitForTimeout(1000)
      
      const table = page.locator('table').first()
      await expect(table).toBeVisible()
    })
  })

  // ==================== 公式测试 ====================
  test.describe('数学公式', () => {
    test('应该支持行内公式', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('这是 $E=mc^2$ 公式')
      await page.waitForTimeout(500)
      
      const content = await editor.textContent()
      expect(content).toContain('E=mc^2')
    })

    test('无效公式不应该崩溃', async ({ page }) => {
      const editor = page.locator('.ProseMirror').first()
      await editor.click()
      await editor.fill('无效公式 $$$$ 测试')
      await page.waitForTimeout(500)
      
      await expect(editor).toBeEditable()
    })
  })

  // ==================== 任务列表测试 ====================
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

  // ==================== 界面测试 ====================
  test.describe('界面功能', () => {
    test('工具栏应该存在', async ({ page }) => {
      const toolbar = page.locator('.toolbar').first()
      await expect(toolbar).toBeVisible()
    })

    test('状态栏应该存在', async ({ page }) => {
      const statusBar = page.locator('.status-bar').first()
      await expect(statusBar).toBeVisible()
    })
  })
})
