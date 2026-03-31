<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher<{
    imageInsert: { src: string; alt: string }
  }>()
  
  let isDragging = false
  let dropZone: HTMLDivElement
  
  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    isDragging = true
  }
  
  function handleDragLeave() {
    isDragging = false
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault()
    isDragging = false
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }
  
  function handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const src = e.target?.result as string
          const alt = file.name.replace(/\.[^/.]+$/, '')
          dispatch('imageInsert', { src, alt })
        }
        reader.readAsDataURL(file)
      }
    })
  }
  
  // 处理剪贴板粘贴
  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items
    if (items) {
      Array.from(items).forEach(item => {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleFiles({ 0: file, length: 1 } as any)
          }
        }
      })
    }
  }
</script>

<div 
  class="drop-zone {isDragging ? 'dragging' : ''}"
  bind:this={dropZone}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:paste={handlePaste}
>
  {#if isDragging}
    <div class="drop-overlay">
      <div class="drop-content">
        <span class="drop-icon">📷</span>
        <p class="drop-text">释放以插入图片</p>
        <p class="drop-hint">支持拖放或剪贴板粘贴</p>
      </div>
    </div>
  {/if}
  <slot />
</div>

<style>
  .drop-zone {
    position: relative;
    height: 100%;
    width: 100%;
  }
  
  .drop-zone.dragging {
    border: 2px dashed #1976d2;
  }
  
  .drop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(25, 118, 210, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    pointer-events: none;
  }
  
  .drop-content {
    text-align: center;
    padding: 32px;
    background: var(--bg-primary, #fff);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  
  .drop-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
  
  .drop-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #333);
    margin: 0 0 8px 0;
  }
  
  .drop-hint {
    font-size: 14px;
    color: var(--text-secondary, #666);
    margin: 0;
  }
</style>
