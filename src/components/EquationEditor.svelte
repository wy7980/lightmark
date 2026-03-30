<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import katex from 'katex'
  
  const dispatch = createEventDispatcher<{
    equationInsert: { markdown: string }
  }>()
  
  let equationType: 'inline' | 'block' = 'block'
  let latex = '\\sum_{i=1}^{n} x_i'
  let previewHtml = ''
  let error = ''
  
  // 示例公式
  const examples = [
    { name: '求和', latex: '\\\\sum_{i=1}^{n} x_i' },
    { name: '积分', latex: '\\\\int_{0}^{\\\\infty} e^{-x} dx' },
    { name: '分数', latex: '\\\\frac{a}{b}' },
    { name: '根号', latex: '\\\\sqrt{x^2 + y^2}' },
    { name: '矩阵', latex: '\\\\\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\\\\\end{pmatrix}' },
    { name: '希腊字母', latex: '\\\\alpha + \\\\beta + \\\\gamma' },
    { name: '上标下标', latex: 'x^{2} + y_{i}' },
    { name: '等式', latex: 'E = mc^{2}' }
  ]
  
  function render() {
    try {
      previewHtml = katex.renderToString(latex, {
        displayMode: equationType === 'block',
        throwOnError: false,
        errorColor: '#cc0000'
      })
      error = ''
    } catch (e) {
      error = e instanceof Error ? e.message : '渲染失败'
      previewHtml = ''
    }
  }
  
  function insertEquation() {
    const markdown = equationType === 'inline' 
      ? `$${latex}$`
      : `$$${latex}$$`
    dispatch('equationInsert', { markdown })
  }
  
  function loadExample(exampleLatex: string) {
    latex = exampleLatex.replace(/\\\\/g, '\\')
    render()
  }
  
  $: render()
</script>

<div class="equation-editor">
  <div class="equation-header">
    <h3>∑ 数学公式</h3>
    <div class="equation-type">
      <button 
        class="type-btn {equationType === 'inline' ? 'active' : ''}"
        on:click={() => equationType = 'inline'}
      >
        行内公式
      </button>
      <button 
        class="type-btn {equationType === 'block' ? 'active' : ''}"
        on:click={() => equationType = 'block'}
      >
        块级公式
      </button>
    </div>
  </div>
  
  <div class="equation-input-group">
    <textarea 
      bind:value={latex}
      placeholder="输入 LaTeX 公式..."
      class="equation-input"
      rows="3"
    ></textarea>
  </div>
  
  <div class="equation-preview {error ? 'has-error' : ''}">
    {#if error}
      <div class="error-message">❌ {error}</div>
    {:else if previewHtml}
      <div class="preview-content">{@html previewHtml}</div>
    {:else}
      <div class="empty-preview">预览区域</div>
    {/if}
  </div>
  
  <div class="equation-examples">
    <h4>示例公式</h4>
    <div class="example-grid">
      {#each examples as example}
        <button 
          class="example-btn"
          on:click={() => loadExample(example.latex)}
        >
          {example.name}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="equation-actions">
    <button class="insert-btn" on:click={insertEquation}>
      插入公式
    </button>
  </div>
  
  <div class="equation-footer">
    <p class="hint">💡 支持标准 LaTeX 数学语法，使用 KaTeX 渲染</p>
  </div>
</div>

<style>
  .equation-editor {
    padding: 16px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 6px;
    margin: 16px 0;
  }
  
  .equation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .equation-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary, #333);
  }
  
  .equation-type {
    display: flex;
    gap: 4px;
  }
  
  .type-btn {
    padding: 6px 12px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  
  .type-btn:hover {
    background: #e8e8e8;
  }
  
  .type-btn.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
  }
  
  .equation-input-group {
    margin-bottom: 16px;
  }
  
  .equation-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 14px;
    background: var(--bg-primary, #fff);
    color: var(--text-primary, #333);
    resize: vertical;
  }
  
  .equation-input:focus {
    outline: none;
    border-color: #1976d2;
  }
  
  .equation-preview {
    padding: 20px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    margin-bottom: 16px;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .equation-preview.has-error {
    border-color: #f44336;
    background: #ffebee;
  }
  
  .error-message {
    color: #f44336;
    font-size: 14px;
  }
  
  .preview-content {
    font-size: 18px;
    overflow-x: auto;
    max-width: 100%;
  }
  
  .empty-preview {
    color: #999;
    font-size: 14px;
  }
  
  .equation-examples {
    margin-bottom: 16px;
  }
  
  .equation-examples h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: var(--text-secondary, #666);
  }
  
  .example-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .example-btn {
    padding: 8px 12px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
    text-align: center;
  }
  
  .example-btn:hover {
    background: #e8e8e8;
    border-color: #1976d2;
  }
  
  .equation-actions {
    text-align: center;
    margin-bottom: 12px;
  }
  
  .insert-btn {
    padding: 10px 24px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .insert-btn:hover {
    background: #1565c0;
  }
  
  .equation-footer {
    text-align: center;
  }
  
  .hint {
    font-size: 12px;
    color: var(--text-secondary, #999);
    margin: 0;
  }
</style>
