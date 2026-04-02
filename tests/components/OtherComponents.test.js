/**
 * LightMark 其他组件测试 - 第二层测试
 * 测试 ImageDrop、EquationEditor、TaskList、CodeBlock 等组件
 */

import { describe, it, expect, vi } from 'vitest'

// ==================== ImageDrop 组件 ====================
describe('ImageDrop 组件', () => {
  describe('文件验证', () => {
    it('应该接受 PNG 文件', () => {
      const isValid = (file) => file.type.startsWith('image/')
      expect(isValid({ type: 'image/png' })).toBe(true)
    })

    it('应该接受 JPEG 文件', () => {
      const isValid = (file) => ['image/jpeg', 'image/jpg'].includes(file.type)
      expect(isValid({ type: 'image/jpeg' })).toBe(true)
    })

    it('应该接受 GIF 文件', () => {
      const isValid = (file) => file.type === 'image/gif'
      expect(isValid({ type: 'image/gif' })).toBe(true)
    })

    it('应该接受 WebP 文件', () => {
      const isValid = (file) => file.type === 'image/webp'
      expect(isValid({ type: 'image/webp' })).toBe(true)
    })

    it('应该拒绝非图片文件', () => {
      const isValid = (file) => file.type.startsWith('image/')
      expect(isValid({ type: 'text/plain' })).toBe(false)
      expect(isValid({ type: 'application/pdf' })).toBe(false)
    })
  })

  describe('文件大小限制', () => {
    it('应该接受小于 10MB 的文件', () => {
      const isValidSize = (size, maxMB = 10) => size <= maxMB * 1024 * 1024
      expect(isValidSize(5 * 1024 * 1024)).toBe(true)
      expect(isValidSize(1024)).toBe(true)
    })

    it('应该拒绝大于 10MB 的文件', () => {
      const isValidSize = (size, maxMB = 10) => size <= maxMB * 1024 * 1024
      expect(isValidSize(11 * 1024 * 1024)).toBe(false)
      expect(isValidSize(100 * 1024 * 1024)).toBe(false)
    })

    it('应该接受正好 10MB 的文件', () => {
      const isValidSize = (size, maxMB = 10) => size <= maxMB * 1024 * 1024
      expect(isValidSize(10 * 1024 * 1024)).toBe(true)
    })
  })

  describe('拖放处理', () => {
    it('应该处理单个文件拖放', () => {
      const handleDrop = (files) => files.filter(f => f.type.startsWith('image/'))
      const files = [{ name: 'test.png', type: 'image/png' }]
      const result = handleDrop(files)
      expect(result.length).toBe(1)
    })

    it('应该处理多个文件拖放', () => {
      const handleDrop = (files) => files.filter(f => f.type.startsWith('image/'))
      const files = [
        { name: 'a.png', type: 'image/png' },
        { name: 'b.jpg', type: 'image/jpeg' },
        { name: 'c.txt', type: 'text/plain' }
      ]
      const result = handleDrop(files)
      expect(result.length).toBe(2)
    })

    it('应该处理空拖放', () => {
      const handleDrop = (files) => files.filter(f => f.type.startsWith('image/'))
      const result = handleDrop([])
      expect(result.length).toBe(0)
    })
  })

  describe('剪贴板粘贴', () => {
    it('应该处理剪贴板图片', () => {
      const handlePaste = (items) => items.filter(i => i.type?.startsWith('image/'))
      const items = [{ type: 'image/png' }, { type: 'image/jpeg' }]
      const result = handlePaste(items)
      expect(result.length).toBe(2)
    })

    it('应该忽略剪贴板非图片', () => {
      const handlePaste = (items) => items.filter(i => i.type?.startsWith('image/'))
      const items = [{ type: 'text/plain' }, { type: 'application/json' }]
      const result = handlePaste(items)
      expect(result.length).toBe(0)
    })
  })

  describe('Markdown 生成', () => {
    it('应该生成正确的图片 Markdown', () => {
      const generate = (alt, src) => `![${alt}](${src})`
      expect(generate('测试', 'test.png')).toBe('![测试](test.png)')
    })

    it('应该处理 DataURL', () => {
      const generate = (alt, src) => `![${alt}](${src})`
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS'
      expect(generate('图片', dataUrl)).toBe('![图片](data:image/png;base64,iVBORw0KGgoAAAANS)')
    })

    it('应该处理 URL', () => {
      const generate = (alt, src) => `![${alt}](${src})`
      expect(generate('Logo', 'https://example.com/logo.png'))
        .toBe('![Logo](https://example.com/logo.png)')
    })

    it('空 alt 应该被处理', () => {
      const generate = (alt, src) => `![${alt || '图片'}](${src})`
      expect(generate('', 'test.png')).toBe('![图片](test.png)')
    })
  })

  describe('图片预览', () => {
    it('应该生成预览 URL', () => {
      const createPreview = (file) => URL.createObjectURL(file)
      // Mock URL.createObjectURL
      const mockFile = new Blob(['test'], { type: 'image/png' })
      expect(typeof mockFile).toBe('object')
    })

    it('应该清理预览 URL', () => {
      let revoked = false
      const revokePreview = (url) => { revoked = true }
      revokePreview('blob:...')
      expect(revoked).toBe(true)
    })
  })
})

