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
  
  /**
   * 处理图片文件
   * - 验证文件类型
   * - 限制文件大小 (5MB)
   * - 错误处理
   */
  function handleFiles(files: FileList) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    
    Array.from(files).forEach(file => {
      try {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          console.warn('[ImageDrop] 不支持的文件类型:', file.type)
          return
        }
        
        // 验证具体类型
        if (!ALLOWED_TYPES.includes(file.type)) {
          console.warn('[ImageDrop] 不支持的图片格式:', file.type)
          return
        }
        
        // 验证文件大小
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / 1024 / 1024).toFixed(2)
          console.warn('[ImageDrop] 文件过大:', sizeMB, 'MB')
          return
        }
        
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const src = e.target?.result as string
            const alt = file.name.replace(/\.[^/.]+$/, '')
            
            // 验证生成的 dataURL
            if (!src || src.length === 0) {
              throw new Error('生成的图片数据为空')
            }
            
            dispatch('imageInsert', { src, alt })
            console.log('[ImageDrop] 图片插入成功:', alt)
          } catch (error) {
            console.error('[ImageDrop] 处理图片数据失败:', error)
          }
        }
        
        reader.onerror = () => {
          console.error('[ImageDrop] 读取文件失败')
        }
        
        reader.onabort = () => {
          console.warn('[ImageDrop] 读取文件被中止')
        }
        
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('[ImageDrop] 处理文件异常:', error)
      }
    })
  }
  
  // 处理剪贴板粘贴
  function handlePaste(e: ClipboardEvent) {
    try {
      const items = e.clipboardData?.items
      if (!items) {
        console.warn('[ImageDrop] 剪贴板数据不可用')
        return
      }
      
      Array.from(items).forEach(item => {
        try {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              handleFiles({ 0: file, length: 1 } as any)
            } else {
              console.warn('[ImageDrop] 无法从剪贴板获取文件')
            }
          }
        } catch (error) {
          console.error('[ImageDrop] 处理剪贴板项目失败:', error)
        }
      })
    } catch (error) {
      console.error('[ImageDrop] 处理粘贴异常:', error)
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
