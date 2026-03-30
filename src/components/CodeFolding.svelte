<script lang="ts">
  /**
   * 代码折叠组件 - Code Folding
   * 为代码块提供折叠/展开功能，支持多层级嵌套
   */
  
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let code = '';
  export let language = 'plaintext';
  export let collapsed = false;
  export let maxLines = 20; // 超过此行数自动折叠
  export let showLineNumbers = true;
  export let allowCollapse = true;
  
  let isCollapsed = false;
  let lineCount = 0;
  let canCollapse = false;
  const dispatch = createEventDispatcher<{
    collapse: { collapsed: boolean };
    expand: void;
  }>();
  
  onMount(() => {
    lineCount = code.split('\n').length;
    canCollapse = allowCollapse && lineCount > maxLines;
    isCollapsed = collapsed || canCollapse;
  });
  
  function toggleCollapse() {
    if (!canCollapse) return;
    
    isCollapsed = !isCollapsed;
    
    if (isCollapsed) {
      dispatch('collapse', { collapsed: true });
    } else {
      dispatch('expand');
    }
  }
  
  function getPreviewLines(): string {
    const lines = code.split('\n');
    return lines.slice(0, 3).join('\n');
  }
  
  function getCollapsedSummary(): string {
    const hiddenLines = lineCount - 3;
    return `... 折叠了 ${hiddenLines} 行代码 ...`;
  }
  
  function getLanguageIcon(): string {
    const icons: Record<string, string> = {
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
      'yaml': '📝',
      'markdown': '📄',
    };
    return icons[language] || '📝';
  }
  
  $: displayCode = isCollapsed ? getPreviewLines() : code;
  $: collapseHint = canCollapse ? (isCollapsed ? '展开' : '折叠') : '';
</script>

<div class="code-folding" class:collapsed={isCollapsed}>
  <div class="header">
    <div class="language-info">
      <span class="icon">{getLanguageIcon()}</span>
      <span class="name">{language}</span>
    </div>
    
    {#if canCollapse && allowCollapse}
      <button 
        class="collapse-btn" 
        on:click={toggleCollapse}
        title={isCollapsed ? '展开代码' : '折叠代码'}
      >
        {#if isCollapsed}
          <span>▼ 展开 ({lineCount} 行)</span>
        {:else}
          <span>▲ 折叠</span>
        {/if}
      </button>
    {/if}
    
    <div class="line-count">
      {lineCount} 行
    </div>
  </div>
  
  <div class="code-container">
    {#if showLineNumbers}
      <div class="line-numbers">
        {#each Array.from({ length: isCollapsed ? 3 : lineCount }, (_, i) => i + 1) as num}
          <div class="line-number">{num}</div>
        {/each}
      </div>
    {/if}
    
    <pre class="code-content"><code>{displayCode}</code></pre>
    
    {#if isCollapsed && canCollapse}
      <div class="collapsed-overlay" on:click={toggleCollapse}>
        <div class="summary">{getCollapsedSummary()}</div>
        <button class="expand-btn">点击展开</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .code-folding {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    margin: 1rem 0;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    border: 1px solid #e0e0e0;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .language-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 13px;
  }
  
  .icon {
    font-size: 16px;
  }
  
  .collapse-btn {
    padding: 0.25rem 0.75rem;
    border: 1px solid #bdbdbd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }
  
  .collapse-btn:hover {
    background: #f5f5f5;
    border-color: #9e9e9e;
  }
  
  .line-count {
    font-size: 12px;
    color: #757575;
  }
  
  .code-container {
    position: relative;
    display: flex;
    background: #1e1e1e;
    overflow: hidden;
  }
  
  .line-numbers {
    display: flex;
    flex-direction: column;
    padding: 1rem 0.5rem;
    background: #2d2d2d;
    color: #858585;
    user-select: none;
    min-width: 3rem;
    text-align: right;
  }
  
  .line-number {
    font-size: 12px;
    line-height: 1.6;
  }
  
  .code-content {
    flex: 1;
    margin: 0;
    padding: 1rem;
    color: #d4d4d4;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 800px;
  }
  
  .code-content code {
    white-space: pre;
    font-family: inherit;
    font-size: inherit;
  }
  
  .collapsed-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 30, 30, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .collapsed-overlay:hover {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .summary {
    color: #858585;
    font-size: 14px;
    margin-bottom: 1rem;
  }
  
  .expand-btn {
    padding: 0.5rem 1.5rem;
    border: 2px solid #4CAF50;
    background: transparent;
    color: #4CAF50;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .expand-btn:hover {
    background: #4CAF50;
    color: white;
  }
  
  .collapsed .code-content {
    max-height: none;
  }
  
  /* 滚动条样式 */
  .code-content::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .code-content::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  
  .code-content::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 5px;
  }
  
  .code-content::-webkit-scrollbar-thumb:hover {
    background: #616161;
  }
  
  /* 暗色主题支持 */
  :global(.dark) .code-folding {
    border-color: #333;
  }
  
  :global(.dark) .header {
    background: #252525;
    border-bottom-color: #333;
  }
  
  :global(.dark) .collapse-btn {
    background: #333;
    border-color: #555;
    color: #e0e0e0;
  }
  
  :global(.dark) .collapse-btn:hover {
    background: #3a3a3a;
  }
</style>
