<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Crepe } from '@milkdown/crepe'
  import { editorViewCtx, parserCtx } from '@milkdown/core'
  import '@milkdown/crepe/theme/common/style.css'
  
  export let content = ''
  export let focusMode = false
  export let typewriterMode = false

  let container: HTMLDivElement
  let editor: Crepe | undefined
  let isInitialized = false

  const dispatch = createEventDispatcher<{ change: string }>()

  onMount(async () => {
    console.log('[LightMark] 初始化 Crepe 编辑器...')
    
    try {
      // 创建 Crepe 编辑器实例
      editor = new Crepe({
        root: container,
        defaultValue: content,
        features: {
          // 启用所有核心功能
          blockEdit: true,              // 块级编辑
          imageBlock: true,             // 图片块
          imageInline: true,            // 行内图片
          tableBlock: true,             // ✅ 表格块（重点修复）
          codeBlock: true,              // 代码块
          linkTooltip: true,            // 链接提示
          math: true,                   // 数学公式
          slashCommands: true,          // 斜杠命令
          // 其他功能
          clipboard: true,              // 剪贴板支持
          history: true,                // 撤销/重做
          placeholder: true,            // 占位符
        },
        // 配置选项
        placeholder: '开始写作...',
      })

      editor.on((listener) => {
        listener.markdownUpdated((_, markdown) => {
          if (isInitialized) {
            dispatch('change', markdown)
          }
        })
      })

      // 创建编辑器
      await editor.create()
      
      isInitialized = true
      console.log('[LightMark] Crepe 编辑器初始化完成')
      
      // 应用模式设置
      if (focusMode) {
        applyFocusMode()
      }
      if (typewriterMode) {
        applyTypewriterMode()
      }
      
    } catch (error) {
      console.error('[LightMark] Crepe 编辑器初始化失败:', error)
    }
  })

  onDestroy(async () => {
    console.log('[LightMark] 销毁 Crepe 编辑器实例')
    if (editor) {
      await editor.destroy()
      editor = undefined
      isInitialized = false
    }
  })

  // 应用焦点模式
  function applyFocusMode() {
    if (!editor) return
    container.classList.add('focus-mode')
  }

  // 应用打字机模式
  function applyTypewriterMode() {
    if (!editor) return
    container.classList.add('typewriter-mode')
  }

  // 更新内容
  export function updateContent(newContent: string) {
    if (!editor || !isInitialized) return
    
    try {
      if (typeof (editor as any).setMarkdown === 'function') {
        (editor as any).setMarkdown(newContent)
      } else {
        editor.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          const parser = ctx.get(parserCtx)
          const doc = parser(newContent)
          if (!doc) return
          const { state, dispatch } = view
          const tr = state.tr.replaceWith(0, state.doc.content.size, doc)
          dispatch(tr)
        })
      }
    } catch (error) {
      console.error('[LightMark] updateContent 失败:', error)
    }
  }

  // 插入 Markdown 文本
  export function insertMarkdown(markdownText: string) {
    if (!editor || !isInitialized) return
    
    try {
      if (typeof (editor as any).insertMarkdown === 'function') {
        (editor as any).insertMarkdown(markdownText)
      } else {
        editor.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          const parser = ctx.get(parserCtx)
          // 使用真实的换行符，并确保前后有空行以触发块级解析
          const doc = parser('\n\n' + markdownText.trim() + '\n\n')
          if (!doc) return
          const { state, dispatch } = view
          
          // 使用 replaceSelection 插入解析后的内容
          // 这会自动处理块级节点的插入逻辑
          const tr = state.tr.replaceSelectionWith(doc)
          dispatch(tr)
          view.focus()
        })
      }
      console.log('[LightMark] 插入 Markdown:', markdownText)
    } catch (error) {
      console.error('[LightMark] 插入 Markdown 失败:', error)
    }
  }

  // 获取编辑器内容
  export function getContent(): string {
    if (!editor || !isInitialized) return content
    return editor.getMarkdown()
  }

  // 聚焦编辑器
  function focusEditor() {
    if (editor) {
      const pm = container?.querySelector<HTMLElement>('.ProseMirror')
      if (pm) pm.focus()
    }
  }
</script>

<div 
  class="crepe-container {focusMode ? 'focus-mode' : ''} {typewriterMode ? 'typewriter-mode' : ''}"
  bind:this={container}
  on:click={focusEditor}
></div>

