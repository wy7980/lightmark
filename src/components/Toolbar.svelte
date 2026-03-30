<script lang="ts">
  import ThemeSwitcher from './ThemeSwitcher.svelte'
  
  export let sidebarOpen = $bindable(true)
  export let autoSave = $bindable(true)
  export let theme: 'light' | 'dark' = 'light'
  
  const dispatch = createEventDispatcher<{
    openFile: void
    saveFile: void
    themeChange: { theme: 'light' | 'dark' }
    insertTable: void
  }>()
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="btn" title="打开文件" on:click={() => dispatch('openFile')}>
        📁 打开
      </button>
      <button class="btn" title="保存" on:click={() => dispatch('saveFile')}>
        💾 保存
      </button>
      <button class="btn" title="插入表格" on:click={() => dispatch('insertTable')}>
        📊 表格
      </button>
    </div>
    
    <div class="toolbar-center">
      <span class="title">LightMark</span>
    </div>
    
    <div class="toolbar-right">
      <ThemeSwitcher 
        currentTheme={theme}
        on:themeChange={(e) => dispatch('themeChange', e.detail)}
      />
      
      <label class="toggle-label">
        <input type="checkbox" bind:checked={autoSave} />
        自动保存
      </label>
      
      <button 
        class="btn icon-btn" 
        title="切换侧边栏"
        on:click={() => sidebarOpen = !sidebarOpen}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
    </div>
  </div>
</template>

<style>
  .toolbar {
    height: 48px;
    background: #2d2d2d;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #404040;
  }
  
  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .toolbar-center {
    flex: 1;
    text-align: center;
  }
  
  .title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }
  
  .btn {
    padding: 6px 12px;
    background: #404040;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  }
  
  .btn:hover {
    background: #505050;
  }
  
  .icon-btn {
    padding: 6px 10px;
    min-width: 32px;
  }
  
  .toggle-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }
  
  .toggle-label input {
    cursor: pointer;
  }
</style>
