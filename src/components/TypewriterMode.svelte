<script lang="ts">
  /**
   * 打字机模式组件 - Typewriter Mode
   * 保持光标始终在屏幕垂直居中位置，模拟打字机体验
   */
  
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let enabled = false;
  export let cursorPosition: 'top' | 'center' | 'bottom' = 'center';
  export let showCenterLine = true;
  export let showToggleButton = true;
  export let smoothScroll = true;
  export let scrollDuration = 300;
  
  let isTypewriterMode = false;
  let contentElement: HTMLElement | null = null;
  let centerLineElement: HTMLElement | null = null;
  let scrollAnimationId: number | null = null;
  
  const dispatch = createEventDispatcher<{
    toggle: { enabled: boolean };
    scroll: { position: number };
  }>();
  
  onMount(() => {
    contentElement = document.querySelector('.editor-content') as HTMLElement;
    
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      contentElement.addEventListener('keydown', handleKeyDown);
    }
    
    isTypewriterMode = enabled;
    updateTypewriterMode();
  });
  
  onDestroy(() => {
    if (contentElement) {
      contentElement.removeEventListener('scroll', handleScroll);
      contentElement.removeEventListener('keydown', handleKeyDown);
    }
    
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
    }
  });
  
  function handleScroll() {
    if (!isTypewriterMode) return;
    
    // 可以在这里添加滚动时的逻辑
    dispatch('scroll', { position: contentElement?.scrollTop || 0 });
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (!isTypewriterMode || !contentElement) return;
    
    // 在输入后延迟调整光标位置
    setTimeout(() => {
      adjustCursorPosition();
    }, 50);
  }
  
  function adjustCursorPosition() {
    if (!contentElement) return;
    
    const containerRect = contentElement.getBoundingClientRect();
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const cursorRect = range.getBoundingClientRect();
    
    // 计算目标滚动位置
    let targetScrollTop = contentElement.scrollTop;
    
    if (cursorPosition === 'center') {
      const centerOffset = containerRect.height / 2 - cursorRect.height / 2;
      targetScrollTop += cursorRect.top - containerRect.top - centerOffset;
    } else if (cursorPosition === 'top') {
      targetScrollTop += cursorRect.top - containerRect.top - 20; // 20px 顶部边距
    } else if (cursorPosition === 'bottom') {
      const bottomOffset = containerRect.height - cursorRect.height - 20;
      targetScrollTop += cursorRect.top - containerRect.top - bottomOffset;
    }
    
    // 限制滚动范围
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, contentElement.scrollHeight - containerRect.height));
    
    // 平滑滚动
    if (smoothScroll) {
      smoothScrollTo(targetScrollTop);
    } else {
      contentElement.scrollTop = targetScrollTop;
    }
    
    dispatch('scroll', { position: targetScrollTop });
  }
  
  function smoothScrollTo(targetScrollTop: number) {
    if (!contentElement) return;
    
    const startScrollTop = contentElement.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const startTime = performance.now();
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      
      // 缓动函数（easeInOutCubic）
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      contentElement.scrollTop = startScrollTop + distance * easeProgress;
      
      if (progress < 1) {
        scrollAnimationId = requestAnimationFrame(animate);
      }
    }
    
    scrollAnimationId = requestAnimationFrame(animate);
  }
  
  function toggleTypewriterMode() {
    isTypewriterMode = !isTypewriterMode;
    enabled = isTypewriterMode;
    updateTypewriterMode();
    
    dispatch('toggle', { enabled: isTypewriterMode });
    
    // 启用时立即调整光标位置
    if (isTypewriterMode) {
      setTimeout(adjustCursorPosition, 100);
    }
  }
  
  function updateTypewriterMode() {
    if (contentElement) {
      if (isTypewriterMode) {
        contentElement.classList.add('typewriter-mode');
      } else {
        contentElement.classList.remove('typewriter-mode');
      }
    }
  }
  
  function getButtonPositionClass(): string {
    const positionMap: Record<string, string> = {
      'top-right': 'top-right',
      'top-left': 'top-left',
      'bottom-right': 'bottom-right',
      'bottom-left': 'bottom-left',
    };
    return positionMap['top-right']; // 固定在右上角
  }
  
  $: buttonLabel = isTypewriterMode ? '⌨️ 退出打字机' : '⌨️ 打字机模式';
  $: buttonActive = isTypewriterMode;
</script>

<div class="typewriter-container">
  {#if showToggleButton}
    <button 
      class="typewriter-toggle" 
      class:active={buttonActive}
      on:click={toggleTypewriterMode}
      type="button"
      title={isTypewriterMode ? '退出打字机模式' : '进入打字机模式'}
    >
      <span class="icon">{buttonLabel.split(' ')[0]}</span>
      <span class="text">{buttonLabel.split(' ').slice(1).join(' ')}</span>
    </button>
  {/if}
  
  {#if isTypewriterMode && showCenterLine}
    <div class="center-line" aria-hidden="true"></div>
  {/if}
  
  <div class="content">
    <slot />
  </div>
  
  {#if isTypewriterMode}
    <div class="mode-indicator">
      <div class="typing-dot"></div>
      <span>打字机模式 - 光标居中</span>
    </div>
  {/if}
</div>

<style>
  .typewriter-container {
    position: relative;
    min-height: 100%;
  }
  
  .typewriter-toggle {
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
    top: 1rem;
    right: 1rem;
  }
  
  .typewriter-toggle:hover {
    background: #6f42c1;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
  }
  
  .typewriter-toggle:active {
    transform: translateY(0);
  }
  
  .typewriter-toggle.active {
    background: #6f42c1;
    color: white;
  }
  
  .icon {
    font-size: 16px;
  }
  
  .center-line {
    position: fixed;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(111, 66, 193, 0.3) 20%,
      rgba(111, 66, 193, 0.5) 50%,
      rgba(111, 66, 193, 0.3) 80%,
      transparent
    );
    pointer-events: none;
    z-index: 999;
  }
  
  .content {
    min-height: 200vh; /* 确保有足够的内容可以滚动 */
  }
  
  /* 打字机模式样式 */
  .typewriter-mode {
    scroll-behavior: auto; /* 禁用默认平滑滚动，使用自定义动画 */
  }
  
  /* 模式指示器 */
  .mode-indicator {
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
  
  .typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4CAF50;
    animation: typingBlink 1s infinite;
  }
  
  @keyframes typingBlink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  
  /* 暗色主题支持 */
  :global(.dark) .typewriter-toggle {
    background: #333;
    border-color: #9c27b0;
    color: #ce93d8;
  }
  
  :global(.dark) .typewriter-toggle:hover {
    background: #9c27b0;
    color: white;
  }
  
  :global(.dark) .typewriter-toggle.active {
    background: #9c27b0;
    color: white;
  }
  
  :global(.dark) .center-line {
    background: linear-gradient(
      to right,
      transparent,
      rgba(156, 39, 176, 0.3) 20%,
      rgba(156, 39, 176, 0.5) 50%,
      rgba(156, 39, 176, 0.3) 80%,
      transparent
    );
  }
  
  :global(.dark) .mode-indicator {
    background: rgba(156, 39, 176, 0.9);
  }
</style>
