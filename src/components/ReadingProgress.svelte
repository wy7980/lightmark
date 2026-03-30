<script lang="ts">
  /**
   * 阅读进度指示器组件
   * 显示当前文档的阅读进度百分比
   */
  
  import { onMount, onDestroy } from 'svelte';
  
  export let targetElement: HTMLElement | null = null;
  export let showPercentage = true;
  export let showProgressBar = true;
  export let position: 'top' | 'bottom' = 'top';
  
  let progress = 0;
  let scrollHeight = 0;
  let clientHeight = 0;
  let scrollTop = 0;
  let animationFrameId: number;
  
  onMount(() => {
    if (!targetElement) {
      targetElement = document.querySelector('.editor-content') as HTMLElement;
    }
    
    if (targetElement) {
      targetElement.addEventListener('scroll', handleScroll);
      calculateProgress();
    }
    
    window.addEventListener('resize', calculateProgress);
  });
  
  onDestroy(() => {
    if (targetElement) {
      targetElement.removeEventListener('scroll', handleScroll);
    }
    window.removeEventListener('resize', calculateProgress);
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
  
  function handleScroll() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    animationFrameId = requestAnimationFrame(() => {
      calculateProgress();
    });
  }
  
  function calculateProgress() {
    if (!targetElement) return;
    
    scrollHeight = targetElement.scrollHeight;
    clientHeight = targetElement.clientHeight;
    scrollTop = targetElement.scrollTop;
    
    const maxScroll = scrollHeight - clientHeight;
    progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  }
  
  function getProgressColor(): string {
    if (progress < 25) return '#4CAF50';
    if (progress < 50) return '#8BC34A';
    if (progress < 75) return '#FFC107';
    if (progress < 90) return '#FF9800';
    return '#F44336';
  }
  
  $: progressText = `${Math.round(progress)}%`;
  $: progressColor = getProgressColor();
</script>

<div class="reading-progress" class:position>
  {#if showProgressBar}
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {progress}%; background-color: {progressColor}"
      ></div>
    </div>
  {/if}
  
  {#if showPercentage}
    <div class="progress-text" style="color: {progressColor}">
      {progressText}
    </div>
  {/if}
</div>

<style>
  .reading-progress {
    position: fixed;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    transition: all 0.3s ease;
  }
  
  .position.top {
    top: 1rem;
    right: 1rem;
  }
  
  .position.bottom {
    bottom: 1rem;
    right: 1rem;
  }
  
  .progress-bar {
    width: 100px;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.1s ease, background-color 0.3s ease;
  }
  
  .progress-text {
    font-size: 12px;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }
  
  /* 暗色主题支持 */
  :global(.dark) .reading-progress {
    background: rgba(30, 30, 30, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  :global(.dark) .progress-bar {
    background: #424242;
  }
</style>
