<script lang="ts">
  /**
   * 焦点模式组件 - Focus Mode
   * 高亮当前段落，淡化其他内容，提升专注度
   */
  
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let enabled = false;
  export let fadeOpacity = 0.3;
  export let highlightCurrentParagraph = true;
  export let showToggleButton = true;
  export let buttonPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  
  let isFocusMode = false;
  let currentElement: HTMLElement | null = null;
  let contentElement: HTMLElement | null = null;
  
  const dispatch = createEventDispatcher<{
    toggle: { enabled: boolean };
    focus: { element: HTMLElement | null };
  }>();
  
  onMount(() => {
    contentElement = document.querySelector('.editor-content') as HTMLElement;
    
    if (contentElement) {
      contentElement.addEventListener('mouseover', handleMouseOver);
      contentElement.addEventListener('mouseout', handleMouseOut);
    }
    
    isFocusMode = enabled;
    updateFocusMode();
  });
  
  onDestroy(() => {
    if (contentElement) {
      contentElement.removeEventListener('mouseover', handleMouseOver);
      contentElement.removeEventListener('mouseout', handleMouseOut);
    }
  });
  
  function handleMouseOver(event: MouseEvent) {
    if (!isFocusMode || !highlightCurrentParagraph) return;
    
    const target = event.target as HTMLElement;
    const paragraph = findParentParagraph(target);
    
    if (paragraph && paragraph !== currentElement) {
      // 清除之前的高亮
      if (currentElement) {
        currentElement.style.opacity = '1';
      }
      
      // 设置新的高亮
      currentElement = paragraph;
      currentElement.style.opacity = '1';
      
      // 淡化其他内容
      fadeOtherElements(paragraph);
      
      dispatch('focus', { element: paragraph });
    }
  }
  
  function handleMouseOut(event: MouseEvent) {
    if (!isFocusMode || !highlightCurrentParagraph) return;
    
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // 如果鼠标移出了段落
    if (!relatedTarget || !findParentParagraph(relatedTarget)) {
      if (currentElement) {
        currentElement.style.opacity = '1';
        currentElement = null;
      }
      
      // 恢复所有元素的透明度
      restoreAllElements();
      
      dispatch('focus', { element: null });
    }
  }
  
  function findParentParagraph(element: HTMLElement): HTMLElement | null {
    if (!element) return null;
    
    // 向上查找最近的段落元素
    const paragraph = element.closest('p, div, li, h1, h2, h3, h4, h5, h6, pre, blockquote');
    return paragraph as HTMLElement;
  }
  
  function fadeOtherElements(current: HTMLElement) {
    if (!contentElement) return;
    
    const allElements = contentElement.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, pre, blockquote');
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl !== current && !current.contains(htmlEl) && !htmlEl.contains(current)) {
        htmlEl.style.transition = 'opacity 0.3s ease';
        htmlEl.style.opacity = fadeOpacity.toString();
      }
    });
  }
  
  function restoreAllElements() {
    if (!contentElement) return;
    
    const allElements = contentElement.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, pre, blockquote');
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '1';
    });
  }
  
  function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    enabled = isFocusMode;
    updateFocusMode();
    
    dispatch('toggle', { enabled: isFocusMode });
  }
  
  function updateFocusMode() {
    if (contentElement) {
      if (isFocusMode) {
        contentElement.classList.add('focus-mode');
      } else {
        contentElement.classList.remove('focus-mode');
        restoreAllElements();
        currentElement = null;
      }
    }
  }
  
  function getButtonPositionClass(): string {
    const positionMap = {
      'top-right': 'top-right',
      'top-left': 'top-left',
      'bottom-right': 'bottom-right',
      'bottom-left': 'bottom-left',
    };
    return positionMap[buttonPosition];
  }
  
  $: buttonLabel = isFocusMode ? '🎯 退出焦点' : '🎯 焦点模式';
  $: buttonActive = isFocusMode;
</script>

<div class="focus-mode-container">
  {#if showToggleButton}
    <button 
      class="focus-toggle" 
      class:active={buttonActive}
      on:click={toggleFocusMode}
      type="button"
      title={isFocusMode ? '退出焦点模式' : '进入焦点模式'}
    >
      <span class="icon">{buttonLabel.split(' ')[0]}</span>
      <span class="text">{buttonLabel.split(' ').slice(1).join(' ')}</span>
    </button>
  {/if}
  
  <div class="content">
    <slot />
  </div>
  
  {#if isFocusMode}
    <div class="focus-indicator">
      <div class="pulse-ring"></div>
      <span>焦点模式已启用</span>
    </div>
  {/if}
</div>

<style>
  .focus-mode-container {
    position: relative;
  }
  
  .focus-toggle {
    position: fixed;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid #6f42c1;
    background: white;
    color: #6f42c1;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(111, 66, 193, 0.2);
  }
  
  .focus-toggle.top-right {
    top: 1rem;
    right: 1rem;
  }
  
  .focus-toggle.top-left {
    top: 1rem;
    left: 1rem;
  }
  
  .focus-toggle.bottom-right {
    bottom: 1rem;
    right: 1rem;
  }
  
  .focus-toggle.bottom-left {
    bottom: 1rem;
    left: 1rem;
  }
  
  .focus-toggle:hover {
    background: #6f42c1;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
  }
  
  .focus-toggle:active {
    transform: translateY(0);
  }
  
  .focus-toggle.active {
    background: #6f42c1;
    color: white;
  }
  
  .icon {
    font-size: 16px;
  }
  
  .content {
    transition: all 0.3s ease;
  }
  
  /* 焦点模式样式 */
  .focus-mode {
    transition: all 0.3s ease;
  }
  
  .focus-mode p,
  .focus-mode div,
  .focus-mode li,
  .focus-mode h1,
  .focus-mode h2,
  .focus-mode h3,
  .focus-mode h4,
  .focus-mode h5,
  .focus-mode h6,
  .focus-mode pre,
  .focus-mode blockquote {
    transition: opacity 0.3s ease;
  }
  
  /* 焦点指示器 */
  .focus-indicator {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(111, 66, 193, 0.9);
    color: white;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    z-index: 999;
    animation: indicatorFadeIn 0.3s ease;
  }
  
  @keyframes indicatorFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .pulse-ring {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4CAF50;
    position: relative;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
  }
  
  /* 暗色主题支持 */
  :global(.dark) .focus-toggle {
    background: #333;
    border-color: #9c27b0;
    color: #ce93d8;
  }
  
  :global(.dark) .focus-toggle:hover {
    background: #9c27b0;
    color: white;
  }
  
  :global(.dark) .focus-toggle.active {
    background: #9c27b0;
    color: white;
  }
  
  :global(.dark) .focus-indicator {
    background: rgba(156, 39, 176, 0.9);
  }
</style>
