<script lang="ts">
  import { onMount } from 'svelte'
  import { EditorView, basicSetup, keymap } from 'codemirror'
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { EditorState } from '@codemirror/state'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  
  export let content = $bindable('')
  
  let container: HTMLDivElement
  let view: EditorView | null = null
  
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
      content = newContent
      dispatchEvent(new CustomEvent('change', { detail: newContent }))
    })
    
    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          markdown({ base: markdownLanguage }),
          oneDark,
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              handleChange(update.state.doc.toString())
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            },
            '.cm-content': {
              padding: '16px 0',
            },
            '.cm-scroller': {
              overflow: 'auto',
            },
            '.cm-gutters': {
              display: 'none',
            },
          }),
        ],
      }),
      parent: container,
    })
    
    return () => {
      if (view) {
        view.destroy()
      }
    }
  })
  
  // 外部更新内容时同步到编辑器
  $: if (view && content !== view.state.doc.toString()) {
    const currentCursor = view.state.selection.main.head
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: content,
      },
      selection: { anchor: Math.min(currentCursor, content.length) },
    })
  }
</script>

<template>
  <div class="editor-wrapper" bind:this={container}></div>
</template>

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
