<script lang="ts">
  /**
   * 语法高亮组件 - 使用 highlight.js
   * 为代码块提供实时语法高亮功能
   */
  
  import { onMount } from 'svelte';
  
  export let code = '';
  export let language = 'javascript';
  export let showLineNumbers = true;
  
  let highlightedCode = '';
  
  // 支持的语言列表
  const supportedLanguages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown'
  ];
  
  onMount(async () => {
    await highlightCode();
  });
  
  async function highlightCode() {
    try {
      // 使用 highlight.js 进行语法高亮
      const hljs = await import('highlight.js/lib/core');
      
      // 动态加载语言
      if (supportedLanguages.includes(language)) {
        const lang = await import(`highlight.js/lib/languages/${language}`);
        hljs.registerLanguage(language, lang.default);
      }
      
      const result = hljs.highlight(code, { language });
      highlightedCode = result.value;
    } catch (error) {
      console.error('语法高亮失败:', error);
      highlightedCode = code;
    }
  }
  
  $: if (code) {
    highlightCode();
  }
  
  function getLanguageDisplayName(lang: string): string {
    const displayNames: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
      'bash': 'Bash',
      'json': 'JSON',
      'yaml': 'YAML',
      'markdown': 'Markdown',
    };
    return displayNames[lang] || lang;
  }
</script>

<div class="syntax-highlighter" class:showLineNumbers>
  <div class="header">
    <span class="language">{getLanguageDisplayName(language)}</span>
    {#if showLineNumbers}
      <span class="line-count">{code.split('\n').length} 行</span>
    {/if}
  </div>
  
  <pre class="code-container"><code class="language-{language}" innerHTML={highlightedCode}></code></pre>
</div>

<style>
  .syntax-highlighter {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    margin: 1rem 0;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #1e1e1e;
    color: #d4d4d4;
    font-size: 12px;
  }
  
  .language {
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .line-count {
    color: #808080;
  }
  
  .code-container {
    margin: 0;
    padding: 1rem;
    background: #1e1e1e;
    overflow-x: auto;
    max-height: 500px;
    overflow-y: auto;
  }
  
  .code-container code {
    color: #d4d4d4;
  }
  
  /* 行号 */
  .showLineNumbers .code-container {
    padding-left: 3rem;
  }
  
  /* 语法高亮主题 - Dark+ */
  .hljs-keyword { color: #569cd6; }
  .hljs-string { color: #ce9178; }
  .hljs-number { color: #b5cea8; }
  .hljs-comment { color: #6a9955; }
  .hljs-function { color: #dcdcaa; }
  .hljs-class { color: #4ec9b0; }
  .hljs-variable { color: #9cdcfe; }
  .hljs-operator { color: #d4d4d4; }
  .hljs-meta { color: #c586c0; }
  .hljs-built_in { color: #4fc1ff; }
  .hljs-title { color: #dcdcaa; }
  .hljs-params { color: #9cdcfe; }
  .hljs-property { color: #9cdcfe; }
  .hljs-attr { color: #9cdcfe; }
  .hljs-tag { color: #569cd6; }
  .hljs-name { color: #569cd6; }
  .hljs-type { color: #4ec9b0; }
  .hljs-symbol { color: #569cd6; }
  .hljs-bullet { color: #569cd6; }
  .hljs-link { color: #569cd6; }
  .hljs-deletion { color: #f44747; }
  .hljs-addition { color: #6a9955; }
</style>