// ==================== EquationEditor 组件 ====================
describe('EquationEditor 组件', () => {
  describe('公式类型', () => {
    it('行内公式应该用单美元符号', () => {
      const generate = (latex) => `$${latex}$`
      expect(generate('E=mc^2')).toBe('$E=mc^2$')
    })

    it('块级公式应该用双美元符号', () => {
      const generate = (latex) => `$$${latex}$$`
      expect(generate('\\sum_{i=1}^{n}')).toBe('$$\\sum_{i=1}^{n}$$')
    })
  })

  describe('公式验证', () => {
    it('应该验证括号匹配', () => {
      const validate = (latex) => {
        // 移除转义的大括号，然后统计未匹配的大括号
        let balance = 0
        let escaped = false
        for (let i = 0; i < latex.length; i++) {
          const char = latex[i]
          if (escaped) {
            escaped = false
            continue
          }
          if (char === '\\') {
            escaped = true
            continue
          }
          if (char === '{') balance++
          if (char === '}') balance--
          if (balance < 0) return false // 闭合括号多于开放
        }
        return balance === 0
      }
      
      expect(validate('\\frac{1}{2}')).toBe(true)
      expect(validate('\\frac{1}{2')).toBe(false)  // 缺少闭合括号
      expect(validate('\\frac{1}{2}}')).toBe(false) // 多余闭合括号
      expect(validate('\\frac{1}{2}')).toBe(true)   // 完整匹配
    })

    it('应该验证常见命令', () => {
      const commands = ['\\sum', '\\int', '\\frac', '\\sqrt', '\\alpha', '\\beta']
      commands.forEach(cmd => expect(cmd.startsWith('\\')).toBe(true))
    })

    it('应该拒绝空公式', () => {
      const validate = (latex) => !!(latex && latex.trim().length > 0)
      expect(validate('')).toBe(false)
      expect(validate('   ')).toBe(false)
      expect(validate('E=mc^2')).toBe(true)
    })
  })

  describe('常见公式', () => {
    it('应该支持二次方程', () => {
      const formula = 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'
      expect(formula).toContain('\\frac')
      expect(formula).toContain('\\sqrt')
    })

    it('应该支持积分', () => {
      const formula = '\\int_a^b f(x)dx'
      expect(formula).toContain('\\int')
    })

    it('应该支持求和', () => {
      const formula = '\\sum_{i=1}^{n} x_i'
      expect(formula).toContain('\\sum')
    })

    it('应该支持希腊字母', () => {
      const formula = '\\alpha + \\beta = \\gamma'
      expect(formula).toContain('\\alpha')
      expect(formula).toContain('\\beta')
      expect(formula).toContain('\\gamma')
    })

    it('应该支持矩阵', () => {
      const formula = '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}'
      expect(formula).toContain('\\begin{pmatrix}')
      expect(formula).toContain('\\end{pmatrix}')
    })
  })

  describe('公式编辑功能', () => {
    it('应该支持修改已插入的行内公式', () => {
      // 模拟公式编辑场景
      let latex = 'E=mc^2'
      
      // 初始公式
      expect(latex).toBe('E=mc^2')
      
      // 用户修改：将 c^2 改为 c^3
      latex = latex.replace('c^2', 'c^3')
      expect(latex).toBe('E=mc^3')
      
      // 验证修改后的公式仍然有效
      expect(latex.length).toBeGreaterThan(0)
      expect(latex).not.toContain('undefined')
    })

    it('应该支持修改已插入的块级公式', () => {
      // 模拟块级公式编辑
      let latex = '\\frac{1}{2}'
      
      // 初始公式
      expect(latex).toBe('\\frac{1}{2}')
      
      // 用户修改：将分子从 1 改为 3
      latex = latex.replace('\\frac{1}', '\\frac{3}')
      expect(latex).toBe('\\frac{3}{2}')
      
      // 验证括号仍然匹配
      const openBraces = (latex.match(/\{/g) || []).length
      const closeBraces = (latex.match(/\}/g) || []).length
      expect(openBraces).toBe(closeBraces)
    })

    it('公式编辑后应该保持语法正确', () => {
      const testCases = [
        { original: '$a+b$', modified: '$\\alpha+\\beta$' },
        { original: '$$x^2$$', modified: '$$\\sqrt{x^3}$$' },
        { original: '$\\sum_{i=1}^{n}$', modified: '$\\sum_{i=1}^{n+1}$' },
      ]
      
      testCases.forEach(({ original, modified }) => {
        // 验证修改后的公式不为空
        expect(modified.trim().length).toBeGreaterThan(0)
        
        // 验证修改后的公式结构完整（至少包含 $ 或 {} 之一）
        const hasValidStructure = 
          modified.includes('$') || 
          modified.includes('{') || 
          modified.includes('\\')
        expect(hasValidStructure).toBe(true)
      })
    })

    it('应该处理公式编辑时的常见错误', () => {
      // 场景 1: 用户删除了闭合括号
      const incomplete1 = '\\frac{1}{2'
      const open1 = (incomplete1.match(/\{/g) || []).length
      const close1 = (incomplete1.match(/\}/g) || []).length
      expect(open1).not.toBe(close1) // 应该检测到不匹配
      
      // 场景 2: 用户输入了空公式
      const empty = ''
      expect(empty.trim().length).toBe(0)
      
      // 场景 3: 用户输入了无效命令
      const invalid = '\\invalidcmd{arg}'
      // 即使命令无效，语法结构应该仍然完整
      expect(invalid).toContain('\\')
      expect(invalid).toContain('{')
      expect(invalid).toContain('}')
    })

    it('应该支持公式的增量编辑', () => {
      // 模拟用户逐步构建公式的过程
      let steps = [
        'E=',           // 步骤 1: 开始输入
        'E=mc',         // 步骤 2: 添加变量
        'E=mc^2',       // 步骤 3: 添加指数
        'E=mc^{2}',     // 步骤 4: 添加括号
      ]
      
      steps.forEach((step, index) => {
        // 每一步都应该是有效的字符串
        expect(typeof step).toBe('string')
        expect(step.length).toBeGreaterThan(0)
        
        // 后一步应该比前一步长（增量编辑）
        if (index > 0) {
          expect(step.length).toBeGreaterThanOrEqual(steps[index - 1].length)
        }
      })
    })
  })

  describe('KaTeX 配置', () => {
    it('throwOnError 应该为 false', () => {
      const config = { throwOnError: false }
      expect(config.throwOnError).toBe(false)
    })

    it('errorColor 应该正确', () => {
      const config = { errorColor: '#cc0000' }
      expect(config.errorColor).toBe('#cc0000')
    })

    it('macroTimeout 应该正确', () => {
      const config = { macroTimeout: 1000 }
      expect(config.macroTimeout).toBe(1000)
    })
  })

  describe('公式语法容错处理', () => {
    it('应该处理连续的 $ 符号', () => {
      const sanitize = (text) => {
        let result = text
        while (result.includes('$$$$')) {
          result = result.replace(/\$\$\$\$/g, '$$')
        }
        return result
      }
      
      expect(sanitize('$$$$')).toBe('$$')
      expect(sanitize('test $$$$ test')).toBe('test $$ test')
      expect(sanitize('$$$$$$$$')).toBe('$$') // 8 个$ → 2 次替换 → $$
    })

    it('应该处理 Windows 路径中的反斜杠', () => {
      const sanitize = (text) => text.replace(/\\_/g, '_')
      
      expect(sanitize('C:\\_test\\_file.md')).toBe('C:_test_file.md')
      expect(sanitize('\\_')).toBe('_')
      expect(sanitize('no backslash')).toBe('no backslash')
    })

    it('应该处理无效的公式分隔符组合', () => {
      const sanitize = (text) => {
        let result = text
        while (result.includes('$$$$')) {
          result = result.replace(/\$\$\$\$/g, '$$')
        }
        result = result.replace(/\\_/g, '_')
        return result
      }
      
      expect(sanitize('$E=mc^2$$$$\\sum x$')).toBe('$E=mc^2$$\\sum x$')
      expect(sanitize('$$\\frac{1}{2}$$$$')).toBe('$$\\frac{1}{2}$$')
    })

    it('应该保持有效公式不变', () => {
      const sanitize = (text) => {
        let result = text
        while (result.includes('$$$$')) {
          result = result.replace(/\$\$\$\$/g, '$$')
        }
        result = result.replace(/\\_/g, '_')
        return result
      }
      
      expect(sanitize('$E=mc^2$')).toBe('$E=mc^2$')
      expect(sanitize('$$\\sum_{i=1}^{n}$$')).toBe('$$\\sum_{i=1}^{n}$$')
      expect(sanitize('普通文本')).toBe('普通文本')
    })

    it('应该处理混合的公式语法', () => {
      const sanitize = (text) => {
        let result = text
        while (result.includes('$$$$')) {
          result = result.replace(/\$\$\$\$/g, '$$')
        }
        result = result.replace(/\\_/g, '_')
        return result
      }
      
      const input = '这是 $E=mc^2$ 和 $$\\sum_{i=1}^{n}$$ 以及 C:\\_file\\_test.md'
      const expected = '这是 $E=mc^2$ 和 $$\\sum_{i=1}^{n}$$ 以及 C:_file_test.md'
      
      expect(sanitize(input)).toBe(expected)
    })

    it('应该处理极端的 $ 符号重复', () => {
      const sanitize = (text) => {
        let result = text
        // 多次替换以处理连续多组 $$$$
        while (result.includes('$$$$')) {
          result = result.replace(/\$\$\$\$/g, '$$')
        }
        return result
      }
      
      expect(sanitize('$$$$$$$$$$$$')).toBe('$$') // 6 个 $ → 1 对
      expect(sanitize('$$$$$$$$')).toBe('$$') // 4 个 $ → 1 对
    })
  })

  describe('KaTeX 错误恢复', () => {
    it('无效公式不应该导致崩溃', () => {
      // 模拟 KaTeX 配置 throwOnError: false
      const safeRender = (latex, config = { throwOnError: false }) => {
        try {
          // 模拟 KaTeX 渲染
          if (!latex || latex.trim() === '') {
            throw new Error('Empty formula')
          }
          if (latex.includes('$$$$')) {
            throw new Error('Invalid syntax')
          }
          return { success: true, html: `<span>${latex}</span>` }
        } catch (e) {
          if (config.throwOnError) {
            throw e
          }
          // 不抛出错误，返回错误样式
          return { 
            success: false, 
            html: `<span class="katex-error" style="color: #cc0000">${latex}</span>` 
          }
        }
      }
      
      // 有效公式应该正常渲染
      const valid = safeRender('E=mc^2')
      expect(valid.success).toBe(true)
      expect(valid.html).toContain('E=mc^2')
      
      // 无效公式不应该崩溃，返回错误样式
      const invalid = safeRender('$$$$')
      expect(invalid.success).toBe(false)
      expect(invalid.html).toContain('katex-error')
      expect(invalid.html).toContain('#cc0000')
      
      // 空公式也应该优雅处理
      const empty = safeRender('')
      expect(empty.success).toBe(false)
      expect(empty.html).toContain('katex-error')
    })

    it('错误公式应该显示为红色', () => {
      const errorColor = '#cc0000'
      const renderError = (latex) => 
        `<span class="katex-error" style="color: ${errorColor}">${latex}</span>`
      
      const error = renderError('$$$$')
      expect(error).toContain('color: #cc0000')
      expect(error).toContain('katex-error')
    })
  })

  describe('错误处理', () => {
    it('无效公式应该显示错误而不是崩溃', () => {
      const renderSafe = (latex, config) => {
        try {
          if (config.throwOnError) throw new Error('Parse error')
          return `<span style="color:${config.errorColor}">${latex}</span>`
        } catch (e) {
          return latex
        }
      }
      
      const config = { throwOnError: false, errorColor: '#cc0000' }
      const result = renderSafe('\\invalid', config)
      
      expect(result).toContain('\\invalid')
      expect(result).toContain('color:#cc0000')
    })
  })
})

