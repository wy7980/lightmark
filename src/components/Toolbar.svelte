<script lang="ts">
  import ThemeSwitcher from './ThemeSwitcher.svelte'
  
  export let sidebarOpen = $bindable(true)
  export let autoSave = $bindable(true)
  export let theme: 'light' | 'dark' = 'light'
  export let previewMode: 'edit' | 'preview' = 'edit'
  export let focusMode = false
  export let typewriterMode = false
  
  const dispatch = createEventDispatcher<{
    openFile: void
    saveFile: void
    themeChange: { theme: 'light' | 'dark' }
    insertTable: void
    insertTask: void
    insertEquation: void
    togglePreview: void
    toggleFocus: void
    toggleTypewriter: void
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
      <button class="btn" title="插入任务列表" on:click={() => dispatch('insertTask')}>
        ✅ 任务
      </button>
      <button class="btn" title="插入数学公式" on:click={() => dispatch('insertEquation')}>
        ∑ 公式
      </button>
    </div>
    
    <div class="toolbar-center">
      <span class="title">LightMark</span>
    </div>
    
    <div class="toolbar-right">
      <div class="mode-buttons">
        <button 
          class="mode-btn {previewMode === 'edit' ? 'active' : ''}"
          on:click={() => dispatch('togglePreview')}
          title="编辑模式 (Ctrl+1)"
        >
          ✏️
        </button>
        <button 
          class="mode-btn {previewMode === 'preview' ? 'active' : ''}"
          on:click={() => dispatch('togglePreview')}
          title="预览模式 (Ctrl+2)"
        >
          👁️
        </button>
      </div>
      
      <button 
        class="mode-btn {focusMode ? 'active' : ''}"
        on:click={() => dispatch('toggleFocus')}
        title="焦点模式"
      >
        🎯
      </button>
      
      <button 
        class="mode-btn {typewriterMode ? 'active' : ''}"
        on:click={() => dispatch('toggleTypewriter')}
        title="打字机模式"
      >
        ⌨️
      </button>
      
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
  
  .mode-buttons {
    display: flex;
    gap: 2px;
    border-right: 1px solid #404040;
    padding-right: 8px;
    margin-right: 8px;
  }
  
  .mode-btn {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .mode-btn:hover {
    background: #404040;
  }
  
  .mode-btn.active {
    background: #1976d2;
  }
</style>
