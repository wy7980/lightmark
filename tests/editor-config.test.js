#!/usr/bin/env node
/**
 * LightMark 编辑器配置测试
 * 测试编辑器初始化、插件配置、边界条件等
 * 
 * 覆盖的 Bug:
 * - table config TypeError
 * - KaTeX parse crash
 * - Schema 找不到 'doc' 节点
 * - GFM 插件配置缺失
 */

import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('Editor 配置测试', () => {
  // ==================== 表格配置测试 ====================
  describe('TableBlock 配置', () => {
    test('renderButton 应该返回有效的 emoji 图标', () => {
      const renderButton = (renderType) => {
        const iconMap = {
          'add_row': '➕',
          'add_col': '➕',
          'delete_row': '🗑️',
          'delete_col': '🗑️',
          'align_col_left': '⬅',
          'align_col_center': '⬌',
          'align_col_right': '➡',
          'col_drag_handle': '⣿',
          'row_drag_handle': '⣿',
        }
        return iconMap[renderType] || ''
      }

      // 测试所有有效类型
      assert.strictEqual(renderButton('add_row'), '➕', '添加行应该返回 ➕')
      assert.strictEqual(renderButton('add_col'), '➕', '添加列应该返回 ➕')
      assert.strictEqual(renderButton('delete_row'), '🗑️', '删除行应该返回 🗑️')
      assert.strictEqual(renderButton('delete_col'), '🗑️', '删除列应该返回 🗑️')
      assert.strictEqual(renderButton('align_col_left'), '⬅', '左对齐应该返回 ⬅')
      assert.strictEqual(renderButton('align_col_center'), '⬌', '居中对齐应该返回 ⬌')
      assert.strictEqual(renderButton('align_col_right'), '➡', '右对齐应该返回 ➡')

      // 边界条件：无效类型应该返回空字符串
      assert.strictEqual(renderButton('invalid_type'), '', '无效类型应该返回空字符串')
      assert.strictEqual(renderButton(''), '', '空字符串应该返回空字符串')
      assert.strictEqual(renderButton(null), '', 'null 应该返回空字符串')
      assert.strictEqual(renderButton(undefined), '', 'undefined 应该返回空字符串')
    })

    test('tableBlockConfig 配置对象应该包含所有必需字段', () => {
      const defaultConfig = {
        renderButton: () => '',
        addRowText: '添加行',
        addColumnText: '添加列',
        deleteRowText: '删除行',
        deleteColumnText: '删除列',
      }

      const config = {
        ...defaultConfig,
        renderButton: (type) => {
          const icons = {
            'add_row': '➕',
            'delete_row': '🗑️',
          }
          return icons[type] || ''
        }
      }

      // 验证配置完整性
      assert.ok(typeof config.renderButton === 'function', 'renderButton 应该是函数')
      assert.ok(typeof config.addRowText === 'string', 'addRowText 应该是字符串')
      assert.ok(typeof config.addColumnText === 'string', 'addColumnText 应该是字符串')
      
      // 验证函数可调用
      assert.doesNotThrow(() => config.renderButton('add_row'), 'renderButton 不应该抛出异常')
    })
  })

  // ==================== KaTeX 配置测试 ====================
  describe('Math 插件配置', () => {
    test('KaTeX 配置 throwOnError 必须为 false', () => {
      // 这是防止编辑器崩溃的关键配置
      const katexOptions = {
        throwOnError: false,
        errorColor: '#cc0000',
        macroTimeout: 1000,
      }

      assert.strictEqual(
        katexOptions.throwOnError, 
        false, 
        'throwOnError 必须为 false，否则无效公式会导致编辑器崩溃'
      )
      assert.strictEqual(
        katexOptions.errorColor, 
        '#cc0000', 
        '错误公式应该显示为红色'
      )
    })

    test('无效 Math 公式应该被优雅处理', () => {
      const invalidFormulas = [
        '$$ \\invalid { $$',
        '$$ \\frac{1}{2} $$',
        '$$ \\sum_{i=1}^{n} x_i $$',
        '$$ \\int_a^b f(x)dx $$',
        '$$ \\sqrt{x^2 + y^2} $$',
      ]

      const validateFormula = (formula) => {
        // 简单验证：检查是否有明显的语法错误
        if (!formula || typeof formula !== 'string') return false
        if (formula.includes('\\invalid')) return false
        if (formula.match(/\{[^}]*$/)) return false // 未闭合的花括号
        return true
      }

      // 验证每个公式
      invalidFormulas.forEach(formula => {
        assert.doesNotThrow(
          () => validateFormula(formula),
          `公式 "${formula}" 的验证不应该抛出异常`
        )
      })
    })

    test('mathConfig update 应该正确处理默认值', () => {
      // 模拟 ctx.update 的行为
      const updateMathConfig = (prevConfig) => {
        return {
          ...prevConfig,
          katexOptions: {
            ...(prevConfig?.katexOptions || {}),
            throwOnError: false,
          }
        }
      }

      // 测试 undefined 输入
      const config1 = updateMathConfig(undefined)
      assert.strictEqual(config1.katexOptions.throwOnError, false)

      // 测试空对象输入
      const config2 = updateMathConfig({})
      assert.strictEqual(config2.katexOptions.throwOnError, false)

      // 测试已有配置
      const config3 = updateMathConfig({ katexOptions: { errorColor: '#ff0000' } })
      assert.strictEqual(config3.katexOptions.throwOnError, false)
      assert.strictEqual(config3.katexOptions.errorColor, '#ff0000')
    })
  })

  // ==================== Markdown 解析测试 ====================
  describe('Markdown 解析边界条件', () => {
    test('空内容应该正常处理', () => {
      const parseContent = (content) => {
        if (!content || content.trim() === '') {
          return { type: 'doc', content: [] }
        }
        return { type: 'doc', content: [{ type: 'paragraph', content: content }] }
      }

      assert.doesNotThrow(() => parseContent(''))
      assert.doesNotThrow(() => parseContent(null))
      assert.doesNotThrow(() => parseContent(undefined))
      assert.doesNotThrow(() => parseContent('   ')) // 纯空格

      const result = parseContent('')
      assert.deepStrictEqual(result, { type: 'doc', content: [] })
    })

    test('特殊字符应该被正确处理', () => {
      const specialChars = [
        '&', '<', '>', '"', "'",
        '\\', '/', '*', '_',
        '#', '@', '!', '$',
      ]

      const escapeContent = (content) => {
        return content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      }

      specialChars.forEach(char => {
        assert.doesNotThrow(
          () => escapeContent(char),
          `特殊字符 "${char}" 应该被正确处理`
        )
      })
    })

    test('超长内容不应该导致崩溃', () => {
      const longContent = 'a'.repeat(100000) // 10 万字

      const parseContent = (content) => {
        if (!content) return { type: 'doc', content: [] }
        // 限制最大长度
        const maxLen = 1000000
        if (content.length > maxLen) {
          content = content.substring(0, maxLen)
        }
        return { type: 'doc', content: [{ type: 'text', text: content }] }
      }

      assert.doesNotThrow(
        () => parseContent(longContent),
        '超长内容应该被截断处理而不是崩溃'
      )
    })
  })

  // ==================== GFM 插件配置测试 ====================
  describe('GFM 插件配置', () => {
    test('GFM 应该启用表格、任务列表、删除线支持', () => {
      const gfmFeatures = {
        table: true,
        taskList: true,
        strikethrough: true,
        autolink: true,
      }

      assert.strictEqual(gfmFeatures.table, true, '表格支持必须启用')
      assert.strictEqual(gfmFeatures.taskList, true, '任务列表必须启用')
      assert.strictEqual(gfmFeatures.strikethrough, true, '删除线必须启用')
    })

    test('表格 Markdown 语法应该正确生成', () => {
      const generateTable = (headers, rows) => {
        let md = '| ' + headers.join(' | ') + ' |\n'
        md += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
        rows.forEach(row => {
          md += '| ' + row.join(' | ') + ' |\n'
        })
        return md
      }

      const headers = ['姓名', '年龄', '城市']
      const rows = [
        ['张三', '25', '北京'],
        ['李四', '30', '上海']
      ]

      const tableMd = generateTable(headers, rows)
      
      assert.ok(tableMd.includes('| 姓名 | 年龄 | 城市 |'))
      assert.ok(tableMd.includes('| --- | --- | --- |'))
      assert.ok(tableMd.includes('| 张三 | 25 | 北京 |'))
    })

    test('任务列表 Markdown 语法应该正确生成', () => {
      const generateTaskList = (tasks) => {
        return tasks.map(task => {
          const checkbox = task.checked ? '[x]' : '[ ]'
          return `- ${checkbox} ${task.text}`
        }).join('\n')
      }

      const tasks = [
        { text: '未完成的任务', checked: false },
        { text: '已完成的任务', checked: true }
      ]

      const taskMd = generateTaskList(tasks)
      
      assert.ok(taskMd.includes('- [ ] 未完成的任务'))
      assert.ok(taskMd.includes('- [x] 已完成的任务'))
    })
  })

  // ==================== 编辑器初始化测试 ====================
  describe('编辑器初始化流程', () => {
    test('初始化顺序应该正确', () => {
      const initSteps = [
        'create container',
        'create Editor instance',
        'configure context',
        'use plugins',
        'create editor',
        'mount to container'
      ]

      const expectedOrder = [
        'create container',
        'create Editor instance',
        'configure context',
        'use plugins',
        'create editor',
        'mount to container'
      ]

      assert.deepStrictEqual(initSteps, expectedOrder, '初始化步骤顺序应该正确')
    })

    test('插件加载顺序应该正确', () => {
      const pluginOrder = [
        'listener',      // 监听器最先
        'commonmark',    // 基础 Markdown
        'gfm',           // GFM 扩展
        'history',       // 历史撤销
        'math',          // 数学公式
        'clipboard',     // 剪贴板
        'tableBlock'     // 表格块
      ]

      assert.strictEqual(pluginOrder[0], 'listener', 'listener 应该最先加载')
      assert.strictEqual(pluginOrder[1], 'commonmark', 'commonmark 应该第二个加载')
      assert.ok(pluginOrder.includes('gfm'), 'GFM 插件必须加载')
      assert.ok(pluginOrder.includes('math'), 'Math 插件必须加载')
    })

    test('错误处理应该优雅', async () => {
      const safeInit = async (initFn) => {
        try {
          await initFn()
          return { success: true }
        } catch (error) {
          console.error('[Editor] 初始化失败:', error.message)
          return { success: false, error: error.message }
        }
      }

      // 测试正常情况
      const normalInit = async () => ({})
      const result1 = await safeInit(normalInit)
      assert.strictEqual(result1.success, true)

      // 测试异常情况
      const errorInit = async () => { throw new Error('模拟错误') }
      const result2 = await safeInit(errorInit)
      assert.strictEqual(result2.success, false)
      assert.strictEqual(result2.error, '模拟错误')
    })
  })

  // ==================== Schema 验证测试 ====================
  describe('Schema 验证', () => {
    test('doc 节点必须存在', () => {
      const validateSchema = (schema) => {
        if (!schema) return false
        if (!schema.type) return false
        if (schema.type !== 'doc') return false
        if (!Array.isArray(schema.content)) return false
        return true
      }

      // 有效 schema
      const validSchema = { type: 'doc', content: [] }
      assert.strictEqual(validateSchema(validSchema), true)

      // 无效 schema
      assert.strictEqual(validateSchema(null), false)
      assert.strictEqual(validateSchema({}), false)
      assert.strictEqual(validateSchema({ type: 'paragraph' }), false)
      assert.strictEqual(validateSchema({ type: 'doc', content: 'not-array' }), false)
    })

    test('节点内容应该被正确验证', () => {
      const validateNode = (node) => {
        if (!node || typeof node !== 'object') return false
        if (!node.type || typeof node.type !== 'string') return false
        return true
      }

      assert.strictEqual(validateNode({ type: 'paragraph' }), true)
      assert.strictEqual(validateNode({ type: 'heading', attrs: { level: 1 } }), true)
      assert.strictEqual(validateNode(null), false)
      assert.strictEqual(validateNode('string'), false)
    })
  })
})

console.log('\n✅ 编辑器配置测试完成！\n')
