<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Editor, rootCtx, defaultValueCtx, editorViewCtx, parserCtx } from '@milkdown/core'
  import { gfm } from '@milkdown/preset-gfm'
  import { history } from '@milkdown/plugin-history'
  import { listener, listenerCtx } from '@milkdown/plugin-listener'

  export let content = ''
  export let focusMode = false
  export let typewriterMode = false

  let container: HTMLDivElement
  let editor: Editor | undefined

  const dispatch = createEventDispatcher<{ change: string }>()

  onMount(async () => {
    console.log('[LightMark] 初始化 Milkdown WYSIWYG 编辑器')
    try {
      editor = await Editor.make()
        .config(ctx => {
          ctx.set(rootCtx, container)
          ctx.set(defaultValueCtx, content)
        })
        .use(listener)
        .config(ctx => {
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            dispatch('change', markdown)
          })
        })
        .use(gfm)          // GFM: tables, task lists, strikethrough (extends commonmark)
        .use(history)
        .create()
      console.log('[LightMark] 编辑器初始化完成')
      // 自动聚焦，让光标在编辑器就绪后立即显示
      setTimeout(() => {
        const pm = container?.querySelector<HTMLElement>('.ProseMirror')
        if (pm) pm.focus()
      }, 100)
    } catch (err) {
      console.error('[LightMark] 编辑器初始化失败:', err)
    }
  })

  onDestroy(async () => {
    if (editor) {
      console.log('[LightMark] 销毁编辑器实例')
      await editor.destroy()
    }
  })

  // 将 Markdown 文本解析为富文本节点插入光标处
  export function insertMarkdown(markdownText: string) {
    if (!editor) return
    try {
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const parser = ctx.get(parserCtx)
        const doc = parser('\n\n' + markdownText.trim() + '\n\n')
        if (!doc) return
        const { state, dispatch } = view
        const pos = state.selection.to
        const tr = state.tr.insert(pos, doc.content)
        dispatch(tr)
        view.focus()
      })
    } catch (err) {
      console.error('[LightMark] insertMarkdown 失败:', err)
    }
  }

  function focusEditor() {
    // 单击空白处时将焦点转入 ProseMirror
    const pm = container?.querySelector<HTMLElement>('.ProseMirror')
    if (pm) pm.focus()
  }
</script>

<div
  bind:this={container}
  class="milkdown-container"
  class:focus-mode={focusMode}
  class:typewriter-mode={typewriterMode}
  on:click={focusEditor}
></div>

<style>
  .milkdown-container {
    height: 100%;
    overflow-y: auto;
    background: var(--bg-primary, #fff);
    cursor: text;  /* 提示整个区域可编辑 */
  }

  /* ===== Milkdown 全局样式 ===== */

  /* 编辑器主体 */
  :global(.milkdown) {
    min-height: 100%;  /* 始终充满容器 */
    padding: 40px 0;
    background: var(--bg-primary, #fff);
  }

  :global(.milkdown .ProseMirror) {
    outline: none;
    min-height: 100%;   /* 空文档时消除点击盲区 */
    max-width: 800px;
    margin: 0 auto;
    padding: 0 48px 200px; /* 底部大间距保证可点击 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-primary, #24292e);
    caret-color: #0366d6;
  }

  /* 占位符 */
  :global(.milkdown .ProseMirror p.is-editor-empty:first-child::before) {
    content: '开始写作...';
    color: #bbb;
    pointer-events: none;
    float: left;
    height: 0;
  }

  /* 标题 */
  :global(.milkdown h1) { font-size: 2em; font-weight: 700; line-height: 1.25; margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #eaecef; }
  :global(.milkdown h2) { font-size: 1.5em; font-weight: 600; line-height: 1.25; margin: 20px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #eaecef; }
  :global(.milkdown h3) { font-size: 1.25em; font-weight: 600; line-height: 1.25; margin: 16px 0 8px; }
  :global(.milkdown h4) { font-size: 1em; font-weight: 600; margin: 14px 0 6px; }
  :global(.milkdown h5) { font-size: 0.875em; font-weight: 600; margin: 12px 0 4px; }
  :global(.milkdown h6) { font-size: 0.85em; font-weight: 600; margin: 12px 0 4px; color: #6a737d; }

  /* 段落 */
  :global(.milkdown p) { margin: 0 0 16px; }

  /* 行内代码 */
  :global(.milkdown code) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
    background: rgba(27,31,35,0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    color: #e83e8c;
  }

  /* 代码块 */
  :global(.milkdown pre) {
    background: #f6f8fa;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    border: 1px solid #e1e4e8;
  }
  :global(.milkdown pre code) {
    background: none;
    padding: 0;
    color: #24292e;
    font-size: 0.9em;
  }

  /* 引用块 */
  :global(.milkdown blockquote) {
    border-left: 4px solid #dfe2e5;
    padding: 0 16px;
    color: #6a737d;
    margin: 16px 0;
    font-style: italic;
  }

  /* 链接 */
  :global(.milkdown a) { color: #0366d6; text-decoration: none; }
  :global(.milkdown a:hover) { text-decoration: underline; }

  /* 列表 */
  :global(.milkdown ul, .milkdown ol) { padding-left: 2em; margin: 8px 0; }
  :global(.milkdown li) { margin: 4px 0; }
  :global(.milkdown li > p) { margin: 0; }

  /* 分割线 */
  :global(.milkdown hr) { border: none; border-top: 2px solid #eaecef; margin: 24px 0; }

  /* 图片 */
  :global(.milkdown img) { max-width: 100%; border-radius: 6px; margin: 8px 0; }

  /* 表格 */
  :global(.milkdown table) { border-collapse: collapse; width: 100%; margin: 16px 0; }
  :global(.milkdown th, .milkdown td) { border: 1px solid #dfe2e5; padding: 8px 13px; }
  :global(.milkdown th) { background: #f6f8fa; font-weight: 600; }
  :global(.milkdown tr:nth-child(even)) { background: #f6f8fa; }

  /* 强调 */
  :global(.milkdown strong) { font-weight: 600; }
  :global(.milkdown em) { font-style: italic; }

  /* 选中样式 */
  :global(.milkdown .ProseMirror-selectednode) { outline: 2px solid #0366d6; }

  /* ===== 深色主题 ===== */
  :global(.dark-theme .milkdown),
  :global(.dark-theme .milkdown .ProseMirror) {
    color: var(--text-primary, #d8dde3);
    background: var(--bg-primary, #1e2228);
  }
  :global(.dark-theme .milkdown h1, .dark-theme .milkdown h2) { border-color: #3a4048; }
  :global(.dark-theme .milkdown code) { background: rgba(255,255,255,0.1); color: #f78c6c; }
  :global(.dark-theme .milkdown pre) { background: #2d333b; border-color: #3a4048; }
  :global(.dark-theme .milkdown pre code) { color: #d8dde3; }
  :global(.dark-theme .milkdown blockquote) { border-color: #444c56; color: #8b949e; }
  :global(.dark-theme .milkdown a) { color: #58a6ff; }
  :global(.dark-theme .milkdown th) { background: #2d333b; }
  :global(.dark-theme .milkdown th, .dark-theme .milkdown td) { border-color: #444c56; }
  :global(.dark-theme .milkdown tr:nth-child(even)) { background: #262c34; }
  :global(.dark-theme .milkdown hr) { border-color: #3a4048; }

  /* ===== 专注模式 ===== */
  .milkdown-container.focus-mode :global(.milkdown .ProseMirror) {
    max-width: 680px;
  }
</style>