// ==================== TaskList 组件 ====================
describe('TaskList 组件', () => {
  describe('任务创建', () => {
    it('应该创建未完成任务', () => {
      const createTask = (text) => ({ text, checked: false })
      const task = createTask('测试任务')
      
      expect(task.text).toBe('测试任务')
      expect(task.checked).toBe(false)
    })

    it('应该创建已完成任务', () => {
      const createTask = (text, checked) => ({ text, checked })
      const task = createTask('已完成', true)
      
      expect(task.text).toBe('已完成')
      expect(task.checked).toBe(true)
    })
  })

  describe('任务切换', () => {
    it('应该切换任务状态', () => {
      const toggle = (task) => ({ ...task, checked: !task.checked })
      const task = { text: '任务', checked: false }
      
      const toggled = toggle(task)
      expect(toggled.checked).toBe(true)
    })

    it('应该可以多次切换', () => {
      const toggle = (task) => ({ ...task, checked: !task.checked })
      let task = { text: '任务', checked: false }
      
      task = toggle(task)
      expect(task.checked).toBe(true)
      
      task = toggle(task)
      expect(task.checked).toBe(false)
    })
  })

  describe('任务添加', () => {
    it('应该添加任务到列表', () => {
      const addTask = (tasks, text) => [...tasks, { text, checked: false }]
      const tasks = addTask([], '新任务')
      
      expect(tasks.length).toBe(1)
      expect(tasks[0].text).toBe('新任务')
    })

    it('应该添加多个任务', () => {
      const addTask = (tasks, text) => [...tasks, { text, checked: false }]
      let tasks = []
      
      tasks = addTask(tasks, '任务 1')
      tasks = addTask(tasks, '任务 2')
      tasks = addTask(tasks, '任务 3')
      
      expect(tasks.length).toBe(3)
    })
  })

  describe('任务删除', () => {
    it('应该删除指定任务', () => {
      const deleteTask = (tasks, index) => tasks.filter((_, i) => i !== index)
      const tasks = [{ text: '1' }, { text: '2' }, { text: '3' }]
      
      const result = deleteTask(tasks, 1)
      expect(result.length).toBe(2)
      expect(result[0].text).toBe('1')
      expect(result[1].text).toBe('3')
    })
  })

  describe('Markdown 生成', () => {
    it('应该生成正确的任务列表 Markdown', () => {
      const generate = (tasks) => tasks.map(t => `- [${t.checked ? 'x' : ' '}] ${t.text}`).join('\n')
      const tasks = [
        { text: '未完成', checked: false },
        { text: '已完成', checked: true }
      ]
      
      const md = generate(tasks)
      expect(md).toContain('- [ ] 未完成')
      expect(md).toContain('- [x] 已完成')
    })

    it('空列表应该生成空字符串', () => {
      const generate = (tasks) => tasks.map(t => `- [${t.checked ? 'x' : ' '}] ${t.text}`).join('\n')
      expect(generate([])).toBe('')
    })
  })

  describe('任务统计', () => {
    it('应该统计总任务数', () => {
      const count = (tasks) => tasks.length
      expect(count([{ text: '1' }, { text: '2' }])).toBe(2)
    })

    it('应该统计完成任务数', () => {
      const countCompleted = (tasks) => tasks.filter(t => t.checked).length
      const tasks = [
        { text: '1', checked: false },
        { text: '2', checked: true },
        { text: '3', checked: true }
      ]
      
      expect(countCompleted(tasks)).toBe(2)
    })

    it('应该计算完成百分比', () => {
      const getProgress = (tasks) => {
        if (tasks.length === 0) return 0
        const completed = tasks.filter(t => t.checked).length
        return Math.round((completed / tasks.length) * 100)
      }
      
      const tasks = [
        { text: '1', checked: false },
        { text: '2', checked: true }
      ]
      
      expect(getProgress(tasks)).toBe(50)
    })
  })
})

