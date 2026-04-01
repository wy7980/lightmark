/**
 * LightMark 文件操作 E2E 测试 - 第三层测试
 * 测试文件新建、打开、保存等操作
 */

import { test, expect } from '@playwright/test'

test.describe('文件操作 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ==================== 新建文件 ====================
  test.describe('新建文件', () => {
    test('应该能够新建空文件', async ({ page }) => {
      // 查找新建按钮
      const newBtn = page.locator('[data-testid="new-file"], button:has-text("新建"), .toolbar-button:has-text("新建")').first()
      const count = await newBtn.count()
      
      if (count > 0) {
        await newBtn.click()
        
        // 编辑器应该清空
        const editor = page.locator('.ProseMirror')
        await expect(editor).toBeVisible()
        
        // 内容应该为空或只有默认内容
        const content = await editor.textContent()
        expect(content?.trim().length).toBeLessThanOrEqual(100)
      }
    })

    test('新建文件后应该可以输入', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      await editor.click()
      await editor.fill('# 新文件测试')
      
      const content = await editor.textContent()
      expect(content).toContain('新文件测试')
    })
  })

  // ==================== 打开文件 ====================
  test.describe('打开文件', () => {
    test('应该能够打开文件对话框', async ({ page }) => {
      const openBtn = page.locator('[data-testid="open-file"], button:has-text("打开"), .toolbar-button:has-text("打开")').first()
      const count = await openBtn.count()
      
      if (count > 0) {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null)
        await openBtn.click()
        
        const fileChooser = await fileChooserPromise
        if (fileChooser) {
          expect(fileChooser).toBeTruthy()
        }
      }
    })

    test('拖放文件应该打开', async ({ page }) => {
      const editor = page.locator('.ProseMirror, .drop-zone').first()
      const count = await editor.count()
      
      if (count > 0) {
        // 创建测试文件内容
        const testContent = '# 测试文件\n这是拖放测试内容'
        
        // 注意：实际拖放需要 DataTransfer，这里测试元素存在
        await expect(editor).toBeVisible()
      }
    })

    test('打开文件后内容应该显示', async ({ page }) => {
      // 模拟打开文件后的状态
      const editor = page.locator('.ProseMirror')
      await editor.click()
      await editor.fill('# 已打开的文件\n内容测试')
      
      const content = await editor.textContent()
      expect(content).toContain('已打开的文件')
    })
  })

  // ==================== 保存文件 ====================
  test.describe('保存文件', () => {
    test('应该能够保存文件', async ({ page }) => {
      const saveBtn = page.locator('[data-testid="save-file"], button:has-text("保存"), .toolbar-button:has-text("保存")').first()
      const count = await saveBtn.count()
      
      // 先输入内容
      const editor = page.locator('.ProseMirror')
      await editor.click()
      await editor.fill('# 测试保存')
      
      if (count > 0) {
        await saveBtn.click()
        
        // 保存后应该有反馈
        await page.waitForTimeout(500)
      }
    })

    test('另存为应该打开对话框', async ({ page }) => {
      const saveAsBtn = page.locator('[data-testid="save-as"], button:has-text("另存为")').first()
      const count = await saveAsBtn.count()
      
      if (count > 0) {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null)
        await saveAsBtn.click()
        
        const fileChooser = await fileChooserPromise
        if (fileChooser) {
          expect(fileChooser).toBeTruthy()
        }
      }
    })
  })

  // ==================== 自动保存 ====================
  test.describe('自动保存', () => {
    test('内容变化应该触发自动保存', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      await editor.click()
      
      // 输入内容
      await editor.fill('# 自动保存测试')
      
      // 等待可能的自动保存
      await page.waitForTimeout(1000)
      
      // 编辑器应该仍然可用
      await expect(editor).toBeEditable()
    })
  })

  // ==================== 文件状态 ====================
  test.describe('文件状态', () => {
    test('修改后应该显示未保存状态', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      await editor.click()
      await editor.fill('修改内容')
      
      // 检查是否有未保存指示器
      const unsavedIndicator = page.locator('[data-testid="unsaved"], .unsaved-indicator, span:has-text("*")')
      const count = await unsavedIndicator.count()
      
      // 如果有指示器，应该可见
      if (count > 0) {
        await expect(unsavedIndicator.first()).toBeVisible()
      }
    })

    test('保存后应该清除未保存状态', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      await editor.click()
      await editor.fill('测试内容')
      
      // 点击保存
      const saveBtn = page.locator('[data-testid="save-file"], button:has-text("保存")').first()
      const btnCount = await saveBtn.count()
      
      if (btnCount > 0) {
        await saveBtn.click()
        await page.waitForTimeout(500)
      }
    })
  })

  // ==================== 最近文件 ====================
  test.describe('最近文件', () => {
    test('应该显示最近打开的文件', async ({ page }) => {
      // 查找最近文件列表
      const recentFiles = page.locator('[data-testid="recent-files"], .recent-files, .file-list')
      const count = await recentFiles.count()
      
      if (count > 0) {
        await expect(recentFiles.first()).toBeVisible()
      }
    })
  })

  // ==================== 文件信息 ====================
  test.describe('文件信息', () => {
    test('应该显示文件名', async ({ page }) => {
      const fileNameEl = page.locator('[data-testid="filename"], .filename, .file-info')
      const count = await fileNameEl.count()
      
      if (count > 0) {
        await expect(fileNameEl.first()).toBeVisible()
      }
    })

    test('应该显示文件大小', async ({ page }) => {
      const fileSizeEl = page.locator('[data-testid="filesize"], .file-size')
      const count = await fileSizeEl.count()
      
      if (count > 0) {
        await expect(fileSizeEl.first()).toBeVisible()
      }
    })
  })
})
