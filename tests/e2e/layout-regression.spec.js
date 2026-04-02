/**
 * LightMark 布局和视觉回归测试
 * 验证 UI 组件的视觉表现和布局正确性
 */

import { test, expect } from '@playwright/test'

test.describe('布局视觉回归', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000) // 等待渲染
  })

  test.describe('空文档状态', () => {
    test('空文档时编辑器应该填满可用空间', async ({ page }) => {
      // 设置标准桌面分辨率
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // 获取编辑器容器
      const container = page.locator('.editor-container')
      const containerBox = await container.boundingBox()
      const viewportHeight = (await page.viewportSize()).height
      
      // 验证容器高度 - 使用相对值而非绝对值（CI 环境可能视口较小）
      expect(containerBox.height).toBeGreaterThan(viewportHeight * 0.6) // 至少 60% 视口高度
      
      // 验证宽度（应该占据剩余空间）
      const viewportWidth = 1920
      expect(containerBox.width).toBeGreaterThan(viewportWidth * 0.7)
    })

    test('空文档时点击区域应该充足', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      const editorBox = await editor.boundingBox()
      
      // 验证可点击区域高度 - 使用相对值
      const viewportHeight = (await page.viewportSize()).height
      expect(editorBox.height).toBeGreaterThan(viewportHeight * 0.5) // 至少 50% 视口高度
      
      // 验证可点击区域宽度 - 使用相对值
      const viewportWidth = (await page.viewportSize()).width
      expect(editorBox.width).toBeGreaterThan(viewportWidth * 0.5) // 至少 50% 视口宽度
      
      // 验证中心区域可点击
      const centerX = editorBox.x + editorBox.width / 2
      const centerY = editorBox.y + editorBox.height / 2
      
      await page.mouse.click(centerX, centerY)
      await expect(editor).toBeFocused()
    })

    test('空文档时不应该出现滚动条（内容未溢出）', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 验证垂直滚动条不存在或不可用
      const hasVerticalScrollbar = await editor.evaluate(el => {
        return el.scrollHeight > el.clientHeight
      })
      
      // 空文档时不应该有垂直滚动
      expect(hasVerticalScrollbar).toBe(false)
    })
  })

  test.describe('Toolbar 和状态栏', () => {
    test('Toolbar 应该在顶部正确显示', async ({ page }) => {
      const toolbar = page.locator('.toolbar')
      const toolbarBox = await toolbar.boundingBox()
      
      // 验证位置
      expect(toolbarBox.y).toBe(0)
      
      // 验证高度
      expect(toolbarBox.height).toBeGreaterThan(40)
      expect(toolbarBox.height).toBeLessThan(80)
      
      // 验证宽度（应该占满整个宽度）
      const viewportWidth = (await page.viewportSize()).width
      expect(Math.abs(toolbarBox.width - viewportWidth)).toBeLessThan(10)
    })

    test('状态栏应该在底部正确显示', async ({ page }) => {
      const statusBar = page.locator('.status-bar')
      const statusBarBox = await statusBar.boundingBox()
      
      // 验证位置（在底部）
      const viewportHeight = (await page.viewportSize()).height
      expect(Math.abs(statusBarBox.y + statusBarBox.height - viewportHeight)).toBeLessThan(10)
      
      // 验证高度
      expect(statusBarBox.height).toBeGreaterThan(20)
      expect(statusBarBox.height).toBeLessThan(40)
    })
  })

  test.describe('侧边栏', () => {
    test('侧边栏应该在左侧正确显示', async ({ page }) => {
      const sidebar = page.locator('.sidebar')
      const sidebarBox = await sidebar.boundingBox()
      
      // 验证位置
      expect(sidebarBox.x).toBe(0)
      
      // 验证宽度（标准侧边栏宽度）
      expect(sidebarBox.width).toBeGreaterThan(200)
      expect(sidebarBox.width).toBeLessThan(350)
      
      // 验证高度（应该占据整个视口高度减去 toolbar）
      const viewportHeight = (await page.viewportSize()).height
      expect(sidebarBox.height).toBeGreaterThan(viewportHeight * 0.8)
    })

    test('侧边栏展开/收起应该正常', async ({ page }) => {
      const sidebar = page.locator('.sidebar')
      
      // 初始状态：展开
      let sidebarBox = await sidebar.boundingBox()
      expect(sidebarBox.width).toBeGreaterThan(200)
      
      // 点击收起按钮（如果存在）
      const toggleBtn = page.locator('.sidebar-toggle').first()
      if (await toggleBtn.count() > 0) {
        await toggleBtn.click()
        await page.waitForTimeout(300)
        
        // 收起状态
        sidebarBox = await sidebar.boundingBox()
        expect(sidebarBox.width).toBeLessThan(50)
      }
    })
  })

  test.describe('响应式布局', () => {
    test('桌面端布局应该正确 (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      const viewportHeight = (await page.viewportSize()).height
      const viewportWidth = (await page.viewportSize()).width
      
      const container = page.locator('.editor-container')
      const containerBox = await container.boundingBox()
      
      // 使用相对值验证
      expect(containerBox.height).toBeGreaterThan(viewportHeight * 0.7)
      expect(containerBox.width).toBeGreaterThan(viewportWidth * 0.6)
    })

    test('笔记本布局应该正确 (1366x768)', async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 })
      const viewportHeight = (await page.viewportSize()).height
      const viewportWidth = (await page.viewportSize()).width
      
      const container = page.locator('.editor-container')
      const containerBox = await container.boundingBox()
      
      // 使用相对值验证
      expect(containerBox.height).toBeGreaterThan(viewportHeight * 0.6)
      expect(containerBox.width).toBeGreaterThan(viewportWidth * 0.6)
    })

    test('平板布局应该正确 (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      const viewportHeight = (await page.viewportSize()).height
      const viewportWidth = (await page.viewportSize()).width
      
      const container = page.locator('.editor-container')
      const containerBox = await container.boundingBox()
      
      // 平板模式下使用相对值验证
      expect(containerBox.height).toBeGreaterThan(viewportHeight * 0.7)
      expect(containerBox.width).toBeGreaterThan(viewportWidth * 0.7)
    })

    test('移动端布局应该正确 (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      const viewportHeight = (await page.viewportSize()).height
      const viewportWidth = (await page.viewportSize()).width
      
      const container = page.locator('.editor-container')
      const containerBox = await container.boundingBox()
      
      // 移动端模式下使用相对值验证
      expect(containerBox.height).toBeGreaterThan(viewportHeight * 0.7)
      expect(containerBox.width).toBeGreaterThan(viewportWidth * 0.7)
    })
  })

  test.describe('内容填充后的布局', () => {
    test('输入内容后编辑器应该正常扩展', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入多行内容
      await editor.click()
      await editor.fill('# 标题\n\n这是第一段。\n\n这是第二段。\n\n这是第三段。')
      await page.waitForTimeout(500)
      
      // 验证编辑器高度增加 - 使用相对值
      const viewportHeight = (await page.viewportSize()).height
      const editorBox = await editor.boundingBox()
      expect(editorBox.height).toBeGreaterThan(viewportHeight * 0.2) // 至少 20% 视口高度
    })

    test('长内容时应该出现滚动条', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      
      // 输入大量内容
      const longContent = Array(50).fill('# 标题\n\n这是段落内容。\n').join('\n')
      await editor.click()
      await editor.fill(longContent)
      await page.waitForTimeout(500)
      
      // 验证出现滚动条
      const hasScrollbar = await editor.evaluate(el => {
        return el.scrollHeight > el.clientHeight
      })
      
      expect(hasScrollbar).toBe(true)
    })
  })

  test.describe('视觉一致性', () => {
    test('编辑器背景色应该正确', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      const backgroundColor = await editor.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor
      })
      
      // 验证背景色不是透明
      expect(backgroundColor).not.toBe('transparent')
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    })

    test('编辑器字体应该正确加载', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      const fontFamily = await editor.evaluate(el => {
        return window.getComputedStyle(el).fontFamily
      })
      
      // 验证字体已加载
      expect(fontFamily.length).toBeGreaterThan(0)
      expect(fontFamily).not.toContain('sans-serif') // 应该有具体字体
    })

    test('编辑器内边距应该合适', async ({ page }) => {
      const editor = page.locator('.ProseMirror')
      const padding = await editor.evaluate(el => {
        const style = window.getComputedStyle(el)
        return {
          top: parseFloat(style.paddingTop),
          right: parseFloat(style.paddingRight),
          bottom: parseFloat(style.paddingBottom),
          left: parseFloat(style.paddingLeft)
        }
      })
      
      // 验证内边距合理
      expect(padding.left).toBeGreaterThan(20)
      expect(padding.right).toBeGreaterThan(20)
      expect(padding.top).toBeGreaterThan(20)
      expect(padding.bottom).toBeGreaterThan(20)
    })
  })
})
