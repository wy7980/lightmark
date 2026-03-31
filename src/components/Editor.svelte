<script lang="ts">
  import { onMount } from 'svelte'
  import { EditorView, lineNumbers, highlightActiveLineGutter, drawSelection, rectangularSelection, keymap } from '@codemirror/view'
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { EditorState } from '@codemirror/state'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
  import { highlightSelectionMatches } from '@codemirror/search'
  
  export let content = ''
  export let previewMode: 'edit' | 'preview' = 'edit'
  export let focusMode = false
  export let typewriterMode = false
  
  let container: HTMLDivElement
  let view: EditorView | null = null
  let localContent = content
  
  const createDispatch = (update: (content: string) => void) => {
    let timeout: number
    return (newContent: string) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        update(newContent)
      }, 50)
    }
  }
  
  onMount(() => {
    const handleChange = createDispatch((newContent: string) => {
      const event = new CustomEvent('change', { detail: newContent })
      container.dispatchEvent(event)
    })
    
    view = new EditorView({
      state: EditorState.create({
        doc: localContent,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          drawSelection(),
          rectangularSelection(),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle),
          highlightSelectionMatches(),
          markdown({ base: markdownLanguage }),
          oneDark,
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              localContent = update.state.doc.toString()
              handleChange(localContent)
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '15px',
              lineHeight: '1.8',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            },
            '.cm-content': {
              padding: '24px 0',
              maxWidth: '900px',
              margin: '0 auto',
            },
            '.cm-scroller': {
              overflow: 'auto',
              fontFamily: 'inherit',
            },
            '.cm-gutters': {
              display: 'none',
            },
            '.cm-line': {
              padding: '2px 24px',
            },
            // Markdown 标题样式
            '.cm-header-1': {
              fontSize: '2em',
              fontWeight: '600',
              lineHeight: '1.25',
            },
            '.cm-header-2': {
              fontSize: '1.5em',
              fontWeight: '600',
              lineHeight: '1.25',
            },
            '.cm-header-3': {
              fontSize: '1.25em',
              fontWeight: '600',
              lineHeight: '1.25',
            },
            '.cm-header-4': {
              fontSize: '1em',
              fontWeight: '600',
            },
            '.cm-header-5': {
              fontSize: '0.875em',
              fontWeight: '600',
            },
            '.cm-header-6': {
              fontSize: '0.85em',
              fontWeight: '600',
              color: '#6a737d',
            },
            // 代码块
            '.cm-codeBlock': {
              background: '#f6f8fa',
              borderRadius: '6px',
              padding: '16px',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: '0.9em',
            },
            // 引用
            '.cm-quote': {
              color: '#6a737d',
              fontStyle: 'italic',
              borderLeft: '4px solid #dfe2e5',
              paddingLeft: '16px',
            },
            // 列表
            '.cm-list': {
              paddingLeft: '24px',
            },
            // 链接
            '.cm-link': {
              color: '#0366d6',
              textDecoration: 'none',
            },
            '.cm-link:hover': {
              textDecoration: 'underline',
            },
            // 粗体和斜体
            '.cm-strong': {
              fontWeight: '600',
            },
            '.cm-em': {
              fontStyle: 'italic',
            },
            // 删除线
            '.cm-strikethrough': {
              textDecoration: 'line-through',
            },
            // 焦点模式
            '&.focus-mode .cm-line:not(.active-line)': {
              opacity: '0.6',
            },
        ].filter(Boolean),
      }),
      parent: container,
    })
    
    return () => {
      if (view) {
        view.destroy()
      }
    }
  })
  
  // 监听外部内容变化
  $: if (view && content !== localContent) {
    const currentPos = view.state.selection.main.head
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: content,
      },
      selection: { anchor: Math.min(currentPos, content.length) },
    })
    localContent = content
  }
  
  // 监听模式切换
  $: if (view) {
    view.dom.classList.toggle('focus-mode', focusMode)
  }
</script>

<div class="editor-wrapper" bind:this={container}></div>

<style>
  .editor-wrapper {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  
  :global(.cm-editor) {
    height: 100%;
  }
  
  :global(.cm-focused) {
    outline: none;
  }
</style>
