<script lang="ts">
  import Editor from './components/Editor.svelte'
  import Toolbar from './components/Toolbar.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import ImageDrop from './components/ImageDrop.svelte'
  import TableEditor from './components/TableEditor.svelte'
  import TaskList from './components/TaskList.svelte'
  import { invoke } from '@tauri-apps/api/core'
  
  let showTableEditor = false
  let showTaskEditor = false
  
  // 错误处理
  let loadError: string | null = null
  let isLoaded = false
  
  // 组件挂载时检查
  function handleMount() {
    console.log('[LightMark] App mounted')
    isLoaded = true
  }
  
  function handleError(error: unknown) {
    console.error('App error:', error)
    loadError = error instanceof Error ? error.message : String(error)
  }
  
  // 监听加载
  setTimeout(() => {
    if (!isLoaded && !loadError) {
      loadError = '加载超时，请检查控制台日志'
    }
  }, 5000)
  
  let filePath: string | null = null
  let content = ''
  let previewHtml = ''
  let wordCount = 0
  let charCount = 0
  let autoSave = true
  let sidebarOpen = true
  let theme: 'light' | 'dark' = 'light'
  let previewMode: 'edit' | 'preview' = 'edit'
  let focusMode = false
  let typewriterMode = false
  
  // 应用主题
  function applyTheme(newTheme: 'light' | 'dark') {
    theme = newTheme
    document.documentElement.classList.remove('light-theme', 'dark-theme')
    document.documentElement.classList.add(`${newTheme}-theme`)
    document.documentElement.style.colorScheme = newTheme
  }
  
  // 初始化主题
  applyTheme('light')
  
  // 键盘快捷键
  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '1') {
        e.preventDefault()
        previewMode = 'edit'
      } else if (e.key === '2') {
        e.preventDefault()
        previewMode = 'preview'
      }
    }
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })
  
  // 防抖解析
  let parseTimeout: number
  
  async function parseContent(newContent: string) {
    clearTimeout(parseTimeout)
    
    return new Promise<void>((resolve) => {
      parseTimeout = setTimeout(async () => {
        try {
          const result = await invoke<ParseResult>('parse_markdown', {
            content: newContent
          })
          previewHtml = result.html
          wordCount = result.word_count
          charCount = result.char_count
          
          // 自动保存
          if (autoSave && filePath) {
            await invoke('save_file', {
              path: filePath,
              content: newContent
            })
          }
        } catch (err) {
          console.error('解析失败:', err)
        }
        resolve()
      }, 50) // 50ms 防抖
    })
  }
  
  async function handleContentChange(newContent: string) {
    content = newContent
    await parseContent(newContent)
  }
  
  async function openFile() {
    // TODO: 使用 Tauri 文件对话框
    const testPath = '/home/node/.openclaw/workspace/test.md'
    try {
      const result = await invoke<FileResponse>('open_file', {
        path: testPath
      })
      filePath = result.path
      content = result.content
      await parseContent(result.content)
    } catch (err) {
      console.error('打开文件失败:', err)
    }
  }
  
  async function saveFile() {
    if (!filePath) {
      // TODO: 另存为
      return
    }
    
    try {
      await invoke('save_file', {
        path: filePath,
        content: content
      })
    } catch (err) {
      console.error('保存失败:', err)
    }
  }
  
  interface FileResponse {
    content: string
    path: string
  }
  
  interface ParseResult {
    html: string
    word_count: number
    char_count: number
  }
</script>

