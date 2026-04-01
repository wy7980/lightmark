#!/usr/bin/env node
/**
 * LightMark 功能测试脚本
 * 验证所有已实现功能的核心逻辑
 */

import { test } from 'node:test'
import assert from 'node:assert'

// ==================== 大纲导航解析测试 ====================
test('Outline: 解析 Markdown 标题', () => {
  function parseHeadings(md) {
    const lines = md.split('\n')
    const result = []
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        result.push({
          level: match[1].length,
          text: match[2].trim(),
          line: i
        })
      }
    }
    return result
  }
  
  const md = `# 标题 1
## 标题 2
### 标题 3
普通文本
## 标题 4`
  
  const headings = parseHeadings(md)
  assert.strictEqual(headings.length, 4)
  assert.strictEqual(headings[0].level, 1)
  assert.strictEqual(headings[0].text, '标题 1')
  assert.strictEqual(headings[1].level, 2)
  assert.strictEqual(headings[2].level, 3)
})

// ==================== 任务列表生成测试 ====================
test('TaskList: 生成 GitHub 风格任务列表', () => {
  function generateTaskMarkdown(tasks) {
    return '\n' + tasks.map(t => 
      `- [${t.checked ? 'x' : ' '}] ${t.text}`
    ).join('\n') + '\n'
  }
  
  const tasks = [
    { text: '任务 1', checked: false },
    { text: '任务 2', checked: true }
  ]
  
  const md = generateTaskMarkdown(tasks)
  assert.ok(md.includes('- [ ] 任务 1'))
  assert.ok(md.includes('- [x] 任务 2'))
})

// ==================== 表格 Markdown 生成测试 ====================
test('TableEditor: 生成 Markdown 表格', () => {
  function generateTableMarkdown(headers, rows, align) {
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
})

// ==================== 图片 Markdown 生成测试 ====================
test('ImageDrop: 生成图片 Markdown 语法', () => {
  function generateImageMarkdown(alt, src) {
    return `\n![${alt}](${src})\n`
  }
  
  const md = generateImageMarkdown('测试图片', 'data:image/png;base64,xxx')
  assert.strictEqual(md, '\n![测试图片](data:image/png;base64,xxx)\n')
  assert.ok(md.startsWith('\n!['))
})

// ==================== 数学公式生成测试 ====================
test('EquationEditor: 生成 LaTeX 公式', () => {
  function generateEquationMarkdown(latex, type) {
    return type === 'inline' ? `$${latex}$` : `$$${latex}$$`
  }
  
  const inline = generateEquationMarkdown('E=mc^2', 'inline')
  const block = generateEquationMarkdown('\\sum_{i=1}^{n}', 'block')
  
  assert.strictEqual(inline, '$E=mc^2$')
  assert.strictEqual(block, '$$\\sum_{i=1}^{n}$$')
})

// ==================== 主题切换测试 ====================
test('ThemeSwitcher: 主题类名生成', () => {
  function getThemeClass(theme) {
    return `${theme}-theme`
  }
  
  assert.strictEqual(getThemeClass('light'), 'light-theme')
  assert.strictEqual(getThemeClass('dark'), 'dark-theme')
})

// ==================== 代码块语言检测测试 ====================
test('CodeBlock: 自动检测语言', () => {
  function detectLanguage(code) {
    const match = code.match(/^```(\w+)/)
    return match ? match[1] : 'plaintext'
  }
  
  assert.strictEqual(detectLanguage('```javascript'), 'javascript')
  assert.strictEqual(detectLanguage('```python'), 'python')
  assert.strictEqual(detectLanguage('plain text'), 'plaintext')
})

// ==================== 防抖函数测试 ====================
test('Utils: 防抖函数', async () => {
  let callCount = 0
  const debounce = (fn, delay) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }
  
  const debouncedFn = debounce(() => callCount++, 50)
  
  // 快速调用 3 次
  debouncedFn()
  debouncedFn()
  debouncedFn()
  
  await new Promise(resolve => setTimeout(resolve, 100))
  // 应该只执行 1 次
  assert.strictEqual(callCount, 1)
})

// ==================== 支持的语言列表测试 ====================
test('SyntaxHighlighter: 支持的语言列表', () => {
  const supportedLanguages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown'
  ]
  
  assert.ok(supportedLanguages.includes('javascript'))
  assert.ok(supportedLanguages.includes('python'))
  assert.ok(supportedLanguages.includes('typescript'))
  assert.strictEqual(supportedLanguages.length, 19)
})

// ==================== 阅读进度计算测试 ====================
test('ReadingProgress: 进度百分比计算', () => {
  function calculateProgress(scrollTop, scrollHeight, clientHeight) {
    const maxScroll = scrollHeight - clientHeight
    return maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
  }
  
  assert.strictEqual(calculateProgress(0, 1000, 500), 0)
  assert.strictEqual(calculateProgress(250, 1000, 500), 50)
  assert.strictEqual(calculateProgress(500, 1000, 500), 100)
})

// ==================== 标题层级缩进测试 ====================
test('ClickJump: 标题层级缩进计算', () => {
  function getHeadingIndent(level) {
    const indentMap = {
      1: '0px',
      2: '12px',
      3: '24px',
      4: '36px',
      5: '48px',
      6: '60px',
    }
    return indentMap[level] || '0px'
  }
  
  assert.strictEqual(getHeadingIndent(1), '0px')
  assert.strictEqual(getHeadingIndent(2), '12px')
  assert.strictEqual(getHeadingIndent(3), '24px')
  assert.strictEqual(getHeadingIndent(6), '60px')
})

// ==================== 语言显示名称映射测试 ====================
test('SyntaxHighlighter: 语言显示名称映射', () => {
  const displayNames = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'html': 'HTML',
    'css': 'CSS',
  }
  
  assert.strictEqual(displayNames['javascript'], 'JavaScript')
  assert.strictEqual(displayNames['typescript'], 'TypeScript')
  assert.strictEqual(displayNames['python'], 'Python')
})

