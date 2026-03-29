<script lang="ts">
  import Editor from './components/Editor.svelte'
  import Toolbar from './components/Toolbar.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import { invoke } from '@tauri-apps/api/core'
  
  let filePath: string | null = null
  let content = ''
  let previewHtml = ''
  let wordCount = 0
  let charCount = 0
  let autoSave = true
  let sidebarOpen = true
  
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
  <div class="app">
    <Toolbar 
      on:openFile={openFile}
      on:saveFile={saveFile}
      bind:sidebarOpen
      bind:autoSave
    />
    
    <div class="main-content">
      <Sidebar 
        open={sidebarOpen}
        filePath={filePath}
        on:fileSelect={(e) => {
          filePath = e.detail.path
          // TODO: 加载文件
        }}
      />
      
      <div class="editor-container">
        <Editor 
          content={content}
          on:change={(e) => handleContentChange(e.detail)}
        />
        
        <div class="preview" style:display={sidebarOpen ? 'none' : 'block'}>
          {@html previewHtml}
        </div>
      </div>
    </div>
    
    <div class="status-bar">
      <span>字数：{wordCount}</span>
      <span>字符：{charCount}</span>
      <span>{filePath ? filePath : '未打开文件'}</span>
    </div>
  </div>
</template>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
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
