<script lang="ts">
  import { onMount } from 'svelte'
  
  export let language = 'plaintext'
  export let code = ''
  
  let copied = false
  let showSelector = false
  
  const languages = [
    { value: 'plaintext', label: '纯文本' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' }
  ]
  
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      setTimeout(() => copied = false, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
  
  function selectLanguage(lang: string) {
    language = lang
    showSelector = false
  }
  
  onMount(() => {
    // 自动检测语言（从代码块标记）
    const match = code.match(/^```(\w+)/)
    if (match) {
      language = match[1]
    }
  })
</script>

<div class="code-block">
  <div class="code-header">
    <div class="language-selector">
      {#if showSelector}
        <div class="language-dropdown">
          {#each languages as lang}
            <button
              class="lang-option {language === lang.value ? 'active' : ''}"
              on:click={() => selectLanguage(lang.value)}
            >
              {lang.label}
            </button>
          {/each}
        </div>
      {/if}
      <button 
        class="lang-btn"
        on:click={() => showSelector = !showSelector}
        title="选择语言"
      >
        {languages.find(l => l.value === language)?.label || language}
        ▼
      </button>
    </div>
    
    <button 
      class="copy-btn {copied ? 'copied' : ''}"
      on:click={copyCode}
      title="复制代码"
    >
      {copied ? '✅ 已复制' : '📋 复制'}
    </button>
  </div>
  
  <pre class="code-content"><code>{code}</code></pre>
</div>

<style>
  .code-block {
    margin: 16px 0;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    overflow: hidden;
    background: var(--bg-secondary, #f5f5f5);
  }
  
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-secondary, #2d2d2d);
    border-bottom: 1px solid var(--border-color, #404040);
  }
  
  .language-selector {
    position: relative;
  }
  
  .lang-btn {
    padding: 4px 8px;
    background: transparent;
    border: 1px solid var(--border-color, #555);
    border-radius: 4px;
    color: var(--text-primary, #fff);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .lang-btn:hover {
    background: rgba(255,255,255,0.1);
  }
  
  .language-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 100;
    background: var(--bg-primary, #2d2d2d);
    border: 1px solid var(--border-color, #404040);
    border-radius: 4px;
    padding: 4px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .lang-option {
    display: block;
    width: 100%;
    padding: 6px 12px;
    background: transparent;
    border: none;
    text-align: left;
    color: var(--text-primary, #fff);
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .lang-option:hover {
    background: rgba(255,255,255,0.1);
  }
  
  .lang-option.active {
    background: #1976d2;
    color: white;
  }
  
  .copy-btn {
    padding: 4px 12px;
    background: transparent;
    border: 1px solid var(--border-color, #555);
    border-radius: 4px;
    color: var(--text-primary, #fff);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .copy-btn:hover {
    background: rgba(255,255,255,0.1);
  }
  
  .copy-btn.copied {
    background: #4caf50;
    border-color: #4caf50;
    color: white;
  }
  
  .code-content {
    margin: 0;
    padding: 16px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary, #333);
  }
  
  .code-content code {
    white-space: pre;
  }
</style>
