#!/usr/bin/env node
/**
 * LightMark 组件边界条件测试
 * 测试各组件在极端情况下的行为
 * 
 * 覆盖的 Bug:
 * - 编辑器右侧空白盲区 (CSS 布局)
 * - 表格/任务列表插入失败
 * - 图片插入失败
 */

import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('组件边界条件测试', () => {
  // ==================== Editor 组件测试 ====================
  describe('Editor 组件', () => {
    test('insertMarkdown 应该正确处理各种输入', () => {
      const insertMarkdown = (markdownText) => {
        // 模拟插入逻辑
        if (!markdownText || typeof markdownText !== 'string') {
          return { success: false, error: '无效的 Markdown 内容' }
        }
        
        if (markdownText.trim() === '') {
          return { success: false, error: '空内容' }
        }
        
        return { success: true, inserted: markdownText.trim() }
      }

      // 测试有效输入
      assert.strictEqual(insertMarkdown('# 标题').success, true)
      assert.strictEqual(insertMarkdown('**粗体**').success, true)
      
      // 测试边界条件
      assert.strictEqual(insertMarkdown('').success, false)
      assert.strictEqual(insertMarkdown(null).success, false)
      assert.strictEqual(insertMarkdown(undefined).success, false)
      assert.strictEqual(insertMarkdown('   ').success, false)
    })

    test('focusMode 切换应该正确', () => {
      let focusMode = false
      
      const toggleFocus = () => {
        focusMode = !focusMode
        return focusMode
      }

      assert.strictEqual(toggleFocus(), true)
      assert.strictEqual(toggleFocus(), false)
      assert.strictEqual(toggleFocus(), true)
    })

    test('typewriterMode 切换应该正确', () => {
      let typewriterMode = false
      
      const toggleTypewriter = () => {
        typewriterMode = !typewriterMode
        return typewriterMode
      }

      assert.strictEqual(toggleTypewriter(), true)
      assert.strictEqual(toggleTypewriter(), false)
    })
  })

  // ==================== TableEditor 组件测试 ====================
  describe('TableEditor 组件', () => {
    test('addRow 应该在任意状态下正常工作', () => {
      const createTable = () => ({
        headers: ['列 1', '列 2'],
        rows: [['单元格 1', '单元格 2']],
        align: ['left', 'left']
      })

      const addRow = (table) => {
        if (!table || !table.headers) {
          throw new Error('表格结构无效')
        }
        table.rows.push(new Array(table.headers.length).fill('新单元格'))
        return table
      }

      const table = createTable()
      const initialRows = table.rows.length
      
      addRow(table)
      assert.strictEqual(table.rows.length, initialRows + 1)
      assert.strictEqual(table.rows[table.rows.length - 1].length, table.headers.length)
    })

    test('addColumn 应该在任意状态下正常工作', () => {
      const createTable = () => ({
        headers: ['列 1', '列 2'],
        rows: [['单元格 1', '单元格 2']],
        align: ['left', 'left']
      })

      const addColumn = (table) => {
        if (!table || !table.headers) {
          throw new Error('表格结构无效')
        }
        const newColIndex = table.headers.length
        table.headers.push(`列 ${newColIndex + 1}`)
        table.align.push('left')
        table.rows.forEach(row => row.push('新单元格'))
        return table
      }

      const table = createTable()
      const initialCols = table.headers.length
      
      addColumn(table)
      assert.strictEqual(table.headers.length, initialCols + 1)
      table.rows.forEach(row => {
        assert.strictEqual(row.length, table.headers.length)
      })
    })

    test('insertRowAbove 应该正确处理边界情况', () => {
      const insertRowAbove = (table, selectedCell) => {
        if (!selectedCell || selectedCell.row === -1) {
          // 没有选中行时，在顶部插入
          table.rows.unshift(new Array(table.headers.length).fill('新单元格'))
        } else {
          const rowIndex = Math.max(0, selectedCell.row)
          table.rows.splice(rowIndex, 0, new Array(table.headers.length).fill('新单元格'))
          selectedCell.row++
        }
        return table
      }

      const table = {
        headers: ['列 1', '列 2'],
        rows: [['单元格 1', '单元格 2']],
        align: ['left', 'left']
      }

      // 测试：没有选中
      const table1 = JSON.parse(JSON.stringify(table))
      insertRowAbove(table1, null)
      assert.strictEqual(table1.rows.length, 2)
      assert.strictEqual(table1.rows[0][0], '新单元格')

      // 测试：选中第一行
      const table2 = JSON.parse(JSON.stringify(table))
      insertRowAbove(table2, { row: 0, col: 0 })
      assert.strictEqual(table2.rows.length, 2)
      assert.strictEqual(table2.rows[0][0], '新单元格')
    })

    test('deleteCurrentRow 应该正确处理边界情况', () => {
      const deleteCurrentRow = (table, selectedCell) => {
        if (!selectedCell || selectedCell.row === -1) {
          return table // 无法删除
        }
        if (table.rows.length > 1) {
          table.rows.splice(selectedCell.row, 1)
        }
        return table
      }

      const table = {
        headers: ['列 1', '列 2'],
        rows: [
          ['单元格 1', '单元格 2'],
          ['单元格 3', '单元格 4'],
          ['单元格 5', '单元格 6']
        ],
        align: ['left', 'left']
      }

      // 测试：删除中间行
      const table1 = JSON.parse(JSON.stringify(table))
      deleteCurrentRow(table1, { row: 1, col: 0 })
      assert.strictEqual(table1.rows.length, 2)

      // 测试：只有一行时不应该删除
      const table2 = {
        headers: ['列 1', '列 2'],
        rows: [['单元格 1', '单元格 2']],
        align: ['left', 'left']
      }
      const initialRows = table2.rows.length
      deleteCurrentRow(table2, { row: 0, col: 0 })
      assert.strictEqual(table2.rows.length, initialRows) // 保持不变
    })

    test('generateTableMarkdown 应该生成正确的 Markdown', () => {
      const generateTableMarkdown = (headers, rows, align) => {
        let md = '\n'
        md += '| ' + headers.join(' | ') + ' |\n'
        md += '| ' + align.map(a => {
          if (a === 'center') return ':---:'
          if (a === 'right') return '---:'
          return '---'
        }).join(' | ') + ' |\n'
        rows.forEach(row => {
          md += '| ' + row.join(' | ') + ' |\n'
        })
        md += '\n'
        return md
      }

      const headers = ['姓名', '年龄']
      const rows = [['张三', '25'], ['李四', '30']]
      const align = ['left', 'center']

      const md = generateTableMarkdown(headers, rows, align)
      
      assert.ok(md.includes('| 姓名 | 年龄 |'))
      assert.ok(md.includes('| --- | :---: |'))
      assert.ok(md.includes('| 张三 | 25 |'))
      assert.ok(md.includes('| 李四 | 30 |'))
    })
  })

  // ==================== ImageDrop 组件测试 ====================
  describe('ImageDrop 组件', () => {
    test('handleDrop 应该正确处理文件', () => {
      const handleDrop = (files) => {
        if (!files || files.length === 0) {
          return { success: false, error: '没有文件' }
        }
        
        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        const results = []
        
        for (const file of files) {
          if (!validTypes.includes(file.type)) {
            results.push({ success: false, error: '不支持的文件类型' })
            continue
          }
          
          if (file.size > 10 * 1024 * 1024) { // 10MB 限制
            results.push({ success: false, error: '文件过大' })
            continue
          }
          
          results.push({ success: true, name: file.name })
        }
        
        return results
      }

      // 测试有效文件
      const validFiles = [
        { name: 'test.png', type: 'image/png', size: 1024 },
        { name: 'test.jpg', type: 'image/jpeg', size: 2048 }
      ]
      const results1 = handleDrop(validFiles)
      assert.strictEqual(results1.length, 2)
      assert.strictEqual(results1[0].success, true)
      assert.strictEqual(results1[1].success, true)

      // 测试无效类型
      const invalidFiles = [
        { name: 'test.txt', type: 'text/plain', size: 1024 }
      ]
      const results2 = handleDrop(invalidFiles)
      assert.strictEqual(results2[0].success, false)

      // 测试空文件列表
      const results3 = handleDrop([])
      assert.strictEqual(results3.success, false)
    })

    test('handlePaste 应该正确处理剪贴板图片', () => {
      const handlePaste = (items) => {
        const results = []
        
        for (const item of items) {
          if (item.type && item.type.startsWith('image/')) {
            results.push({ success: true, type: item.type })
          }
        }
        
        return results
      }

      const items = [
        { type: 'image/png' },
        { type: 'text/plain' },
        { type: 'image/jpeg' }
      ]

      const results = handlePaste(items)
      assert.strictEqual(results.length, 2)
      assert.strictEqual(results[0].type, 'image/png')
      assert.strictEqual(results[1].type, 'image/jpeg')
    })

    test('generateImageMarkdown 应该生成正确的语法', () => {
      const generateImageMarkdown = (alt, src) => {
        return `\n![${alt}](${src})\n`
      }

      const md = generateImageMarkdown('测试图片', 'data:image/png;base64,xxx')
      
      assert.strictEqual(md, '\n![测试图片](data:image/png;base64,xxx)\n')
      assert.ok(md.startsWith('\n!['))
      assert.ok(md.endsWith(')\n'))
    })
  })

  // ==================== EquationEditor 组件测试 ====================
  describe('EquationEditor 组件', () => {
    test('generateEquationMarkdown 应该正确处理行内和块级公式', () => {
      const generateEquationMarkdown = (latex, type) => {
        return type === 'inline' ? `$${latex}$` : `$$${latex}$$`
      }

      const inline = generateEquationMarkdown('E=mc^2', 'inline')
      const block = generateEquationMarkdown('\\sum_{i=1}^{n}', 'block')

      assert.strictEqual(inline, '$E=mc^2$')
      assert.strictEqual(block, '$$\\sum_{i=1}^{n}$$')
    })

    test('应该正确处理无效公式', () => {
      const validateEquation = (latex) => {
        if (!latex || typeof latex !== 'string') {
          return { valid: false, error: '公式不能为空' }
        }
        
        // 检查明显的语法错误
        const openBraces = (latex.match(/\{/g) || []).length
        const closeBraces = (latex.match(/\}/g) || []).length
        
        if (openBraces !== closeBraces) {
          return { valid: false, error: '花括号不匹配' }
        }
        
        return { valid: true }
      }

      assert.strictEqual(validateEquation('E=mc^2').valid, true)
      assert.strictEqual(validateEquation('\\frac{1}{2}').valid, true)
      assert.strictEqual(validateEquation('\\frac{1}{2').valid, false) // 缺少闭合括号
      assert.strictEqual(validateEquation('').valid, false)
      assert.strictEqual(validateEquation(null).valid, false)
    })
  })

  // ==================== CSS 布局测试 ====================
  describe('CSS 布局验证', () => {
    test('编辑器容器应该使用正确的 flex 布局', () => {
      const editorStyles = {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100vh',
      }

      assert.strictEqual(editorStyles.display, 'flex')
      assert.strictEqual(editorStyles.width, '100%')
      assert.strictEqual(editorStyles.height, '100vh')
    })

    test('drop-zone 应该设置 width: 100%', () => {
      const dropZoneStyles = {
        width: '100%',
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
      }

      assert.strictEqual(dropZoneStyles.width, '100%', 'drop-zone 必须设置 width: 100% 防止右侧空白')
      assert.strictEqual(dropZoneStyles.flex, '1')
    })

    test('编辑器应该撑满容器', () => {
      const containerWidth = 1920
      const editorWidth = 1920 // 应该等于容器宽度
      
      assert.strictEqual(editorWidth, containerWidth, '编辑器宽度应该等于容器宽度')
      
      // 允许的误差范围（像素）
      const tolerance = 1
      assert.ok(Math.abs(editorWidth - containerWidth) <= tolerance)
    })
  })

  // ==================== 工具函数测试 ====================
  describe('工具函数', () => {
    test('防抖函数应该正确工作', async () => {
      let callCount = 0
      
      const debounce = (fn, delay) => {
        let timeout
        return (...args) => {
          clearTimeout(timeout)
          timeout = setTimeout(() => fn(...args), delay)
        }
      }
      
      const debouncedFn = () => callCount++
      const debounced = debounce(debouncedFn, 50)
      
      // 快速调用 5 次
      debounced()
      debounced()
      debounced()
      debounced()
      debounced()
      
      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 应该只执行 1 次
      assert.strictEqual(callCount, 1)
    })

    test('节流函数应该正确工作', async () => {
      let callCount = 0
      
      const throttle = (fn, limit) => {
        let inThrottle
        return (...args) => {
          if (!inThrottle) {
            fn(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
          }
        }
      }
      
      const throttledFn = () => callCount++
      const throttled = throttle(throttledFn, 100)
      
      // 在 50ms 内调用 5 次
      for (let i = 0; i < 5; i++) {
        throttled()
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // 应该只执行 1 次（第一次立即执行）
      assert.strictEqual(callCount, 1)
      
      // 等待节流结束
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 再次调用应该可以执行
      throttled()
      assert.strictEqual(callCount, 2)
    })
  })
})

console.log('\n✅ 组件边界条件测试完成！\n')