<template>
  <div class="app" on:mount={handleMount}>
    {#if loadError}
      <div class="error-container">
        <h2>❌ 加载错误</h2>
        <p>{loadError}</p>
        <button on:click={() => window.location.reload()}>重新加载</button>
        <p class="error-hint">提示：按 F12 打开开发者工具查看详情</p>
      </div>
    {:else}
    <Toolbar 
      on:openFile={openFile}
      on:saveFile={saveFile}
      bind:sidebarOpen
      bind:autoSave
      bind:theme
      bind:previewMode
      bind:focusMode
      bind:typewriterMode
      on:themeChange={(e) => applyTheme(e.detail.theme)}
      on:insertTable={() => showTableEditor = true}
      on:insertTask={() => showTaskEditor = true}
      on:togglePreview={() => previewMode = previewMode === 'edit' ? 'preview' : 'edit'}
      on:toggleFocus={() => focusMode = !focusMode}
      on:toggleTypewriter={() => typewriterMode = !typewriterMode}
    />
    
    {#if showTableEditor}
      <div class="modal-overlay" on:click={() => showTableEditor = false}>
        <div class="modal-content" on:click|stopPropagation>
          <div class="modal-header">
            <h2>📊 插入表格</h2>
            <button class="close-btn" on:click={() => showTableEditor = false}>✕</button>
          </div>
          <TableEditor on:tableInsert={(e) => {
            content += e.detail.markdown
            handleContentChange(content)
            showTableEditor = false
          }} />
        </div>
      </div>
    {/if}
    
    {#if showTaskEditor}
      <div class="modal-overlay" on:click={() => showTaskEditor = false}>
        <div class="modal-content" on:click|stopPropagation>
          <div class="modal-header">
            <h2>✅ 任务列表</h2>
            <button class="close-btn" on:click={() => showTaskEditor = false}>✕</button>
          </div>
          <TaskList on:taskInsert={(e) => {
            content += e.detail.markdown
            handleContentChange(content)
            showTaskEditor = false
          }} />
        </div>
      </div>
    {/if}
    
    <div class="main-content">
      <Sidebar 
        open={sidebarOpen}
        filePath={filePath}
        content={content}
        on:fileSelect={(e) => {
          filePath = e.detail.path
          // TODO: 加载文件
        }}
        on:outlineScroll={(e) => {
          // TODO: 滚动到对应标题位置
          console.log('滚动到:', e.detail)
        }}
      />
      
      <div class="editor-container">
        <ImageDrop on:imageInsert={(e) => {
          const markdown = `\n![${e.detail.alt}](${e.detail.src})\n`
          content += markdown
          handleContentChange(content)
        }}>
          <Editor 
            content={content}
            previewMode={previewMode}
            focusMode={focusMode}
            typewriterMode={typewriterMode}
            on:change={(e) => handleContentChange(e.detail)}
          />
        </ImageDrop>
        
        <div class="preview" style:display={sidebarOpen || previewMode === 'preview' ? 'block' : 'none'}>
          {@html previewHtml}
        </div>
      </div>
    </div>
    
    <div class="status-bar">
      <span>字数：{wordCount}</span>
      <span>字符：{charCount}</span>
      <span>{filePath ? filePath : '未打开文件'}</span>
    </div>
    {/if}
  </div>
</template>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary, #fff);
    color: var(--text-primary, #333);
  }
  
  .error-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #333;
  }
  
  .error-container h2 {
    margin-bottom: 16px;
    color: #d32f2f;
  }
  
  .error-container p {
    margin-bottom: 24px;
    max-width: 600px;
    text-align: center;
    line-height: 1.6;
  }
  
  .error-container button {
    padding: 12px 24px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .error-container button:hover {
    background: #1565c0;
  }
  
  .error-hint {
    margin-top: 16px;
    font-size: 12px;
    color: #666;
    background: #f0f0f0;
    padding: 8px 12px;
    border-radius: 4px;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: var(--bg-primary, #fff);
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary, #333);
  }
  
  .close-btn {
    padding: 8px 12px;
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-secondary, #666);
    border-radius: 4px;
  }
  
  .close-btn:hover {
    background: #f0f0f0;
  }
  
  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  
  .editor-container {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  
  .preview {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    border-left: 1px solid #e0e0e0;
    background: #fafafa;
  }
  
  .status-bar {
    height: 28px;
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 24px;
    font-size: 12px;
    color: #666;
  }
</style>
