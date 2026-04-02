<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Outline from './Outline.svelte'
  
  export let open = true
  export let filePath: string | null = null
  export let content = ''
  
  const dispatch = createEventDispatcher<{
    fileSelect: { path: string }
    outlineScroll: { line: number; id: string }
  }>()
  
  let recentFiles: string[] = []
  let isLoading = false
  let loadError: string | null = null
  
  /**
   * 加载最近文件列表
   * - 添加加载状态
   * - 错误处理
   * - 超时保护
   */
  async function loadRecentFiles() {
    try {
      isLoading = true
      loadError = null
      
      // 模拟异步加载（替换为实际的后端调用）
      // const response = await invoke('get_recent_files')
      // recentFiles = response
      
      // 超时保护：5 秒
      const timeoutPromise = new Promise<string[]>((_, reject) => {
        setTimeout(() => reject(new Error('加载超时')), 5000)
      })
      
      // 实际使用时替换为真实调用
      const loadPromise = (async () => {
        // TODO: 从 Tauri 后端加载
        return []
      })()
      
      recentFiles = await Promise.race([loadPromise, timeoutPromise])
      
      console.log('[Sidebar] 最近文件加载成功:', recentFiles.length, '个文件')
    } catch (error) {
      loadError = error instanceof Error ? error.message : '加载失败'
      console.error('[Sidebar] 加载最近文件失败:', error)
      
      // 优雅降级：使用空列表
      recentFiles = []
    } finally {
      isLoading = false
    }
  }
  
  $: if (open) {
    loadRecentFiles()
  }
</script>

{#if open}
  <div class="sidebar">
    <!-- 大纲导航 -->
    <Outline 
      content={content} 
      visible={true}
      on:scrollTo={(e) => dispatch('outlineScroll', e.detail)}
    />
    
    <!-- 最近文件 -->
    <div class="sidebar-section">
      <h3>📁 最近文件</h3>
      
      {#if isLoading}
        <p class="loading">加载中...</p>
      {:else if loadError}
        <p class="error">⚠️ {loadError}</p>
        <button class="retry-btn" on:click={loadRecentFiles}>重试</button>
      {:else if recentFiles.length > 0}
        <ul class="file-list">
          {#each recentFiles as file (file)}
            <li 
              class="file-item {filePath === file ? 'active' : ''}"
              on:click={() => dispatch('fileSelect', { detail: { path: file } })}
              title={file}
            >
              📄 {file}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">暂无最近文件</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .sidebar {
    width: 250px;
    background: #f8f8f8;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-section {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  h3 {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  
  .file-list {
    list-style: none;
  }
  
  .file-item {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    transition: background 0.2s;
  }
  
  .file-item:hover {
    background: #e8e8e8;
  }
  
  .file-item.active {
    background: #d0d0d0;
  }
  
  .empty {
    font-size: 13px;
    color: #999;
  }
  
  .loading {
    font-size: 13px;
    color: #666;
    text-align: center;
    padding: 16px 0;
  }
  
  .error {
    font-size: 13px;
    color: #c62828;
    background: #ffebee;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  .retry-btn {
    width: 100%;
    padding: 6px 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  }
  
  .retry-btn:hover {
    background: #1565c0;
  }
</style>
