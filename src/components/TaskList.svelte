<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher<{
    taskInsert: { markdown: string }
  }>()
  
  interface Task {
    id: number
    text: string
    checked: boolean
  }
  
  let tasks: Task[] = [
    { id: 1, text: '任务 1', checked: false },
    { id: 2, text: '任务 2', checked: true },
    { id: 3, text: '任务 3', checked: false }
  ]
  
  let newTaskText = ''
  let errorMessage = ''
  
  /**
   * 验证任务文本
   * - 不能为空
   * - 不能超过 200 字符
   * - 不能包含危险字符
   */
  function validateTaskText(text: string): { valid: boolean; error?: string } {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: '任务文本不能为空' }
    }
    
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return { valid: false, error: '任务文本不能为空' }
    }
    
    if (trimmed.length > 200) {
      return { valid: false, error: '任务文本不能超过 200 字符' }
    }
    
    // 检查危险字符（防止 XSS）
    if (trimmed.includes('<script') || trimmed.includes('javascript:')) {
      return { valid: false, error: '任务文本包含非法内容' }
    }
    
    return { valid: true }
  }
  
  function addTask() {
    try {
      errorMessage = ''
      
      // 验证输入
      const validation = validateTaskText(newTaskText)
      if (!validation.valid) {
        errorMessage = validation.error || '添加任务失败'
        console.warn('[TaskList] 添加任务验证失败:', errorMessage)
        return
      }
      
      if (!tasks) {
        tasks = []
      }
      
      const trimmedText = newTaskText.trim()
      tasks.push({
        id: Date.now(),
        text: trimmedText,
        checked: false
      })
      
      newTaskText = ''
      updateMarkdown()
      
      console.log('[TaskList] 任务添加成功:', trimmedText)
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : '添加任务失败'
      console.error('[TaskList] 添加任务异常:', error)
    }
  }
  
  function toggleTask(id: number) {
    try {
      if (!tasks || tasks.length === 0) {
        console.warn('[TaskList] 任务列表为空')
        return
      }
      
      const task = tasks.find(t => t.id === id)
      if (task) {
        task.checked = !task.checked
        updateMarkdown()
      } else {
        console.warn('[TaskList] 未找到任务:', id)
      }
    } catch (error) {
      console.error('[TaskList] 切换任务状态失败:', error)
    }
  }
  
  function deleteTask(id: number) {
    try {
      if (!tasks) {
        console.warn('[TaskList] 任务列表为空')
        return
      }
      
      const beforeLength = tasks.length
      tasks = tasks.filter(t => t.id !== id)
      
      if (tasks.length === beforeLength) {
        console.warn('[TaskList] 删除失败，未找到任务:', id)
      } else {
        updateMarkdown()
        console.log('[TaskList] 任务删除成功:', id)
      }
    } catch (error) {
      console.error('[TaskList] 删除任务异常:', error)
    }
  }
  
  function updateMarkdown() {
    try {
      // 触发响应式更新
      tasks = [...tasks]
    } catch (error) {
      console.error('[TaskList] 更新 Markdown 失败:', error)
    }
  }

  function confirmInsert() {
    try {
      if (!tasks || tasks.length === 0) {
        errorMessage = '没有可插入的任务'
        console.warn('[TaskList] 没有任务可插入')
        return
      }
      
      const markdown = '\n' + tasks.map(t => {
        // 安全处理任务文本
        const safeText = t.text
          .replace(/[&<>"']/g, (char) => {
            const entities: Record<string, string> = {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;'
            }
            return entities[char] || char
          })
        return `- [${t.checked ? 'x' : ' '}] ${safeText}`
      }).join('\n') + '\n'
      
      dispatch('taskInsert', { markdown })
      console.log('[TaskList] 任务列表插入成功')
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : '插入任务失败'
      console.error('[TaskList] 插入任务异常:', error)
    }
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTask()
    }
  }
  
  // 统计
  $: totalTasks = tasks.length
  $: completedTasks = tasks.filter(t => t.checked).length
  $: progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
