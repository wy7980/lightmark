<script lang="ts">
  /**
   * 内联预览组件 - Inline Preview
   * 实时渲染 Markdown 内联语法，所见即所得
   */
  
  export let markdown = '';
  export let enabled = true;
  export let renderCode = true;
  export let renderLinks = true;
  export let renderEmphasis = true;
  
  // Markdown 内联语法正则
  const patterns = {
    // 行内代码 `code`
    code: /`([^`]+)`/g,
    
    // 粗体 **text** 或 __text__
    bold: /(\*\*|__)(.+?)\1/g,
    
    // 斜体 *text* 或 _text_
    italic: /(\*|_)(.+?)\1/g,
    
    // 删除线 ~~text~~
    strikethrough: /~~(.+?)~~/g,
    
    // 链接 [text](url)
    link: /\[([^\]]+)\]\(([^)]+)\)/g,
    
    // 图片 ![alt](url)
    image: /!\[([^\]]*)\]\(([^)]+)\)/g,
    
    // 引用 > text
    quote: /^>\s+(.+)$/gm,
    
    // 高亮 ==text==
    highlight: /==(.+?)==/g,
    
    // 下划线 ++text++
    underline: /\+\+(.+?)\+\+/g,
    
    // 上标 text^sup^
    superscript: /\^([^^]+)\^/g,
    
    // 下标 text~sub~
    subscript: /~([^~]+)~/g,
  };
  
  function renderInline(text: string): string {
    if (!enabled) {
      return escapeHtml(text);
    }
    
    let result = escapeHtml(text);
    
    if (renderEmphasis) {
      // 粗体
      result = result.replace(patterns.bold, '<strong>$2</strong>');
      
      // 斜体
      result = result.replace(patterns.italic, '<em>$2</em>');
      
      // 删除线
      result = result.replace(patterns.strikethrough, '<del>$1</del>');
      
      // 高亮
      result = result.replace(patterns.highlight, '<mark>$1</mark>');
      
      // 下划线
      result = result.replace(patterns.underline, '<u>$1</u>');
      
      // 上标
      result = result.replace(patterns.superscript, '<sup>$1</sup>');
      
      // 下标
      result = result.replace(patterns.subscript, '<sub>$1</sub>');
    }
    
    if (renderCode) {
      // 行内代码
      result = result.replace(patterns.code, '<code class="inline">$1</code>');
    }
    
    if (renderLinks) {
      // 图片（先处理）
      result = result.replace(patterns.image, '<img src="$2" alt="$1" class="inline-image" />');
      
      // 链接
      result = result.replace(patterns.link, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }
    
    return result;
  }
  
  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 解析引用块
  function parseQuotes(text: string): string {
    return text.replace(patterns.quote, '<blockquote>$1</blockquote>');
  }
  
  // 处理多行文本
  function processMultiline(text: string): string {
    const lines = text.split('\n');
    const processed = lines.map(line => {
      // 引用块
      if (line.startsWith('>')) {
        return parseQuotes(line);
      }
      return renderInline(line);
    });
    
    return processed.join('<br />');
  }
  
  $: rendered = processMultiline(markdown);
  
  // 导出渲染函数供外部使用
  export { renderInline, processMultiline };
</script>

<div class="inline-preview" class:enabled>
  {@html rendered}
</div>

<style>
  .inline-preview {
    display: inline;
    line-height: 1.6;
    color: #24292e;
  }
  
  /* 行内代码 */
  :global(.inline-preview code.inline) {
    padding: 0.2rem 0.4rem;
    background: #f6f8fa;
    border-radius: 4px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9em;
    color: #e83e8c;
    border: 1px solid rgba(27, 31, 35, 0.1);
  }
  
  /* 粗体 */
  :global(.inline-preview strong) {
    font-weight: 600;
    color: #24292e;
  }
  
  /* 斜体 */
  :global(.inline-preview em) {
    font-style: italic;
    color: #6a737d;
  }
  
  /* 删除线 */
  :global(.inline-preview del) {
    text-decoration: line-through;
    color: #959da5;
  }
  
  /* 高亮 */
  :global(.inline-preview mark) {
    background: #fff5b1;
    color: #24292e;
    padding: 0.1rem 0.2rem;
    border-radius: 2px;
  }
  
  /* 下划线 */
  :global(.inline-preview u) {
    text-decoration: underline;
    text-decoration-color: #0366d6;
    text-decoration-thickness: 2px;
  }
  
  /* 上标 */
  :global(.inline-preview sup) {
    font-size: 0.75em;
    vertical-align: super;
    line-height: 0;
  }
  
  /* 下标 */
  :global(.inline-preview sub) {
    font-size: 0.75em;
    vertical-align: sub;
    line-height: 0;
  }
  
  /* 链接 */
  :global(.inline-preview a) {
    color: #0366d6;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  
  :global(.inline-preview a:hover) {
    text-decoration: underline;
    border-bottom-color: #0366d6;
  }
  
  /* 图片 */
  :global(.inline-preview img.inline-image) {
    max-width: 100%;
    max-height: 200px;
    vertical-align: middle;
    border-radius: 4px;
    margin: 0.25rem;
  }
  
  /* 引用块 */
  :global(.inline-preview blockquote) {
    margin: 0.5rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid #dfe2e5;
    background: #f6f8fa;
    color: #6a737d;
    border-radius: 0 4px 4px 0;
  }
  
  :global(.inline-preview blockquote p) {
    margin: 0;
  }
  
  /* 禁用状态 */
  .inline-preview:not(.enabled) {
    opacity: 0.6;
  }
  
  :global(.inline-preview:not(.enabled) code.inline),
  :global(.inline-preview:not(.enabled) mark) {
    background: transparent;
    border: 1px dashed #ddd;
  }
  
  /* 暗色主题支持 */
  :global(.dark) .inline-preview {
    color: #e0e0e0;
  }
  
  :global(.dark) .inline-preview code.inline) {
    background: #2d2d2d;
    color: #f48fb1;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  :global(.dark) .inline-preview strong {
    color: #e0e0e0;
  }
  
  :global(.dark) .inline-preview em {
    color: #9e9e9e;
  }
  
  :global(.dark) .inline-preview del {
    color: #757575;
  }
  
  :global(.dark) .inline-preview mark {
    background: #5d4037;
    color: #ffcc80;
  }
  
  :global(.dark) .inline-preview a {
    color: #64b5f6;
  }
  
  :global(.dark) .inline-preview blockquote {
    background: #252525;
    border-left-color: #555;
    color: #9e9e9e;
  }
</style>