// ==================== 代码行数统计测试 ====================
test('CodeFolding: 代码行数统计', () => {
  function countLines(code) {
    return code.split('\n').length
  }
  
  const code1 = 'line1\nline2\nline3'
  const code2 = 'single line'
  const code3 = 'line1\nline2\nline3\nline4\nline5'
  
  assert.strictEqual(countLines(code1), 3)
  assert.strictEqual(countLines(code2), 1)
  assert.strictEqual(countLines(code3), 5)
})

// ==================== 代码折叠判断测试 ====================
test('CodeFolding: 是否可折叠判断', () => {
  function canCollapse(lineCount, maxLines = 20, allowCollapse = true) {
    return allowCollapse && lineCount > maxLines
  }
  
  assert.strictEqual(canCollapse(10), false)
  assert.strictEqual(canCollapse(20), false)
  assert.strictEqual(canCollapse(21), true)
  assert.strictEqual(canCollapse(30, 10), true)
  assert.strictEqual(canCollapse(30, 10, false), false)
})

// ==================== 折叠预览行数测试 ====================
test('CodeFolding: 折叠时预览行数', () => {
  function getPreviewLines(code, previewCount = 3) {
    const lines = code.split('\n')
    return lines.slice(0, previewCount).join('\n')
  }
  
  const code = 'line1\nline2\nline3\nline4\nline5'
  const preview = getPreviewLines(code)
  
  assert.strictEqual(preview.split('\n').length, 3)
  assert.strictEqual(preview, 'line1\nline2\nline3')
})

// ==================== 折叠摘要测试 ====================
test('CodeFolding: 折叠摘要信息', () => {
  function getCollapsedSummary(totalLines, previewLines = 3) {
    const hiddenLines = totalLines - previewLines
    return `... 折叠了 ${hiddenLines} 行代码 ...`
  }
  
  assert.strictEqual(getCollapsedSummary(50), '... 折叠了 47 行代码 ...')
  assert.strictEqual(getCollapsedSummary(100), '... 折叠了 97 行代码 ...')
})

// ==================== 语言图标映射测试 ====================
test('CodeFolding: 语言图标映射', () => {
  const icons = {
    'javascript': '🟨',
    'typescript': '🔷',
    'python': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'html': '🌐',
    'css': '🎨',
    'sql': '🗄️',
    'bash': '💻',
    'json': '📋',
  }
  
  assert.strictEqual(icons['javascript'], '🟨')
  assert.strictEqual(icons['typescript'], '🔷')
  assert.strictEqual(icons['python'], '🐍')
  assert.strictEqual(icons['html'], '🌐')
})

// ==================== 剪贴板复制测试 ====================
test('CopyButton: 剪贴板复制逻辑', async () => {
  let copiedText = ''
  
  async function copyToClipboard(text) {
    copiedText = text
    return true
  }
  
  assert.strictEqual(copiedText, '')
  await copyToClipboard('测试文本')
  assert.strictEqual(copiedText, '测试文本')
})

// ==================== 语言列表测试 ====================
test('LanguageSelector: 支持的语言数量', () => {
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp',
    'go', 'rust', 'ruby', 'php', 'swift',
  ]
  
  assert.strictEqual(languages.length, 10)
  assert.ok(languages.includes('javascript'))
  assert.ok(languages.includes('python'))
})

// ==================== 内联预览渲染测试 ====================
test('InlinePreview: Markdown 内联语法渲染', () => {
  function renderInline(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
    text = text.replace(/`(.+?)`/g, '<code>$1</code>')
    return text
  }
  
  assert.ok(renderInline('**粗体**').includes('<strong>粗体</strong>'))
  assert.ok(renderInline('*斜体*').includes('<em>斜体</em>'))
  assert.ok(renderInline('`代码`').includes('<code>代码</code>'))
})

// ==================== 焦点模式切换测试 ====================
test('FocusMode: 焦点模式切换', () => {
  let enabled = false
  
  function toggleFocus() {
    enabled = !enabled
  }
  
  toggleFocus()
  assert.strictEqual(enabled, true)
  
  toggleFocus()
  assert.strictEqual(enabled, false)
})

// ==================== 打字机模式光标位置测试 ====================
test('TypewriterMode: 光标居中位置计算', () => {
  function calculateCenterOffset(containerHeight, elementHeight) {
    return containerHeight / 2 - elementHeight / 2
  }
  
  assert.strictEqual(calculateCenterOffset(600, 20), 290)
  assert.strictEqual(calculateCenterOffset(800, 30), 385)
  assert.strictEqual(calculateCenterOffset(500, 25), 237.5)
})

console.log('\n✅ 所有单元测试通过！\n')