</script>

<div class="task-editor">
  <div class="task-header">
    <h3>📝 任务列表</h3>
    <div class="task-stats">
      <span class="progress-bar">
        <span class="progress-fill" style:width="{progress}%"></span>
      </span>
      <span class="progress-text">{completedTasks}/{totalTasks} ({progress}%)</span>
    </div>
  </div>
  
  <div class="task-input-group">
    <input 
      type="text"
      bind:value={newTaskText}
      on:keydown={handleKeydown}
      placeholder="添加新任务..."
      class="task-input {errorMessage ? 'error' : ''}"
    />
    <button class="add-btn" on:click={addTask}>添加</button>
  </div>
  
  {#if errorMessage}
    <div class="error-message">
      ⚠️ {errorMessage}
    </div>
  {/if}
  
  <ul class="task-list">
    {#each tasks as task (task.id)}
      <li class="task-item {task.checked ? 'completed' : ''}">
        <label class="task-checkbox">
          <input 
            type="checkbox"
            checked={task.checked}
            on:change={() => toggleTask(task.id)}
          />
          <span class="checkmark"></span>
        </label>
        <span class="task-text">{task.text}</span>
        <button class="delete-btn" on:click={() => deleteTask(task.id)} title="删除">
          🗑️
        </button>
      </li>
    {/each}
  </ul>
  
  <div class="task-footer">
    <button class="insert-btn" on:click={confirmInsert}>
      ✅ 插入任务列表
    </button>
    <p class="hint">💡 编辑完成后点击「插入任务列表」</p>
  </div>
</div>

<style>
  .task-editor {
    padding: 16px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 6px;
    margin: 16px 0;
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .task-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary, #333);
  }
  
  .task-stats {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .progress-bar {
    width: 100px;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    display: block;
    height: 100%;
    background: #4caf50;
    transition: width 0.3s;
  }
  
  .progress-text {
    font-size: 12px;
    color: var(--text-secondary, #666);
    min-width: 60px;
    text-align: right;
  }
  
  .task-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .task-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    font-size: 14px;
    background: var(--bg-primary, #fff);
    color: var(--text-primary, #333);
  }
  
  .task-input:focus {
    outline: none;
    border-color: #1976d2;
  }
  
  .task-input.error {
    border-color: #f44336;
    background: #ffebee;
  }
  
  .error-message {
    padding: 8px 12px;
    background: #ffebee;
    border-left: 3px solid #f44336;
    color: #c62828;
    font-size: 13px;
    border-radius: 4px;
    margin-bottom: 12px;
  }
  
  .add-btn {
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }
  
  .add-btn:hover {
    background: #1565c0;
  }
  
  .task-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px 0;
  }
  
  .task-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    gap: 8px;
  }
  
  .task-item:last-child {
    border-bottom: none;
  }
  
  .task-item.completed .task-text {
    text-decoration: line-through;
    color: var(--text-secondary, #999);
  }
  
  .task-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .task-checkbox input {
    display: none;
  }
  
  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #1976d2;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .task-checkbox input:checked + .checkmark {
    background: #1976d2;
  }
  
  .task-checkbox input:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-size: 14px;
    font-weight: bold;
  }
  
  .task-text {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary, #333);
  }
  
  .delete-btn {
    padding: 4px 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .task-item:hover .delete-btn {
    opacity: 1;
  }
  
  .delete-btn:hover {
    background: #ffebee;
    border-radius: 4px;
  }
  
  .task-footer {
    text-align: center;
  }
  
  .hint {
    font-size: 12px;
    color: var(--text-secondary, #999);
    margin: 8px 0 0 0;
  }

  .task-footer {
    margin-top: 16px;
    text-align: center;
  }

  .insert-btn {
    padding: 10px 28px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .insert-btn:hover {
    background: #1565c0;
  }
</style>
