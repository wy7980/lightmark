<script lang="ts">
  import { onMount } from 'svelte'
  import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection } from '@codemirror/view'
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { EditorState } from '@codemirror/state'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { indentOnInput } from '@codemirror/language'
  
  export let content = ''
  
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
      const event = new CustomEvent('change', { detail: newContent })
      container.dispatchEvent(event)
    })
    
    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          drawSelection(),
          dropCursor(),
          rectangularSelection(),
          indentOnInput(),
          markdown({ base: markdownLanguage }),
          oneDark,
          history(),
          defaultKeymap,
          historyKeymap,
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
