<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher<{
    exportHtml: { content: string }
  }>()
  
  let exportFormat: 'html' | 'pdf' = 'html'
  let includeStyle = true
  let includeTOC = false
  
  interface ExportOptions {
    title: string
    content: string
    theme: 'light' | 'dark'
  }
  
  function generateHtml(mdContent: string): string {
    // 简单 Markdown 转 HTML
    let html = mdContent
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>')
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LightMark Export</title>
  ${includeStyle ? `<style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
    code {
      background: #f6f8fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: "JetBrains Mono", monospace;
    }
    pre {
      background: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 16px;
      color: #6a737d;
      margin: 1em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
    }
    th { background: #f6f8fa; }
    img { max-width: 100%; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media print {
      body { padding: 20px; }
      a { color: #333; }
    }
  </style>` : ''}
</head>
<body>
  ${html}
</body>
</html>`
  }
  
  function exportContent() {
    const sampleMd = `# LightMark 导出示例

## 功能特性

- **实时预览**：所见即所得编辑体验
- **代码高亮**：支持 16 种编程语言
- **数学公式**：KaTeX 渲染 LaTeX

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, LightMark!")
}
\`\`\`

## 表格

| 功能 | 状态 |
|------|------|
| 大纲导航 | ✅ |
| 主题切换 | ✅ |

## 引用

> LightMark - 高性能 Markdown 编辑器
`
    
    const html = generateHtml(sampleMd)
    
    if (exportFormat === 'html') {
      // 下载 HTML 文件
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'lightmark-export.html'
      a.click()
      URL.revokeObjectURL(url)
    }
    
    dispatch('exportHtml', { content: html })
  }
  
  function printContent() {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const sampleMd = `# LightMark 打印预览\n\n这是打印内容预览...`
      printWindow.document.write(generateHtml(sampleMd))
      printWindow.document.close()
      printWindow.print()
    }
  }
</script>

<div class="export-dialog">
  <div class="export-header">
    <h3>📤 导出文档</h3>
  </div>
  
  <div class="export-options">
    <div class="option-group">
      <label class="option-label">导出格式</label>
      <div class="option-buttons">
        <button 
          class="format-btn {exportFormat === 'html' ? 'active' : ''}"
          on:click={() => exportFormat = 'html'}
        >
          📄 HTML
        </button>
        <button 
          class="format-btn {exportFormat === 'pdf' ? 'active' : ''}"
          on:click={() => exportFormat = 'pdf'}
          disabled
          title="PDF 导出待开发"
        >
          📕 PDF (待开发)
        </button>
      </div>
    </div>
    
    <div class="option-group">
      <label class="option-label">
        <input type="checkbox" bind:checked={includeStyle} />
        包含样式
      </label>
      
      <label class="option-label">
        <input type="checkbox" bind:checked={includeTOC} />
        包含目录
      </label>
    </div>
  </div>
  
  <div class="export-preview">
    <h4>预览</h4>
    <div class="preview-content">
      <p>📄 HTML 导出预览</p>
      <p class="hint">导出后将使用浏览器打开</p>
    </div>
  </div>
  
  <div class="export-actions">
    <button class="btn btn-print" on:click={printContent}>
      🖨️ 打印
    </button>
    <button class="btn btn-primary" on:click={exportContent}>
      {exportFormat === 'html' ? '📄 导出 HTML' : '📕 导出 PDF'}
    </button>
  </div>
  
  <div class="export-footer">
    <p class="hint">💡 PDF 导出功能开发中，目前可使用浏览器打印功能</p>
  </div>
</div>

<style>
  .export-dialog {
    padding: 16px;
  }
  
  .export-header h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: var(--text-primary, #333);
  }
  
  .export-options {
    margin-bottom: 20px;
  }
  
  .option-group {
    margin-bottom: 16px;
  }
  
  .option-label {
    display: block;
    font-size: 14px;
    color: var(--text-secondary, #666);
    margin-bottom: 8px;
    cursor: pointer;
  }
  
  .option-label input {
    margin-right: 8px;
  }
  
  .option-buttons {
    display: flex;
    gap: 8px;
  }
  
  .format-btn {
    flex: 1;
    padding: 10px 16px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .format-btn:hover:not(:disabled) {
    background: #e8e8e8;
  }
  
  .format-btn.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
  }
  
  .format-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .export-preview {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 4px;
  }
  
  .export-preview h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: var(--text-secondary, #666);
  }
  
  .preview-content {
    padding: 20px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    min-height: 100px;
  }
  
  .preview-content p {
    margin: 8px 0;
    color: var(--text-primary, #333);
  }
  
  .hint {
    font-size: 12px;
    color: var(--text-secondary, #999);
  }
  
  .export-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-bottom: 12px;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .btn-print {
    background: #f5f5f5;
    color: #333;
  }
  
  .btn-print:hover {
    background: #e8e8e8;
  }
  
  .btn-primary {
    background: #1976d2;
    color: white;
  }
  
  .btn-primary:hover {
    background: #1565c0;
  }
  
  .export-footer {
    text-align: center;
    padding-top: 12px;
    border-top: 1px solid var(--border-color, #e0e0e0);
  }
</style>
