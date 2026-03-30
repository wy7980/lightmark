<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  export let content = ''
  export let visible = true
  
  const dispatch = createEventDispatcher<{
    scrollTo: { line: number; id: string }
  }>()
  
  interface Heading {
    id: string
    text: string
    level: number
    line: number
  }
  
  let headings: Heading[] = []
  
  // 解析 Markdown 标题
  function parseHeadings(md: string): Heading[] {
    const lines = md.split('\n')
    const result: Heading[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        // 生成唯一 ID（用于跳转）
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        
        result.push({
          id,
          text,
          level,
          line: i
        })
      }
    }
    
    return result
  }
  
  // 监听内容变化
  $: headings = parseHeadings(content)
  
  // 获取缩进样式
  function getIndent(level: number): string {
    return `${(level - 1) * 12}px`
  }
  
  // 点击跳转
  function handleHeadingClick(heading: Heading) {
    dispatch('scrollTo', { 
      line: heading.line,
      id: heading.id 
    })
  }
</script>

{#if visible && headings.length > 0}
  <div class="outline">
    <h3 class="outline-title">📑 大纲</h3>
    <ul class="outline-list">
      {#each headings as heading (heading.id)}
        <li 
          class="outline-item level-{heading.level}"
          style:padding-left={getIndent(heading.level)}
          on:click={() => handleHeadingClick(heading)}
          title={heading.text}
        >
          <span class="outline-text">{heading.text}</span>
        </li>
      {/each}
    </ul>
  </div>
{:else if visible}
  <div class="outline-empty">
    <p>暂无标题</p>
    <p class="hint">使用 # 创建标题</p>
  </div>
{/if}

<style>
  .outline {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .outline-title {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  
  .outline-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .outline-item {
    padding: 6px 8px;
    margin: 2px 0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    color: #444;
    transition: background 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .outline-item:hover {
    background: #e8e8e8;
  }
  
  .outline-item.level-1 {
    font-weight: 600;
    color: #222;
  }
  
  .outline-item.level-2 {
    font-weight: 500;
  }
  
  .outline-item.level-3 {
    font-size: 12px;
    color: #555;
  }
  
  .outline-item.level-4,
  .outline-item.level-5,
  .outline-item.level-6 {
    font-size: 11px;
    color: #666;
  }
  
  .outline-text {
    display: block;
  }
  
  .outline-empty {
    padding: 16px;
    text-align: center;
    color: #999;
    font-size: 13px;
  }
  
  .outline-empty .hint {
    margin-top: 8px;
    font-size: 12px;
    color: #bbb;
  }
</style>