<style>
  .crepe-container {
    height: 100%;
    min-height: calc(100vh - 150px);
    overflow-y: auto;
    background: var(--bg-primary, #fff);
    cursor: text;
  }

  /* Crepe 编辑器样式覆盖 */
  :global(.milkdown-crepe) {
    min-height: calc(100vh - 230px);
    padding: 40px 0;
    background: var(--bg-primary, #fff);
  }

  :global(.milkdown-crepe .ProseMirror) {
    outline: none;
    min-height: calc(100vh - 310px);
    max-width: 800px;
    margin: 0 auto;
    padding: 0 48px 200px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-primary, #333);
  }

  /* 焦点模式 */
  .crepe-container.focus-mode :global(.milkdown-crepe .ProseMirror) {
    max-width: 680px;
  }

  /* 打字机模式 */
  .crepe-container.typewriter-mode :global(.milkdown-crepe .ProseMirror) {
    padding-top: 50vh;
  }

  /* ===== 表格样式增强 ===== */
  :global(.milkdown-crepe .table-view) {
    overflow-x: auto;
    margin: 16px 0;
  }

  :global(.milkdown-crepe table) {
    border-collapse: collapse;
    width: 100%;
    min-width: 600px;
  }

  :global(.milkdown-crepe th) {
    background: var(--bg-secondary, #f6f8fa);
    font-weight: 600;
    text-align: left;
  }

  :global(.milkdown-crepe th, .milkdown-crepe td) {
    border: 1px solid var(--border-color, #dfe2e5);
    padding: 8px 10px;  /* Typora 标准：更紧凑的行高 */
    line-height: 1.5;   /* 行高 1.5 倍，提升紧凑度 */
  }

  /* 表头稍微加重以区分 */
  :global(.milkdown-crepe th) {
    padding: 10px 12px;  /* 表头稍大一点 */
  }

  :global(.milkdown-crepe tr:nth-child(2n)) {
    background: var(--bg-tertiary, #f8f9fa);
  }

  /* 表格编辑按钮 */
  :global(.milkdown-crepe .table-button) {
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #dfe2e5);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  :global(.milkdown-crepe .table-button:hover) {
    background: var(--bg-secondary, #f6f8fa);
    border-color: #1976d2;
  }

  /* ===== 代码块样式 ===== */
  :global(.milkdown-crepe pre) {
    background: var(--code-bg, #f6f8fa);
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 14px;
    line-height: 1.6;
  }

  :global(.milkdown-crege code) {
    background: var(--code-bg, #f6f8fa);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.9em;
  }

  /* ===== 数学公式样式 ===== */
  :global(.milkdown-crepe .katex) {
    font-size: 1.1em;
  }

  :global(.milkdown-crepe .katex-display) {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 16px 0;
  }

  /* ===== 图片样式 ===== */
  :global(.milkdown-crepe img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 16px 0;
  }

  /* ===== 列表样式 ===== */
  :global(.milkdown-crepe ul) {
    list-style-type: disc;
    padding-left: 24px;
  }

  :global(.milkdown-crepe ol) {
    list-style-type: decimal;
    padding-left: 24px;
  }

  :global(.milkdown-crepe li) {
    margin: 8px 0;
    line-height: 1.8;
  }

  /* ===== 任务列表样式 ===== */
  :global(.milkdown-crepe input[type="checkbox"]) {
    margin-right: 8px;
    cursor: pointer;
  }

  /* ===== 引用样式 ===== */
  :global(.milkdown-crepe blockquote) {
    border-left: 4px solid var(--border-color, #dfe2e5);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-secondary, #6a737d);
    font-style: italic;
  }

  /* ===== 标题样式 ===== */
  :global(.milkdown-crepe h1) {
    font-size: 2em;
    font-weight: 700;
    line-height: 1.25;
    margin: 24px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color, #eaecef);
  }

  :global(.milkdown-crepe h2) {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.25;
    margin: 20px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-color, #eaecef);
  }

  :global(.milkdown-crepe h3) {
    font-size: 1.25em;
    font-weight: 600;
    line-height: 1.25;
    margin: 16px 0 8px;
  }

  /* ===== 链接样式 ===== */
  :global(.milkdown-crepe a) {
    color: #0366d6;
    text-decoration: none;
  }

  :global(.milkdown-crepe a:hover) {
    text-decoration: underline;
  }

  /* ===== 滚动条样式 ===== */
  .crepe-container::-webkit-scrollbar {
    width: 8px;
  }

  .crepe-container::-webkit-scrollbar-track {
    background: var(--bg-tertiary, #f6f8fa);
  }

  .crepe-container::-webkit-scrollbar-thumb {
    background: var(--border-color, #dfe2e5);
    border-radius: 4px;
  }

  .crepe-container::-webkit-scrollbar-thumb:hover {
    background: #c0c0c0;
  }
</style>
