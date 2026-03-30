<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  export let currentTheme: 'light' | 'dark' = 'light'
  
  const dispatch = createEventDispatcher<{
    themeChange: { theme: 'light' | 'dark' }
  }>()
  
  const themes = [
    { id: 'light', name: '☀️ 浅色', icon: '☀️' },
    { id: 'dark', name: '🌙 深色', icon: '🌙' }
  ] as const
  
  function switchTheme(theme: 'light' | 'dark') {
    currentTheme = theme
    dispatch('themeChange', { theme })
  }
</script>

<div class="theme-switcher">
  {#each themes as theme}
    <button
      class="theme-btn {currentTheme === theme.id ? 'active' : ''}"
      on:click={() => switchTheme(theme.id)}
      title={theme.name}
    >
      {theme.icon}
    </button>
  {/each}
</div>

<style>
  .theme-switcher {
    display: flex;
    gap: 4px;
  }
  
  .theme-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #e0e0e0;
    background: #f5f5f5;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .theme-btn:hover {
    background: #e8e8e8;
  }
  
  .theme-btn.active {
    background: #1976d2;
    border-color: #1976d2;
    color: white;
  }
  
  :global(.dark-theme) {
    --bg-primary: #1e1e1e;
    --bg-secondary: #252525;
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --border-color: #333;
  }
  
  :global(.light-theme) {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f8f8;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e0e0e0;
  }
</style>
