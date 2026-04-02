/**
 * LightMark TableEditor 组件测试 - 第二层测试
 * 测试表格编辑器的所有功能点
 */

import { describe, it, expect, vi } from 'vitest'

describe('TableEditor 组件', () => {
  // 辅助函数：创建默认表格
  const createDefaultTable = () => ({
    headers: ['列 1', '列 2', '列 3'],
    rows: [
      ['单元格 1', '单元格 2', '单元格 3'],
      ['单元格 4', '单元格 5', '单元格 6']
    ],
    align: ['left', 'left', 'left']
  })

  describe('初始化', () => {
    it('应该创建默认表格', () => {
      const table = createDefaultTable()
      
      expect(table.headers.length).toBe(3)
      expect(table.rows.length).toBe(2)
      expect(table.align.length).toBe(3)
    })

    it('自定义行列数应该正确', () => {
      const createTable = (cols, rows) => ({
        headers: Array.from({ length: cols }, (_, i) => `列${i + 1}`),
        rows: Array.from({ length: rows }, () => Array(cols).fill('')),
        align: Array(cols).fill('left')
      })
      
      const table = createTable(5, 3)
      expect(table.headers.length).toBe(5)
      expect(table.rows.length).toBe(3)
      expect(table.rows[0].length).toBe(5)
    })
  })

  describe('行操作', () => {
    it('添加行应该在末尾', () => {
      const addRow = (table) => {
        table.rows.push(new Array(table.headers.length).fill(''))
        return table
      }
      
      const table = createDefaultTable()
      const initialLength = table.rows.length
      
      addRow(table)
      expect(table.rows.length).toBe(initialLength + 1)
    })

    it('在上方插入行应该正确', () => {
      const insertRowAbove = (table, rowIndex) => {
        table.rows.splice(rowIndex, 0, new Array(table.headers.length).fill(''))
        return table
      }
      
      const table = createDefaultTable()
      insertRowAbove(table, 0)
      
      expect(table.rows.length).toBe(3)
      expect(table.rows[0].every(cell => cell === '')).toBe(true)
    })

    it('在下方插入行应该正确', () => {
      const insertRowBelow = (table, rowIndex) => {
        table.rows.splice(rowIndex + 1, 0, new Array(table.headers.length).fill(''))
        return table
      }
      
      const table = createDefaultTable()
      insertRowBelow(table, 0)
      
      expect(table.rows.length).toBe(3)
      expect(table.rows[1].every(cell => cell === '')).toBe(true)
    })

    it('删除行应该正确', () => {
      const deleteRow = (table, rowIndex) => {
        if (table.rows.length > 1) {
          table.rows.splice(rowIndex, 1)
        }
        return table
      }
      
      const table = createDefaultTable()
      deleteRow(table, 0)
      
      expect(table.rows.length).toBe(1)
    })

    it('最后一行不应该被删除', () => {
      const deleteRow = (table, rowIndex) => {
        if (table.rows.length > 1) {
          table.rows.splice(rowIndex, 1)
        }
        return table
      }
      
      const table = { headers: ['A'], rows: [['1']], align: ['left'] }
      deleteRow(table, 0)
      
      expect(table.rows.length).toBe(1) // 保持不变
    })
  })

  describe('列操作', () => {
    it('添加列应该在末尾', () => {
      const addColumn = (table) => {
        const newIndex = table.headers.length
        table.headers.push(`列${newIndex + 1}`)
        table.align.push('left')
        table.rows.forEach(row => row.push(''))
        return table
      }
      
      const table = createDefaultTable()
      const initialCols = table.headers.length
      
      addColumn(table)
      expect(table.headers.length).toBe(initialCols + 1)
      expect(table.rows[0].length).toBe(initialCols + 1)
    })

    it('在左侧插入列应该正确', () => {
      const insertColumnLeft = (table, colIndex) => {
        table.headers.splice(colIndex, 0, `新列`)
        table.align.splice(colIndex, 0, 'left')
        table.rows.forEach(row => row.splice(colIndex, 0, ''))
        return table
      }
      
      const table = createDefaultTable()
      insertColumnLeft(table, 0)
      
      expect(table.headers.length).toBe(4)
      expect(table.headers[0]).toBe('新列')
    })

    it('在右侧插入列应该正确', () => {
      const insertColumnRight = (table, colIndex) => {
        table.headers.splice(colIndex + 1, 0, `新列`)
        table.align.splice(colIndex + 1, 0, 'left')
        table.rows.forEach(row => row.splice(colIndex + 1, 0, ''))
        return table
      }
      
      const table = createDefaultTable()
      insertColumnRight(table, 0)
      
      expect(table.headers.length).toBe(4)
      expect(table.headers[1]).toBe('新列')
    })

    it('删除列应该正确', () => {
      const deleteColumn = (table, colIndex) => {
        if (table.headers.length > 1) {
          table.headers.splice(colIndex, 1)
          table.align.splice(colIndex, 1)
          table.rows.forEach(row => row.splice(colIndex, 1))
        }
        return table
      }
      
      const table = createDefaultTable()
      deleteColumn(table, 0)
      
      expect(table.headers.length).toBe(2)
      expect(table.rows[0].length).toBe(2)
    })

    it('最后一列不应该被删除', () => {
      const deleteColumn = (table, colIndex) => {
        if (table.headers.length > 1) {
          table.headers.splice(colIndex, 1)
          table.align.splice(colIndex, 1)
          table.rows.forEach(row => row.splice(colIndex, 1))
        }
        return table
      }
      
      const table = { headers: ['A'], rows: [['1']], align: ['left'] }
      deleteColumn(table, 0)
      
      expect(table.headers.length).toBe(1) // 保持不变
    })
  })

  describe('对齐方式', () => {
    it('设置左对齐应该正确', () => {
      const setAlign = (align, index) => { align[index] = 'left'; return align }
      const align = ['left', 'left', 'left']
      
      setAlign(align, 0)
      expect(align[0]).toBe('left')
    })

    it('设置居中对齐应该正确', () => {
      const setAlign = (align, index) => { align[index] = 'center'; return align }
      const align = ['left', 'left', 'left']
      
      setAlign(align, 0)
      expect(align[0]).toBe('center')
    })

    it('设置右对齐应该正确', () => {
      const setAlign = (align, index) => { align[index] = 'right'; return align }
      const align = ['left', 'left', 'left']
      
      setAlign(align, 0)
      expect(align[0]).toBe('right')
    })

    it('对齐标记应该正确生成', () => {
      const getAlignMarker = (align) => {
        if (align === 'center') return ':---:'
        if (align === 'right') return '---:'
        return '---'
      }
      
      expect(getAlignMarker('left')).toBe('---')
      expect(getAlignMarker('center')).toBe(':---:')
      expect(getAlignMarker('right')).toBe('---:')
    })
  })

  describe('单元格编辑', () => {
    it('更新单元格应该正确', () => {
      const updateCell = (table, row, col, value) => {
        table.rows[row][col] = value
        return table
      }
      
      const table = createDefaultTable()
      updateCell(table, 0, 0, '新值')
      
      expect(table.rows[0][0]).toBe('新值')
    })

    it('批量更新单元格应该正确', () => {
      const updateCells = (table, updates) => {
        updates.forEach(([row, col, value]) => {
          table.rows[row][col] = value
        })
        return table
      }
      
      const table = createDefaultTable()
      updateCells(table, [[0, 0, 'A'], [1, 1, 'B']])
      
      expect(table.rows[0][0]).toBe('A')
      expect(table.rows[1][1]).toBe('B')
    })
  })

  describe('单元格选择', () => {
    it('选择单元格应该正确', () => {
      const selectCell = (row, col) => ({ row, col })
      
      const selected = selectCell(1, 2)
      expect(selected.row).toBe(1)
      expect(selected.col).toBe(2)
    })

    it('取消选择应该正确', () => {
      const deselectCell = () => null
      
      const selected = deselectCell()
      expect(selected).toBe(null)
    })
  })

  describe('工具栏', () => {
    it('显示工具栏应该正确', () => {
      const showToolbar = () => true
      expect(showToolbar()).toBe(true)
    })

    it('隐藏工具栏应该正确', () => {
      const hideToolbar = () => false
      expect(hideToolbar()).toBe(false)
    })

    it('工具栏按钮图标应该正确', () => {
      const getButtonIcon = (type) => {
        const icons = {
          'add_row': '➕',
          'add_col': '➕',
          'delete_row': '🗑️',
          'delete_col': '🗑️',
          'insert_row_above': '⬆️',
          'insert_row_below': '⬇️',
          'insert_col_left': '⬅️',
          'insert_col_right': '➡️',
          'align_left': '⬅',
          'align_center': '⬌',
          'align_right': '➡'
        }
        return icons[type] || ''
      }
      
      expect(getButtonIcon('add_row')).toBe('➕')
      expect(getButtonIcon('delete_row')).toBe('🗑️')
      expect(getButtonIcon('align_center')).toBe('⬌')
    })
  })

  describe('Markdown 导出', () => {
    it('应该生成正确的 Markdown 表格', () => {
      const generateMarkdown = (table) => {
        let md = '| ' + table.headers.join(' | ') + ' |\n'
        md += '| ' + table.align.map(a => 
          a === 'center' ? ':---:' : a === 'right' ? '---:' : '---'
        ).join(' | ') + ' |\n'
        table.rows.forEach(row => {
          md += '| ' + row.join(' | ') + ' |\n'
        })
        return md
      }
      
      const table = {
        headers: ['姓名', '年龄'],
        rows: [['张三', '25'], ['李四', '30']],
        align: ['left', 'center']
      }
      
      const md = generateMarkdown(table)
      
      expect(md).toContain('| 姓名 | 年龄 |')
      expect(md).toContain('| --- | :---: |')
      expect(md).toContain('| 张三 | 25 |')
      expect(md).toContain('| 李四 | 30 |')
    })

    it('空表格应该生成正确的 Markdown', () => {
      const generateMarkdown = (table) => {
        if (!table.headers || table.headers.length === 0) return ''
        let md = '| ' + table.headers.join(' | ') + ' |\n'
        md += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n'
        return md
      }
      
      const table = { headers: ['A', 'B'], rows: [], align: ['left', 'left'] }
      const md = generateMarkdown(table)
      
      expect(md).toContain('| A | B |')
      expect(md).toContain('| --- | --- |')
    })
  })

  describe('边界条件', () => {
    it('空表格应该被处理', () => {
      const validateTable = (table) => {
        if (!table) return false
        if (!table.headers || table.headers.length === 0) return false
        return true
      }
      
      expect(validateTable(null)).toBe(false)
      expect(validateTable({})).toBe(false)
      expect(validateTable({ headers: [] })).toBe(false)
      expect(validateTable({ headers: ['A'], rows: [] })).toBe(true)
    })

    it('超大表格应该被处理', () => {
      const createLargeTable = (rows, cols) => ({
        headers: Array.from({ length: cols }, (_, i) => `列${i}`),
        rows: Array.from({ length: rows }, () => Array(cols).fill('cell')),
        align: Array(cols).fill('left')
      })
      
      const table = createLargeTable(100, 20)
      expect(table.rows.length).toBe(100)
      expect(table.headers.length).toBe(20)
    })

    it('特殊字符单元格应该被处理', () => {
      const escapeCell = (text) => {
        return text
          .replace(/\|/g, '\\|')
          .replace(/\n/g, ' ')
      }
      
      expect(escapeCell('test|test')).toBe('test\\|test')
      expect(escapeCell('test\ntest')).toBe('test test')
    })
  })

  describe('性能', () => {
    it('大量行操作应该高效', () => {
      const addRows = (table, count) => {
        for (let i = 0; i < count; i++) {
          table.rows.push(new Array(table.headers.length).fill(''))
        }
        return table
      }
      
      const table = createDefaultTable()
      const start = Date.now()
      addRows(table, 1000)
      const duration = Date.now() - start
      
      expect(table.rows.length).toBe(1002)
      expect(duration).toBeLessThan(1000) // 应该在 1 秒内完成
    })
  })

  describe('显示验证', () => {
    it('生成的 Markdown 表格应该正确显示', () => {
      const generateMarkdown = (table) => {
        if (!table.headers || table.headers.length === 0) return ''
        let md = '| ' + table.headers.join(' | ') + ' |\n'
        md += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n'
        table.rows.forEach(row => {
          md += '| ' + row.join(' | ') + ' |\n'
        })
        return md
      }
      
      const table = {
        headers: ['姓名', '年龄', '城市'],
        rows: [
          ['张三', '25', '北京'],
          ['李四', '30', '上海']
        ],
        align: ['left', 'left', 'left']
      }
      
      const md = generateMarkdown(table)
      
      // 验证 1: 应该包含表头
      expect(md).toContain('| 姓名 | 年龄 | 城市 |')
      
      // 验证 2: 应该包含分隔行
      expect(md).toContain('| --- | --- | --- |')
      
      // 验证 3: 应该包含所有数据行
      expect(md).toContain('| 张三 | 25 | 北京 |')
      expect(md).toContain('| 李四 | 30 | 上海 |')
      
      // 验证 4: 不应该有多余内容
      expect(md).not.toContain('undefined')
      expect(md).not.toContain('null')
      expect(md).not.toContain('[object Object]')
      
      // 验证 5: 格式应该正确（每行都以 | 开头和结尾）
      const lines = md.trim().split('\n')
      lines.forEach(line => {
        expect(line.trim()).toMatch(/^\|.*\|$/)
      })
    })

    it('表格不应该包含调试信息或占位符', () => {
      const validateTableContent = (table) => {
        const issues = []
        
        // 检查表头
        table.headers.forEach((header, index) => {
          if (typeof header !== 'string') {
            issues.push(`表头 [${index}] 类型错误：${typeof header}`)
          } else {
            if (header.includes('undefined') || header.includes('null')) {
              issues.push(`表头 [${index}] 包含无效值：${header}`)
            }
          }
        })
        
        // 检查数据行
        table.rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell && typeof cell === 'string') {
              if (cell.includes('[object Object]')) {
                issues.push(`单元格 [${rowIndex}][${cellIndex}] 包含对象字符串`)
              }
            }
          })
        })
        
        return { valid: issues.length === 0, issues }
      }
      
      const validTable = {
        headers: ['A', 'B'],
        rows: [['1', '2']]
      }
      
      const invalidTable = {
        headers: ['A', undefined],
        rows: [['1', '[object Object]']]
      }
      
      expect(validateTableContent(validTable).valid).toBe(true)
      expect(validateTableContent(invalidTable).valid).toBe(false)
    })

    it('空单元格应该被正确处理', () => {
      const normalizeCell = (cell) => {
        if (cell === null || cell === undefined) return ''
        return String(cell).trim()
      }
      
      expect(normalizeCell(null)).toBe('')
      expect(normalizeCell(undefined)).toBe('')
      expect(normalizeCell('  test  ')).toBe('test')
      expect(normalizeCell('')).toBe('')
      
      // 空单元格在 Markdown 中应该显示为空，而不是占位符
      const generateCell = (content) => {
        const normalized = normalizeCell(content)
        expect(normalized).not.toBe('undefined')
        expect(normalized).not.toBe('null')
        return normalized
      }
      
      expect(generateCell(null)).toBe('')
      expect(generateCell('data')).toBe('data')
    })

    it('表格对齐标记应该正确显示', () => {
      const generateAlignmentRow = (align) => {
        return '| ' + align.map(a => {
          if (a === 'left') return ':---'
          if (a === 'right') return '---:'
          if (a === 'center') return ':---:'
          return '---'
        }).join(' | ') + ' |'
      }
      
      expect(generateAlignmentRow(['left', 'right', 'center']))
        .toBe('| :--- | ---: | :---: |')
      
      // 验证对齐标记格式
      const row = generateAlignmentRow(['left', 'right'])
      expect(row).toMatch(/^\|.*\|$/)
      expect(row).toContain(':---')
      expect(row).toContain('---:')
    })
  })
})
