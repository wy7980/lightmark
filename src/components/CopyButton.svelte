<script lang="ts">
  /**
   * 一键复制组件 - Copy Button
   * 支持复制文本到剪贴板，带成功提示
   */
  
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let text = '';
  export let showTooltip = true;
  export let tooltipDuration = 2000;
  export let disabled = false;
  
  let copied = false;
  let tooltipVisible = false;
  let copyError: string | null = null;
  
  const dispatch = createEventDispatcher<{
    copy: { success: boolean; text?: string; error?: string };
  }>();
  
  // 检测是否支持剪贴板 API
  let clipboardSupported = true;
  
  onMount(() => {
    clipboardSupported = !!navigator.clipboard;
  });
  
  async function copyToClipboard() {
    if (disabled || !text) return;
    
    try {
      if (clipboardSupported) {
        // 使用现代 Clipboard API
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用 execCommand
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textarea);
        }
      }
      
      // 复制成功
      copied = true;
      tooltipVisible = true;
      copyError = null;
      
      dispatch('copy', { success: true, text });
      
      // 自动隐藏提示
      setTimeout(() => {
        tooltipVisible = false;
        copied = false;
      }, tooltipDuration);
      
    } catch (error) {
      // 复制失败
      copyError = error instanceof Error ? error.message : '复制失败';
      dispatch('copy', { success: false, error: copyError });
    }
  }
  
  function getCopyButtonText(): string {
    if (disabled) return '⛔ 已禁用';
    if (copied) return '✅ 已复制';
    if (copyError) return '❌ 重试';
    return '📋 复制';
  }
  
  function getButtonClass(): string {
    if (disabled) return 'disabled';
    if (copied) return 'copied';
    if (copyError) return 'error';
    return '';
  }
  
  // 监听 text 变化，重置状态
  $: if (text && copied) {
    copied = false;
    tooltipVisible = false;
  }
</script>

<div class="copy-button-container">
  <button 
    class="copy-btn" 
    class:{copied}
    class:{error: copyError}
    class:{disabled}
    on:click={copyToClipboard}
    disabled={disabled}
    title={disabled ? '已禁用' : (copied ? '已复制到剪贴板' : '点击复制')}
    type="button"
  >
    <span class="icon">{getCopyButtonText().split(' ')[0]}</span>
    <span class="text">{getCopyButtonText().split(' ').slice(1).join(' ')}</span>
  </button>
  
  {#if tooltipVisible && showTooltip}
    <div class="tooltip" role="status" aria-live="polite">
      <span class="tooltip-text">✅ 已复制到剪贴板!</span>
      <div class="tooltip-arrow"></div>
    </div>
  {/if}
  
  {#if copyError && !tooltipVisible}
    <div class="error-message" role="alert">
      ⚠️ {copyError}
    </div>
  {/if}
</div>

<style>
  .copy-button-container {
    position: relative;
    display: inline-block;
  }
  
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #333;
    outline: none;
  }
  
  .copy-btn:hover:not(:disabled) {
    background: #f5f5f5;
    border-color: #999;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .copy-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .copy-btn.copied {
    background: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
  
  .copy-btn.error {
    background: #f44336;
    color: white;
    border-color: #f44336;
  }
  
  .copy-btn.disabled {
    background: #e0e0e0;
    color: #999;
    border-color: #e0e0e0;
    cursor: not-allowed;
  }
  
  .icon {
    font-size: 16px;
  }
  
  .text {
    white-space: nowrap;
  }
  
  /* 工具提示 */
  .tooltip {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    animation: tooltipFadeIn 0.2s ease;
    z-index: 1000;
  }
  
  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  .tooltip-text {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .tooltip-arrow {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #333;
  }
  
  /* 错误提示 */
  .error-message {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ffebee;
    color: #c62828;
    border-radius: 6px;
    font-size: 13px;
    border: 1px solid #ef9a9a;
    white-space: nowrap;
  }
  
  /* 暗色主题支持 */
  :global(.dark) .copy-btn {
    background: #333;
    border-color: #555;
    color: #e0e0e0;
  }
  
  :global(.dark) .copy-btn:hover:not(:disabled) {
    background: #3a3a3a;
    border-color: #666;
  }
  
  :global(.dark) .copy-btn.copied {
    background: #2e7d32;
    border-color: #2e7d32;
  }
  
  :global(.dark) .copy-btn.error {
    background: #c62828;
    border-color: #c62828;
  }
  
  :global(.dark) .error-message {
    background: #3e2727;
    color: #ef9a9a;
    border-color: #5d4037;
  }
</style>