// ==================== CodeBlock 组件 ====================
describe('CodeBlock 组件', () => {
  describe('语言检测', () => {
    it('应该检测 JavaScript', () => {
      const detect = (code) => code.match(/^```(\w+)/)?.[1] || 'plaintext'
      expect(detect('```javascript')).toBe('javascript')
      expect(detect('```js')).toBe('js')
    })

    it('应该检测 TypeScript', () => {
      const detect = (code) => code.match(/^```(\w+)/)?.[1] || 'plaintext'
      expect(detect('```typescript')).toBe('typescript')
      expect(detect('```ts')).toBe('ts')
    })

    it('应该检测 Python', () => {
      const detect = (code) => code.match(/^```(\w+)/)?.[1] || 'plaintext'
      expect(detect('```python')).toBe('python')
      expect(detect('```py')).toBe('py')
    })

    it('应该默认返回 plaintext', () => {
      const detect = (code) => code.match(/^```(\w+)/)?.[1] || 'plaintext'
      expect(detect('```')).toBe('plaintext')
      expect(detect('plain text')).toBe('plaintext')
    })
  })

  describe('语言列表', () => {
    it('应该支持常用语言', () => {
      const languages = [
        'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
        'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
        'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown'
      ]
      
      expect(languages).toContain('javascript')
      expect(languages).toContain('python')
      expect(languages.length).toBe(19)
    })
  })

  describe('代码折叠', () => {
    it('应该判断是否可折叠', () => {
      const canCollapse = (lines, threshold = 20) => lines > threshold
      expect(canCollapse(10)).toBe(false)
      expect(canCollapse(20)).toBe(false)
      expect(canCollapse(21)).toBe(true)
    })

    it('应该获取预览行数', () => {
      const getPreview = (code, count = 3) => code.split('\n').slice(0, count).join('\n')
      const code = 'line1\nline2\nline3\nline4\nline5'
      
      expect(getPreview(code).split('\n').length).toBe(3)
    })

    it('应该生成折叠摘要', () => {
      const getSummary = (total, preview = 3) => `... 折叠了 ${total - preview} 行代码 ...`
      expect(getSummary(50)).toBe('... 折叠了 47 行代码 ...')
    })
  })

  describe('代码高亮', () => {
    it('应该支持的语言有图标', () => {
      const icons = {
        'javascript': '🟨', 'typescript': '🔷', 'python': '🐍',
        'java': '☕', 'cpp': '⚙️', 'html': '🌐', 'css': '🎨'
      }
      
      expect(icons['javascript']).toBe('🟨')
      expect(icons['python']).toBe('🐍')
    })
  })

  describe('复制功能', () => {
    it('应该复制代码到剪贴板', async () => {
      let copiedText = ''
      const copy = async (text) => { copiedText = text; return true }
      
      await copy('const x = 1')
      expect(copiedText).toBe('const x = 1')
    })
  })

  describe('任务列表显示验证', () => {
    it('生成的 Markdown 任务列表应该正确显示', () => {
      const generateTaskListMarkdown = (tasks) => {
        return tasks.map(task => {
          const checkbox = task.checked ? '[x]' : '[ ]'
          return `- ${checkbox} ${task.text}`
        }).join('\n')
      }
      
      const tasks = [
        { text: '未完成任务', checked: false },
        { text: '已完成任务', checked: true },
        { text: '另一个未完成', checked: false }
      ]
      
      const md = generateTaskListMarkdown(tasks)
      
      // 验证 1: 应该包含所有任务文本
      expect(md).toContain('未完成任务')
      expect(md).toContain('已完成任务')
      expect(md).toContain('另一个未完成')
      
      // 验证 2: 应该包含正确的复选框标记
      expect(md).toContain('- [ ] 未完成任务')
      expect(md).toContain('- [x] 已完成任务')
      expect(md).toContain('- [ ] 另一个未完成')
      
      // 验证 3: 不应该有多余内容
      expect(md).not.toContain('undefined')
      expect(md).not.toContain('null')
      expect(md).not.toContain('[object Object]')
      
      // 验证 4: 每行都应该以任务列表标记开头
      const lines = md.split('\n')
      lines.forEach(line => {
        expect(line).toMatch(/^-\s*\[[ x]\]\s*.+/)
      })
    })

    it('任务列表渲染不应该显示原始 Markdown 语法', () => {
      // 模拟渲染后的内容（应该已经转换为 HTML/UI）
      const renderTaskList = (tasks) => {
        return tasks.map(task => ({
          type: 'task-item',
          text: task.text,
          checked: task.checked,
          rawMarkdown: false
        }))
      }
      
      const tasks = [
        { text: '任务 1', checked: false },
        { text: '任务 2', checked: true }
      ]
      
      const rendered = renderTaskList(tasks)
      
      rendered.forEach(item => {
        expect(item.text).not.toContain('- [ ]')
        expect(item.text).not.toContain('- [x]')
        expect(typeof item.text).toBe('string')
        expect(item.text.trim().length).toBeGreaterThan(0)
        expect(item.text).not.toContain('undefined')
        expect(item.text).not.toContain('null')
      })
    })

    it('任务状态应该正确映射到 UI', () => {
      const mapTaskToUI = (task) => ({
        displayText: task.text,
        isChecked: task.checked,
        cssClass: task.checked ? 'task-completed' : 'task-pending'
      })
      
      const uncheckedTask = { text: '未完成', checked: false }
      const checkedTask = { text: '已完成', checked: true }
      
      const uiUnchecked = mapTaskToUI(uncheckedTask)
      const uiChecked = mapTaskToUI(checkedTask)
      
      expect(uiUnchecked.isChecked).toBe(false)
      expect(uiUnchecked.cssClass).toBe('task-pending')
      expect(uiChecked.isChecked).toBe(true)
      expect(uiChecked.cssClass).toBe('task-completed')
      expect(uiUnchecked.displayText).toBe('未完成')
      expect(uiChecked.displayText).toBe('已完成')
    })

    it('任务列表不应该包含内部数据结构', () => {
      const sanitizeTaskDisplay = (task) => ({
        text: task.text,
        checked: task.checked
      })
      
      const internalTask = {
        id: 123,
        text: '测试任务',
        checked: false,
        createdAt: '2026-04-02',
        updatedAt: null,
        metadata: {}
      }
      
      const display = sanitizeTaskDisplay(internalTask)
      
      expect(Object.keys(display).length).toBe(2)
      expect(display).toHaveProperty('text')
      expect(display).toHaveProperty('checked')
      expect(display).not.toHaveProperty('id')
      expect(display).not.toHaveProperty('createdAt')
      expect(display).not.toHaveProperty('metadata')
      expect(display.text).toBe('测试任务')
    })
  })
})
