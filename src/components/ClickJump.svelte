<script lang="ts">
  /**
   * 点击跳转组件 - 为大纲导航提供点击跳转功能
   * 点击标题可以快速跳转到文档对应位置
   */
  
  import { onMount } from 'svelte';
  
  export interface Heading {
    text: string;
    level: number;
    id: string;
    index: number;
  }
  
  export let headings: Heading[] = [];
  export let activeHeading: string | null = null;
  export let editorElement: HTMLElement | null = null;
  
  let containerElement: HTMLElement;
  
  onMount(() => {
    if (!editorElement) {
      editorElement = document.querySelector('.editor-content') as HTMLElement;
    }
    
    // 监听滚动来更新活动标题
    if (editorElement) {
      editorElement.addEventListener('scroll', handleScroll);
    }
  });
  
  function handleScroll() {
    if (!editorElement || headings.length === 0) return;
    
    const scrollTop = editorElement.scrollTop;
    const threshold = 100; // 视口顶部偏移
    
    // 找到当前可见的第一个标题
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const element = document.getElementById(heading.id);
      
      if (element) {
        const offsetTop = element.offsetTop;
        if (offsetTop <= scrollTop + threshold) {
          activeHeading = heading.id;
          break;
        }
      }
    }
  }
  
  function jumpToHeading(heading: Heading) {
    if (!editorElement) return;
    
    const element = document.getElementById(heading.id);
    if (element) {
      // 平滑滚动到标题位置
      editorElement.scrollTo({
        top: element.offsetTop - 20, // 留出顶部边距
        behavior: 'smooth'
      });
      
      // 更新活动标题
      activeHeading = heading.id;
    }
  }
  
  function getHeadingIndent(level: number): string {
    const indentMap: Record<number, string> = {
      1: '0px',
      2: '12px',
      3: '24px',
      4: '36px',
      5: '48px',
      6: '60px',
    };
    return indentMap[level] || '0px';
  }
  
  function getHeadingIcon(level: number): string {
    const icons: Record<number, string> = {
      1: '📑',
      2: '📄',
      3: '📝',
      4: '📋',
      5: '📎',
      6: '📌',
    };
    return icons[level] || '📍';
  }
</script>

<div class="heading-navigator" bind:this={containerElement}>
  <div class="header">
    <span class="title">📖 目录导航</span>
    <span class="count">{headings.length} 个标题</span>
  </div>
  
  <div class="headings-list">
    {#if headings.length === 0}
      <div class="empty-state">
        <p>暂无标题</p>
        <small>文档中的标题将显示在这里</small>
      </div>
    {:else}
      {#each headings as heading (heading.id)}
        <div 
          class="heading-item"
          class:active={activeHeading === heading.id}
          style="padding-left: {getHeadingIndent(heading.level)}"
          on:click={() => jumpToHeading(heading)}
          role="button"
          tabindex="0"
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              jumpToHeading(heading);
            }
          }}
        >
          <span class="icon">{getHeadingIcon(heading.level)}</span>
          <span class="text">{heading.text}</span>
          <span class="level">H{heading.level}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .heading-navigator {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fafafa;
    border-right: 1px solid #e0e0e0;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    background: #f5f5f5;
  }
  
  .title {
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }
  
  .count {
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  .headings-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }
  
  .heading-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    padding-right: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    font-size: 13px;
    line-height: 1.5;
  }
  
  .heading-item:hover {
    background: #f0f0f0;
    border-left-color: #bdbdbd;
  }
  
  .heading-item.active {
    background: #e3f2fd;
    border-left-color: #2196F3;
    color: #1976D2;
    font-weight: 500;
  }
  
  .icon {
    font-size: 12px;
    opacity: 0.7;
  }
  
  .text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .level {
    font-size: 10px;
    color: #999;
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #999;
  }
  
  .empty-state p {
    margin: 0 0 0.5rem 0;
    font-size: 14px;
  }
  
  .empty-state small {
    font-size: 12px;
  }
  
  /* 滚动条样式 */
  .headings-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .headings-list::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
  
  .headings-list::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 3px;
  }
  
  .headings-list::-webkit-scrollbar-thumb:hover {
    background: #9e9e9e;
  }
  
  /* 暗色主题支持 */
  :global(.dark) .heading-navigator {
    background: #1e1e1e;
    border-right-color: #333;
  }
  
  :global(.dark) .header {
    background: #252525;
    border-bottom-color: #333;
  }
  
  :global(.dark) .title {
    color: #e0e0e0;
  }
  
  :global(.dark) .count {
    background: #424242;
    color: #bdbdbd;
  }
  
  :global(.dark) .heading-item:hover {
    background: #2a2a2a;
    border-left-color: #616161;
  }
  
  :global(.dark) .heading-item.active {
    background: #1a237e;
    border-left-color: #5c6bc0;
    color: #9fa8da;
  }
</style>
