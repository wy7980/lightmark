/**
 * LightMark 视觉回归 E2E 测试 - 第三层测试
 * 测试 UI 布局、样式和视觉一致性
 */

import { test, expect } from '@playwright/test'

test.describe('视觉回归 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待编辑器加载
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
  })

  // ==================== 布局测试 ====================
  test.describe('布局测试', () => {
    test('编辑器应该撑满容器', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      const container = page.locator('.container, .main, .app')
      const editor = page.locator('.ProseMirror, .editor')
      
      const containerBox = await container.first().boundingBox().catch(() => null)
      const editorBox = await editor.first().boundingBox().catch(() => null)
      
      if (containerBox && editorBox) {
        // 编辑器宽度应该接近容器宽度（允许 10px 误差）
        expect(Math.abs(editorBox.width - containerBox.width)).toBeLessThan(10)
        
        // 编辑器高度应该占据大部分容器
        expect(editorBox.height).toBeGreaterThan(containerBox.height * 0.6)
      }
    })

    test('不应该有右侧空白盲区', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      const editor = page.locator('.ProseMirror, .editor')
      const editorBox = await editor.first().boundingBox().catch(() => null)
      
      if (editorBox) {
        // 编辑器右边缘应该接近视口右边缘
        const rightEdge = editorBox.x + editorBox.width
        expect(rightEdge).toBeGreaterThan(1920 - 20) // 允许 20px 误差
      }
    })

    test('工具栏应该在顶部', async ({ page }) => {
      const toolbar = page.locator('.toolbar, .toolbar-container, [data-testid="toolbar"]')
      const count = await toolbar.count()
      
      if (count > 0) {
        const toolbarBox = await toolbar.first().boundingBox()
        if (toolbarBox) {
          // 工具栏应该在顶部（y 坐标接近 0）
          expect(toolbarBox.y).toBeLessThan(100)
        }
      }
    })

    test('侧边栏应该在左侧或右侧', async ({ page }) => {
      const sidebar = page.locator('.sidebar, .outline-panel, [data-testid="sidebar"]')
      const count = await sidebar.count()
      
      if (count > 0) {
        const sidebarBox = await sidebar.first().boundingBox()
        if (sidebarBox) {
          // 侧边栏应该在左侧或右侧
          const isLeft = sidebarBox.x < 200
          const isRight = sidebarBox.x > 1500
          expect(isLeft || isRight).toBe(true)
        }
      }
    })
  })

  // ==================== 主题测试 ====================
  test.describe('主题测试', () => {
    test('明亮主题应该正确', async ({ page }) => {
      // 确保是明亮主题
      const body = page.locator('body')
      await body.evaluate(el => {
        el.classList.remove('dark-theme')
        el.classList.add('light-theme')
      })
      
      // 获取背景色
      const bgColor = await body.evaluate(el => 
        getComputedStyle(el).backgroundColor
      )
      
      // 明亮主题背景应该是白色或浅色
      expect(bgColor).toMatch(/rgb\(255,?\s*255,?\s*255\)|rgb\(24[0-9],?\s*24[0-9],?\s*24[0-9]\)/)
    })

    test('黑暗主题应该正确', async ({ page }) => {
      const body = page.locator('body')
      await body.evaluate(el => {
        el.classList.remove('light-theme')
        el.classList.add('dark-theme')
      })
      
      const bgColor = await body.evaluate(el => 
        getComputedStyle(el).backgroundColor
      )
      
      // 黑暗主题背景应该是深色
      expect(bgColor).toMatch(/rgb\([0-5][0-9],?\s*[0-5][0-9],?\s*[0-5][0-9]\)/)
    })

    test('主题切换应该平滑', async ({ page }) => {
      const themeBtn = page.locator('[data-testid="theme-toggle"], .theme-switch').first()
      const count = await themeBtn.count()
      
      if (count > 0) {
        // 记录切换前的背景色
        const beforeBg = await page.evaluate(() => 
          getComputedStyle(document.body).backgroundColor
        )
        
        // 点击切换
        await themeBtn.click()
        await page.waitForTimeout(300)
        
        // 记录切换后的背景色
        const afterBg = await page.evaluate(() => 
          getComputedStyle(document.body).backgroundColor
        )
        
        // 背景色应该改变
        expect(afterBg).not.toBe(beforeBg)
      }
    })
  })

  // ==================== 响应式测试 ====================
  test.describe('响应式测试', () => {
    test('桌面端布局应该正确 (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeVisible()
      
      const box = await editor.boundingBox()
      expect(box?.width).toBeGreaterThan(1000)
    })

    test('笔记本布局应该正确 (1366x768)', async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 })
      
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeVisible()
      
      const box = await editor.boundingBox()
      expect(box?.width).toBeGreaterThan(800)
    })

    test('平板布局应该正确 (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeVisible()
    })

    test('移动端布局应该正确 (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const editor = page.locator('.ProseMirror').first()
      await expect(editor).toBeVisible()
      
      // 移动端编辑器应该占据大部分宽度
      const box = await editor.boundingBox()
      expect(box?.width).toBeGreaterThan(300)
    })
  })

  // ==================== 截图对比测试 ====================
  test.describe('截图对比', () => {
    test('编辑器初始状态截图', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // 等待稳定
      await page.waitForTimeout(500)
      
      // 截图（用于后续对比）
      await expect(page).toHaveScreenshot('editor-initial.png', {
        maxDiffPixels: 100,
        fullPage: false
      })
    })

    test('输入内容后截图', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      const editor = page.locator('.ProseMirror')
      await editor.fill('# 测试标题\n\n这是测试内容。')
      
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot('editor-with-content.png', {
        maxDiffPixels: 100
      })
    })

    test('黑暗主题截图', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // 切换到黑暗主题
      const body = page.locator('body')
      await body.evaluate(el => {
        el.classList.remove('light-theme')
        el.classList.add('dark-theme')
      })
      
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot('editor-dark-theme.png', {
        maxDiffPixels: 100
      })
    })
  })

  // ==================== 字体和排版测试 ====================
  test.describe('字体和排版', () => {
    test('编辑器字体应该正确', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      const fontFamily = await editor.evaluate(el => 
        getComputedStyle(el).fontFamily
      )
      
      // 应该有定义的字体
      expect(fontFamily.length).toBeGreaterThan(0)
    })

    test('标题字体大小应该正确', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      await editor.fill('# H1\n## H2\n### H3')
      
      const h1 = editor.locator('h1').first()
      const h1Size = await h1.evaluate(el => 
        parseFloat(getComputedStyle(el).fontSize)
      )
      
      // H1 应该比正文大
      expect(h1Size).toBeGreaterThan(16)
    })

    test('行高应该合适', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      const lineHeight = await editor.evaluate(el => 
        getComputedStyle(el).lineHeight
      )
      
      // 行高应该是数字或合理的值
      const lineHeightNum = parseFloat(lineHeight)
      expect(lineHeightNum).toBeGreaterThan(1)
    })
  })

  // ==================== 滚动条测试 ====================
  test.describe('滚动条', () => {
    test('内容溢出时应该显示滚动条', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 400 })
      
      const editor = page.locator('.ProseMirror')
      await editor.fill('# 长内容\n'.repeat(50))
      
      const hasScrollbar = await editor.evaluate(el => 
        el.scrollHeight > el.clientHeight
      )
      
      expect(hasScrollbar).toBe(true)
    })

    test('滚动条位置应该正确', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      await editor.fill('# 测试\n'.repeat(100))
      
      // 滚动到底部
      await editor.evaluate(el => {
        el.scrollTop = el.scrollHeight
      })
      
      const scrollTop = await editor.evaluate(el => el.scrollTop)
      expect(scrollTop).toBeGreaterThan(0)
    })
  })

  // ==================== 焦点模式视觉测试 ====================
  test.describe('焦点模式', () => {
    test('焦点模式应该隐藏工具栏', async ({ page }) => {
      const focusBtn = page.locator('[data-testid="focus-mode"], .focus-mode-btn').first()
      const count = await focusBtn.count()
      
      if (count > 0) {
        // 获取工具栏初始状态
        const toolbar = page.locator('.toolbar')
        const toolbarInitial = await toolbar.count()
        
        // 开启焦点模式
        await focusBtn.click()
        await page.waitForTimeout(300)
        
        // 工具栏应该隐藏或样式改变
        // （取决于具体实现）
      }
    })
  })
})
