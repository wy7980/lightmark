<script lang="ts">
  import { onMount } from 'svelte'
  import Editor from './components/Editor.svelte'
  import Toolbar from './components/Toolbar.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import ImageDrop from './components/ImageDrop.svelte'
  import TableEditor from './components/TableEditor.svelte'
  import TaskList from './components/TaskList.svelte'
  import EquationEditor from './components/EquationEditor.svelte'
  import ExportDialog from './components/ExportDialog.svelte'
  import { invoke } from '@tauri-apps/api/core'
  import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog'
  
  let showTableEditor = false
  let showTaskEditor = false
  let showEquationEditor = false
  let showExportDialog = false
  
  // 错误处理
  let loadError: string | null = null
  let isLoaded = false
  
  // 组件挂载时检查
  function handleMount() {
    console.log('[LightMark] App 组件已挂载')
    console.log('[LightMark] 运行环境:', navigator.userAgent)
    isLoaded = true
  }
  
  function handleError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[LightMark] App 错误:', msg, error)
    loadError = msg
  }
  
  // 监听加载
  setTimeout(() => {
    if (!isLoaded && !loadError) {
      loadError = '加载超时，请检查控制台日志'
    }
  }, 5000)
  
  let filePath: string | null = null
  let content = ''
  let wordCount = 0
  let charCount = 0
  let autoSave = true
  let sidebarOpen = true
  let theme: 'light' | 'dark' = 'light'
  let focusMode = false

  /**
   * 清理有问题的公式语法，防止 KaTeX 解析错误
   * 问题示例：$$$$ 或 $...$$...$ 等无效分隔符
   */
  function sanitizeFormulas(text: string): string {
    if (!text) return text
    
    let sanitized = text
    
    // 修复 1: 循环替换直到没有 $$$$ （处理极端情况如 $$$$$$）
    while (sanitized.includes('$$$$')) {
      sanitized = sanitized.replace(/\$\$\$\$/g, '$$')
    }
    
    // 修复 2: 确保 \_ 不会被错误转义（Windows 路径常见）
    sanitized = sanitized.replace(/\\_/g, '_')
    
    return sanitized
  }
  let typewriterMode = false
  let fileLoadKey = 0  // 用于在打开新文件时强制重建编辑器
  let editorRef: any  // Editor 组件实例，用于调用 insertMarkdown()
  
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
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        newFile()
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        saveFile()
      }
    }
  }
  
  onMount(() => {
    console.log('[LightMark] onMount 触发，注册快捷键')
    handleMount()
    window.addEventListener('keydown', handleKeydown)
    return () => {
      console.log('[LightMark] onDestroy，注销快捷键')
      window.removeEventListener('keydown', handleKeydown)
    }
  })
  
  // 自动保存防抖
  let saveTimeout: number

  function handleContentChange(newContent: string) {
    content = newContent
    // 前端直接计算字数（去除 markdown 标记后按空白分隔）
    const plainText = newContent.replace(/[#*`>\[\]()!_~]/g, '').trim()
    wordCount = plainText ? plainText.split(/\s+/).length : 0
    charCount = newContent.length
    // 自动保存（1s 防抖）
    clearTimeout(saveTimeout)
    if (autoSave && filePath) {
      saveTimeout = setTimeout(async () => {
        try {
          console.log(`[LightMark] 自动保存: ${filePath}`)
          await invoke('save_file', { path: filePath, content: newContent })
          console.log('[LightMark] 自动保存完成')
        } catch (err) {
          console.error('[LightMark] 自动保存失败:', err)
        }
      }, 1000)
    }
  }
  
  async function newFile() {
    console.log('[LightMark] 新建文件对话框')
    try {
      const savePath = await saveDialog({
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        defaultPath: 'untitled.md'
      })
      if (!savePath) {
        console.log('[LightMark] 用户取消了新建操作')
        return
      }
      console.log('[LightMark] 新建文件:', savePath)
      // 写入空文件
      await invoke('save_file', { path: savePath, content: '' })
      // 加载到编辑器
      filePath = savePath
      content = ''
      fileLoadKey++
      handleContentChange('')
      console.log('[LightMark] 新文件创建并加载完成')
    } catch (err) {
      console.error('[LightMark] 新建文件失败:', err)
    }
  }
  
  async function openFile() {
    console.log('[LightMark] 打开文件对话框')
    try {
      const selected = await openDialog({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
      })
      if (!selected) {
        console.log('[LightMark] 用户取消了文件选择')
        return
      }
      const selectedPath = typeof selected === 'string' ? selected : selected.path
      console.log('[LightMark] 已选择文件:', selectedPath)
      const result = await invoke<FileResponse>('open_file', { path: selectedPath })
      filePath = result.path
      
      // 清理有问题的公式语法，防止 KaTeX 解析错误
      const rawContent = result.content
      content = sanitizeFormulas(rawContent)
      
      // 如果清理后内容不同，提示用户
      if (content !== rawContent) {
        console.warn('[LightMark] 检测到并修复了公式语法问题')
      }
      
      fileLoadKey++  // 触发编辑器重建以加载新内容
      handleContentChange(content)
      console.log('[LightMark] 文件已读取:', result.path)
    } catch (err) {
      console.error('[LightMark] 打开文件失败:', err)
    }
  }
  
  async function saveFile() {
    if (!filePath) {
      console.warn('[LightMark] 保存失败：未指定文件路径')
      // TODO: 另存为
      return
    }
    
    console.log('[LightMark] 手动保存:', filePath)
    try {
      await invoke('save_file', {
        path: filePath,
        content: content
      })
      console.log('[LightMark] 手动保存完成')
    } catch (err) {
      console.error('[LightMark] 保存失败:', err)
    }
  }
  
  interface FileResponse {
    content: string
    path: string
  }
</script>

  <div class="app">
    {#if loadError}
      <div class="error-container">
        <h2>❌ 加载错误</h2>
        <p>{loadError}</p>
        <button on:click={() => window.location.reload()}>重新加载</button>
        <p class="error-hint">提示：按 F12 打开开发者工具查看详情</p>
      </div>
    {:else}
    <Toolbar 
      on:newFile={newFile}
      on:openFile={openFile}
      on:saveFile={saveFile}
      bind:sidebarOpen
      bind:autoSave
      bind:theme
      bind:focusMode
      bind:typewriterMode
      on:themeChange={(e) => applyTheme(e.detail.theme)}
      on:insertTable={() => showTableEditor = true}
      on:insertTask={() => showTaskEditor = true}
      on:insertEquation={() => showEquationEditor = true}
      on:exportFile={() => showExportDialog = true}
      on:toggleFocus={() => focusMode = !focusMode}
      on:toggleTypewriter={() => typewriterMode = !typewriterMode}
    />
    
    {#if showTableEditor}
      <div class="modal-overlay" on:click={() => showTableEditor = false} role="presentation">
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="table-modal-title">
          <div class="modal-header">
            <h2 id="table-modal-title">📊 插入表格</h2>
            <button class="close-btn" on:click={() => showTableEditor = false}>✕</button>
          </div>
          <TableEditor on:tableInsert={(e) => {
            editorRef?.insertMarkdown(e.detail.markdown)
            showTableEditor = false
          }} />
        </div>
      </div>
    {/if}
    
    {#if showTaskEditor}
      <div class="modal-overlay" on:click={() => showTaskEditor = false} role="presentation">
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
          <div class="modal-header">
            <h2 id="task-modal-title">✅ 任务列表</h2>
            <button class="close-btn" on:click={() => showTaskEditor = false}>✕</button>
          </div>
          <TaskList on:taskInsert={(e) => {
            editorRef?.insertMarkdown(e.detail.markdown)
            showTaskEditor = false
          }} />
        </div>
      </div>
    {/if}
    
    {#if showEquationEditor}
      <div class="modal-overlay" on:click={() => showEquationEditor = false} role="presentation">
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="math-modal-title">
          <div class="modal-header">
            <h2 id="math-modal-title">∑ 数学公式</h2>
            <button class="close-btn" on:click={() => showEquationEditor = false}>✕</button>
          </div>
          <EquationEditor on:equationInsert={(e) => {
            editorRef?.insertMarkdown(e.detail.markdown)
            showEquationEditor = false
          }} />
        </div>
      </div>
    {/if}
    
    {#if showExportDialog}
      <div class="modal-overlay" on:click={() => showExportDialog = false} role="presentation">
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
          <div class="modal-header">
            <h2 id="export-modal-title">📤 导出</h2>
            <button class="close-btn" on:click={() => showExportDialog = false}>✕</button>
          </div>
          <ExportDialog on:exportHtml={(e) => {
            showExportDialog = false
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
          const md = `\n![${e.detail.alt}](${e.detail.src})\n`
          editorRef?.insertMarkdown(md)
        }}>
          {#key fileLoadKey}
          <Editor
            bind:this={editorRef}
            content={content}
            focusMode={focusMode}
            typewriterMode={typewriterMode}
            on:change={(e) => handleContentChange(e.detail)}
          />
          {/key}
        </ImageDrop>
      </div>
    </div>
    
    <div class="status-bar">
      <span>字数：{wordCount}</span>
      <span>字符：{charCount}</span>
      <span>{filePath ? filePath : '未打开文件'}</span>
    </div>
    {/if}
  </div>

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
    flex-direction: column;
    overflow: hidden;
    min-height: 0;  /* 关键：允许 flex 子项缩小 */
  }
  
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
