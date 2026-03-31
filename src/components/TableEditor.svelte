<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher<{
    tableInsert: { markdown: string }
  }>()
  
  interface TableData {
    headers: string[]
    rows: string[][]
    align: ('left' | 'center' | 'right')[]
  }
  
  let table: TableData = {
    headers: ['列 1', '列 2', '列 3'],
    rows: [
      ['单元格 1', '单元格 2', '单元格 3'],
      ['单元格 4', '单元格 5', '单元格 6']
    ],
    align: ['left', 'left', 'left']
  }
  
  let selectedCell: { row: number; col: number } | null = null
  let showToolbar = false
  
  function addRow() {
    table.rows.push(new Array(table.headers.length).fill('单元格'))
    updateTable()
  }
  
  function addColumn() {
    table.headers.push(`列 ${table.headers.length + 1}`)
    table.align.push('left')
    table.rows.forEach(row => row.push('单元格'))
    updateTable()
  }
  
  function deleteRow(rowIdx: number) {
    if (table.rows.length > 1) {
      table.rows.splice(rowIdx, 1)
      updateTable()
    }
  }
  
  function deleteColumn(colIdx: number) {
    if (table.headers.length > 1) {
      table.headers.splice(colIdx, 1)
      table.align.splice(colIdx, 1)
      table.rows.forEach(row => row.splice(colIdx, 1))
      updateTable()
    }
  }
  
  function setAlignment(colIdx: number, align: 'left' | 'center' | 'right') {
    table.align[colIdx] = align
    updateTable()
  }
  
  function updateCell(rowIdx: number, colIdx: number, value: string) {
    table.rows[rowIdx][colIdx] = value
    updateTable()
  }
  
  function updateHeader(colIdx: number, value: string) {
    table.headers[colIdx] = value
    updateTable()
  }
  
  function generateMarkdown(): string {
    let md = '\n'
    
    // 表头
    md += '| ' + table.headers.join(' | ') + ' |\n'
    
    // 分隔线
    md += '| ' + table.align.map(a => {
      if (a === 'center') return ':---:'
      if (a === 'right') return '---:'
      return '---'
    }).join(' | ') + ' |\n'
    
    // 数据行
    table.rows.forEach(row => {
      md += '| ' + row.join(' | ') + ' |\n'
    })
    
    md += '\n'
    return md
  }
  
  function updateTable() {
    table = table  // 触发响应式更新
  }

  function confirmInsert() {
    dispatch('tableInsert', { markdown: generateMarkdown() })
  }
  
  function getAlignmentIcon(colIdx: number): string {
    const align = table.align[colIdx]
    if (align === 'center') return '⬌'
    if (align === 'right') return '⬅'
    return '➡'
  }
</script>

<div class="table-editor">
  <div class="table-toolbar">
    <div class="toolbar-group">
      <button class="btn" on:click={addRow} title="添加行">
        ➕ 行
      </button>
      <button class="btn" on:click={addColumn} title="添加列">
        ➕ 列
      </button>
    </div>
    
    <div class="toolbar-group">
      <span class="label">对齐:</span>
      {#each table.align as align, colIdx}
        <button 
          class="btn align-btn"
          on:click={() => setAlignment(colIdx, align === 'left' ? 'center' : align === 'center' ? 'right' : 'left')}
          title="{table.headers[colIdx]} 对齐方式"
        >
          {getAlignmentIcon(colIdx)}
        </button>
      {/each}
    </div>
    
    <div class="toolbar-group">
      <span class="markdown-preview">{generateMarkdown().trim().split('\n').length} 行</span>
    </div>
  </div>
  
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          {#each table.headers as header, colIdx}
            <th>
              <input 
                type="text"
                value={header}
                on:input={(e) => updateHeader(colIdx, e.currentTarget.value)}
                on:focus={() => selectedCell = { row: -1, col: colIdx }}
              />
              <div class="column-actions">
                <button class="icon-btn" on:click={() => deleteColumn(colIdx)} title="删除列">
                  🗑️
                </button>
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row, rowIdx}
          <tr>
            {#each row as cell, colIdx}
              <td>
                <input 
                  type="text"
                  value={cell}
                  on:input={(e) => updateCell(rowIdx, colIdx, e.currentTarget.value)}
                  on:focus={() => selectedCell = { row: rowIdx, col: colIdx }}
                />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <div class="table-footer">
    <button class="insert-btn" on:click={confirmInsert}>
      ✅ 插入表格
    </button>
    <p class="hint">💡 编辑完成后点击「插入表格」</p>
  </div>
</div>

<style>
  .table-editor {
    padding: 16px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 6px;
    margin: 16px 0;
  }
  
  .table-toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  
  .toolbar-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .btn {
    padding: 6px 12px;
    background: var(--bg-primary, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  
  .btn:hover {
    background: #e8e8e8;
  }
  
  .align-btn {
    padding: 6px 10px;
    min-width: 32px;
  }
  
  .label {
    font-size: 13px;
    color: var(--text-secondary, #666);
  }
  
  .markdown-preview {
    font-size: 12px;
    color: var(--text-secondary, #999);
    font-family: monospace;
  }
  
  .table-wrapper {
    overflow-x: auto;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background: var(--bg-primary, #fff);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 400px;
  }
  
  th, td {
    border: 1px solid var(--border-color, #e0e0e0);
    padding: 0;
    position: relative;
  }
  
  th input, td input {
    width: 100%;
    padding: 8px 12px;
    border: none;
    font-size: 14px;
    background: transparent;
    color: var(--text-primary, #333);
  }
  
  th input {
    font-weight: 600;
  }
  
  th input:focus, td input:focus {
    outline: none;
    background: rgba(25, 118, 210, 0.1);
  }
  
  .column-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  th:hover .column-actions {
    opacity: 1;
  }
  
  .icon-btn {
    padding: 2px 6px;
    background: rgba(255,255,255,0.9);
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .icon-btn:hover {
    background: #ffebee;
    border-color: #f44336;
  }
  
  .table-footer {
    margin-top: 12px;
    text-align: center;
  }
  
  .hint {
    font-size: 12px;
    color: var(--text-secondary, #999);
    margin: 8px 0 0 0;
  }

  .table-footer {
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
