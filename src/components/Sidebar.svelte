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
  
  async function loadRecentFiles() {
    // TODO: 从 Tauri 后端加载
    recentFiles = []
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
      {#if recentFiles.length > 0}
        <ul class="file-list">
          {#each recentFiles as file}
            <li 
              class="file-item {filePath === file ? 'active' : ''}"
              on:click={() => dispatch('fileSelect', { detail: { path: file } })}
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
</style>
