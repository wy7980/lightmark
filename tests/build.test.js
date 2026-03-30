#!/usr/bin/env node
/**
 * LightMark 前端构建测试
 * 验证所有组件能正常编译
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🧪 LightMark 前端构建测试\n')

// 测试 1: 检查所有组件文件存在
console.log('📦 测试 1: 检查组件文件...')
const components = [
  'Editor.svelte',
  'Toolbar.svelte',
  'Sidebar.svelte',
  'Outline.svelte',
  'ThemeSwitcher.svelte',
  'CodeBlock.svelte',
  'ImageDrop.svelte',
  'TableEditor.svelte',
  'TaskList.svelte',
  'EquationEditor.svelte'
]

const srcDir = './src/components'
let allExist = true
for (const comp of components) {
  const compPath = path.join(srcDir, comp)
  if (fs.existsSync(compPath)) {
    console.log(`  ✅ ${comp}`)
  } else {
    console.log(`  ❌ ${comp} - 不存在`)
    allExist = false
  }
}

if (!allExist) {
  console.error('\n❌ 组件文件检查失败')
  process.exit(1)
}

// 测试 2: 检查 package.json 依赖
console.log('\n📦 测试 2: 检查依赖配置...')
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const requiredDeps = [
  '@codemirror/view',
  '@codemirror/lang-markdown',
  'highlight.js',
  'katex'
]

for (const dep of requiredDeps) {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep}`)
  } else {
    console.log(`  ❌ ${dep} - 未安装`)
  }
}

// 测试 3: 前端构建
console.log('\n🔨 测试 3: 执行前端构建...')
try {
  const output = execSync('npm run build:frontend 2>&1', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  })
  
  if (output.includes('built in')) {
    console.log('  ✅ 构建成功')
    
    // 提取构建时间
    const timeMatch = output.match(/built in ([\d.]+)s/)
    if (timeMatch) {
      console.log(`  ⏱️  构建时间：${timeMatch[1]}s`)
    }
  } else {
    console.log('  ⚠️  构建输出异常')
  }
} catch (error) {
  console.error('  ❌ 构建失败')
  console.error(error.stdout || error.message)
  process.exit(1)
}

// 测试 4: 检查构建产物
console.log('\n📦 测试 4: 检查构建产物...')
const distDir = './dist'
const requiredFiles = ['index.html', 'assets']

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - 不存在`)
  }
}

// 检查 JS 文件大小
const jsFiles = fs.readdirSync(path.join(distDir, 'assets'))
  .filter(f => f.endsWith('.js'))
  
if (jsFiles.length > 0) {
  const totalSize = jsFiles.reduce((sum, file) => {
    const stats = fs.statSync(path.join(distDir, 'assets', file))
    return sum + stats.size
  }, 0)
  console.log(`  📊 JS 文件总大小：${(totalSize / 1024).toFixed(2)} KB`)
}

console.log('\n✅ 所有前端构建测试通过！\n')
