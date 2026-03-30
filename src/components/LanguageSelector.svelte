<script lang="ts">
  /**
   * 语言选择器组件 - Language Selector
   * 支持多种编程语言选择，带图标和搜索功能
   */
  
  import { createEventDispatcher } from 'svelte';
  
  export let selectedLanguage = 'javascript';
  export let showIcons = true;
  export let showSearch = true;
  export let compact = false;
  
  let searchQuery = '';
  let dropdownOpen = false;
  
  const dispatch = createEventDispatcher<{
    change: { language: string };
  }>();
  
  // 完整的语言列表（30 种）
  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨', group: 'Web' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷', group: 'Web' },
    { value: 'html', label: 'HTML', icon: '🌐', group: 'Web' },
    { value: 'css', label: 'CSS', icon: '🎨', group: 'Web' },
    { value: 'python', label: 'Python', icon: '🐍', group: 'Backend' },
    { value: 'java', label: 'Java', icon: '☕', group: 'Backend' },
    { value: 'cpp', label: 'C++', icon: '⚙️', group: 'System' },
    { value: 'c', label: 'C', icon: '🔧', group: 'System' },
    { value: 'go', label: 'Go', icon: '🐹', group: 'Backend' },
    { value: 'rust', label: 'Rust', icon: '🦀', group: 'System' },
    { value: 'ruby', label: 'Ruby', icon: '💎', group: 'Backend' },
    { value: 'php', label: 'PHP', icon: '🐘', group: 'Backend' },
    { value: 'swift', label: 'Swift', icon: '🍎', group: 'Mobile' },
    { value: 'kotlin', label: 'Kotlin', icon: '📱', group: 'Mobile' },
    { value: 'sql', label: 'SQL', icon: '🗄️', group: 'Database' },
    { value: 'bash', label: 'Bash', icon: '💻', group: 'Shell' },
    { value: 'shell', label: 'Shell', icon: '🐚', group: 'Shell' },
    { value: 'json', label: 'JSON', icon: '📋', group: 'Data' },
    { value: 'yaml', label: 'YAML', icon: '📝', group: 'Data' },
    { value: 'xml', label: 'XML', icon: '📄', group: 'Data' },
    { value: 'markdown', label: 'Markdown', icon: '📑', group: 'Text' },
    { value: 'text', label: 'Plain Text', icon: '📃', group: 'Text' },
    { value: 'lua', label: 'Lua', icon: '🌙', group: 'Script' },
    { value: 'perl', label: 'Perl', icon: '🔮', group: 'Script' },
    { value: 'r', label: 'R', icon: '📊', group: 'Data' },
    { value: 'scala', label: 'Scala', icon: '⚡', group: 'Backend' },
    { value: 'dart', label: 'Dart', icon: '🎯', group: 'Mobile' },
    { value: 'elixir', label: 'Elixir', icon: '💧', group: 'Backend' },
    { value: 'erlang', label: 'Erlang', icon: '📞', group: 'Backend' },
    { value: 'haskell', label: 'Haskell', icon: 'λ', group: 'Functional' },
  ];
  
  // 按组分类
  const languageGroups = [...new Set(languages.map(l => l.group))];
  
  function selectLanguage(lang: string) {
    selectedLanguage = lang;
    dropdownOpen = false;
    searchQuery = '';
    dispatch('change', { language: lang });
  }
  
  function getLanguageIcon(lang: string): string {
    const language = languages.find(l => l.value === lang);
    return language?.icon || '📝';
  }
  
  function getLanguageLabel(lang: string): string {
    const language = languages.find(l => l.value === lang);
    return language?.label || lang;
  }
  
  function getSelectedLanguage(): { value: string; label: string; icon: string } | undefined {
    return languages.find(l => l.value === selectedLanguage);
  }
  
  // 过滤语言列表
  function getFilteredLanguages(group: string) {
    if (!searchQuery) {
      return languages.filter(l => l.group === group);
    }
    
    const query = searchQuery.toLowerCase();
    return languages.filter(l => 
      l.group === group && 
      (l.label.toLowerCase().includes(query) || 
       l.value.toLowerCase().includes(query))
    );
  }
  
  // 切换下拉菜单
  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    if (dropdownOpen && showSearch) {
      setTimeout(() => {
        const input = document.querySelector('.language-search input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }
  
  // 点击外部关闭下拉菜单
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (dropdownOpen && !target.closest('.language-selector')) {
      dropdownOpen = false;
    }
  }
  
  // 键盘导航
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      dropdownOpen = false;
      searchQuery = '';
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="language-selector" class:compact class:open={dropdownOpen}>
  <!-- 选择按钮 -->
  <button class="selector-button" on:click={toggleDropdown} type="button">
    {#if showIcons}
      <span class="icon">{getLanguageIcon(selectedLanguage)}</span>
    {/if}
    <span class="label">{getLanguageLabel(selectedLanguage)}</span>
    <span class="arrow">{dropdownOpen ? '▲' : '▼'}</span>
  </button>
  
  <!-- 下拉菜单 -->
  {#if dropdownOpen}
    <div class="dropdown-menu">
      <!-- 搜索框 -->
      {#if showSearch}
        <div class="language-search">
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="搜索语言..."
            on:click|stopPropagation
          />
          {#if searchQuery}
            <button class="clear-search" on:click={(e) => { e.stopPropagation(); searchQuery = ''; }}>✕</button>
          {/if}
        </div>
      {/if}
      
      <!-- 语言列表（分组显示） -->
      <div class="language-list">
        {#each languageGroups as group}
          {#if getFilteredLanguages(group).length > 0}
            <div class="language-group">
              <div class="group-header">{group}</div>
              {#each getFilteredLanguages(group) as lang}
                <button 
                  class="language-option"
                  class:active={selectedLanguage === lang.value}
                  on:click={() => selectLanguage(lang.value)}
                  type="button"
                >
                  {#if showIcons}
                    <span class="icon">{lang.icon}</span>
                  {/if}
                  <span class="label">{lang.label}</span>
                  <span class="value">{lang.value}</span>
                </button>
              {/each}
            </div>
          {/if}
        {/each}
        
        {#if searchQuery && languages.filter(l => 
          l.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
          l.value.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0}
          <div class="no-results">
            未找到匹配的语言
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .language-selector {
    position: relative;
    display: inline-block;
  }
  
  .selector-button {
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
    transition: all 0.2s;
    color: #333;
    outline: none;
  }
  
  .selector-button:hover {
    background: #f5f5f5;
    border-color: #999;
  }
  
  .selector-button:focus {
    border-color: #0366d6;
    box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
  }
  
  .icon {
    font-size: 16px;
  }
  
  .label {
    font-weight: 600;
  }
  
  .arrow {
    font-size: 10px;
    color: #666;
    margin-left: 0.25rem;
  }
  
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 280px;
    max-width: 320px;
    max-height: 400px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    overflow: hidden;
    animation: dropdownFadeIn 0.2s ease;
  }
  
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .language-search {
    position: relative;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  
  .language-search input {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
  }
  
  .language-search input:focus {
    border-color: #0366d6;
  }
  
  .clear-search {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 16px;
    padding: 0.25rem;
  }
  
  .clear-search:hover {
    color: #333;
  }
  
  .language-list {
    max-height: 320px;
    overflow-y: auto;
    padding: 0.5rem 0;
  }
  
  .language-group {
    margin-bottom: 0.5rem;
  }
  
  .group-header {
    padding: 0.5rem 1rem;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #f9f9f9;
  }
  
  .language-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    transition: background 0.15s;
    color: #333;
  }
  
  .language-option:hover {
    background: #f5f5f5;
  }
  
  .language-option.active {
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 600;
  }
  
  .language-option .icon {
    font-size: 18px;
  }
  
  .language-option .label {
    flex: 1;
  }
  
  .language-option .value {
    font-size: 12px;
    color: #999;
    font-family: 'Fira Code', monospace;
  }
  
  .no-results {
    padding: 2rem 1rem;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
  
  /* 紧凑模式 */
  .compact .selector-button {
    padding: 0.25rem 0.5rem;
    font-size: 13px;
  }
  
  .compact .icon {
    font-size: 14px;
  }
  
  .compact .label {
    display: none;
  }
  
  /* 暗色主题支持 */
  :global(.dark) .selector-button {
    background: #333;
    border-color: #555;
    color: #e0e0e0;
  }
  
  :global(.dark) .selector-button:hover {
    background: #3a3a3a;
    border-color: #666;
  }
  
  :global(.dark) .dropdown-menu {
    background: #2d2d2d;
    border-color: #444;
  }
  
  :global(.dark) .language-search {
    border-bottom-color: #444;
  }
  
  :global(.dark) .language-search input {
    background: #333;
    border-color: #555;
    color: #e0e0e0;
  }
  
  :global(.dark) .group-header {
    background: #252525;
    color: #999;
  }
  
  :global(.dark) .language-option {
    color: #e0e0e0;
  }
  
  :global(.dark) .language-option:hover {
    background: #3a3a3a;
  }
  
  :global(.dark) .language-option.active {
    background: #1a237e;
    color: #9fa8da;
  }
  
  :global(.dark) .language-option .value {
    color: #757575;
  }
</style>
