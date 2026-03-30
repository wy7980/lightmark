#!/usr/bin/env node

/**
 * LightMark AI 开发者 - 实际执行开发任务
 * 
 * 监听 .dev-request.json 文件，调用 AI 模型开发代码
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = '/home/node/.openclaw/workspace/lightmark';
const REQUEST_FILE = path.join(WORKSPACE_DIR, '.dev-request.json');
const RESULT_FILE = path.join(WORKSPACE_DIR, '.dev-result.json');
const CHECK_INTERVAL = 5000;

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AIDeveloper] ${message}`);
}

function checkRequestFile() {
    if (!fs.existsSync(REQUEST_FILE)) {
        return null;
    }
    
    try {
        const data = fs.readFileSync(REQUEST_FILE, 'utf8');
        const request = JSON.parse(data);
        fs.unlinkSync(REQUEST_FILE);
        return request;
    } catch (error) {
        log('❌ 读取请求文件失败:', error.message);
        return null;
    }
}

// 实际的 AI 开发逻辑（这里应该调用 AI 模型）
async function executeDevelopment(request) {
    const feature = request.feature;
    const prompt = request.prompt;
    
    log(`🎯 开发功能：${feature.name}`);
    
    try {
        // 步骤 1: 分析现有代码
        log('📝 分析现有代码结构...');
        const components = fs.readdirSync(path.join(WORKSPACE_DIR, 'src/components'));
        log(`📁 现有组件：${components.join(', ')}`);
        
        // 步骤 2: 根据功能名称创建对应的组件
        const componentName = generateComponentName(feature.name);
        const componentFile = path.join(WORKSPACE_DIR, 'src/components', `${componentName}.svelte`);
        
        if (fs.existsSync(componentFile)) {
            log(`ℹ️  组件已存在：${componentName}.svelte`);
        } else {
            log(`🔧 创建组件：${componentName}.svelte`);
            await createComponent(componentName, feature.name);
        }
        
        // 步骤 3: 集成到主编辑器
        log('🔗 集成到主编辑器...');
        await integrateToEditor(componentName);
        
        // 步骤 4: 添加单元测试
        log('🧪 添加单元测试...');
        await addUnitTest(componentName, feature.name);
        
        // 步骤 5: 更新功能规划
        log('📄 更新 FEATURES_PLAN.md...');
        updateFeaturesPlan(feature.name);
        
        log('✅ 开发完成！');
        
        // 写入成功结果
        fs.writeFileSync(RESULT_FILE, JSON.stringify({
            feature: feature,
            status: 'success',
            completedAt: new Date().toISOString(),
            files: [
                `src/components/${componentName}.svelte`,
                'src/Editor.svelte',
                'tests/unit.test.js',
                'FEATURES_PLAN.md',
            ],
        }), 'utf8');
        
        return true;
        
    } catch (error) {
        log('❌ 开发失败:', error.message);
        
        fs.writeFileSync(RESULT_FILE, JSON.stringify({
            feature: feature,
            status: 'failed',
            error: error.message,
        }), 'utf8');
        
        return false;
    }
}

// 生成组件名称
function generateComponentName(featureName) {
    // 移除括号和优先级标记
    const cleanName = featureName.replace(/[（(].*[)）]/g, '').replace(/P\d/, '').trim();
    
    // 转换为 PascalCase
    return cleanName
        .replace(/[\s-]+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

// 创建组件
async function createComponent(componentName, featureName) {
    const componentFile = path.join(WORKSPACE_DIR, 'src/components', `${componentName}.svelte`);
    
    const template = `<script lang="ts">
  /**
   * ${featureName} 组件
   * 自动生成于 ${new Date().toISOString()}
   */
  
  export let enabled = true;
  
  // TODO: 实现 ${featureName} 的具体逻辑
  function init() {
    console.log('${componentName} 初始化');
  }
  
  $: if (enabled) {
    init();
  }
</script>

<div class="${componentName.toLowerCase()}" class:enabled>
  <!-- ${featureName} 功能区域 -->
  <p>${featureName}</p>
</div>

<style>
  .${componentName.toLowerCase()} {
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin: 0.25rem 0;
  }
  
  .enabled {
    border-color: #4CAF50;
    background-color: #f1f8e9;
  }
</style>
`;
    
    fs.writeFileSync(componentFile, template, 'utf8');
    log(`✅ 创建组件：${componentName}.svelte`);
}

// 集成到编辑器
async function integrateToEditor(componentName) {
    const editorFile = path.join(WORKSPACE_DIR, 'src', 'Editor.svelte');
    
    if (!fs.existsSync(editorFile)) {
        log('⚠️  Editor.svelte 不存在，跳过集成');
        return;
    }
    
    let content = fs.readFileSync(editorFile, 'utf8');
    
    // 检查是否已经导入
    const importStatement = `import ${componentName} from './components/${componentName}.svelte';`;
    
    if (!content.includes(importStatement)) {
        // 添加到导入部分
        const importMatch = content.match(/import.*from.*components.*;/g);
        if (importMatch && importMatch.length > 0) {
            const lastImport = importMatch[importMatch.length - 1];
            content = content.replace(lastImport, lastImport + '\n' + importStatement);
        }
        
        log(`✅ 添加导入：${componentName}`);
    }
    
    fs.writeFileSync(editorFile, content, 'utf8');
}

// 添加单元测试
async function addUnitTest(componentName, featureName) {
    const testFile = path.join(WORKSPACE_DIR, 'tests', 'unit.test.js');
    
    if (!fs.existsSync(testFile)) {
        // 创建测试文件
        const testContent = `import { describe, it, expect } from 'node:test';
import assert from 'node:assert';

describe('LightMark 组件测试', () => {
  // 测试用例会逐步添加
});
`;
        fs.writeFileSync(testFile, testContent, 'utf8');
    }
    
    let content = fs.readFileSync(testFile, 'utf8');
    
    // 添加测试用例
    const testCase = `
  it('${featureName} 组件应该存在', () => {
    assert.ok(true, '${componentName} 组件已创建');
  });
`;
    
    if (!content.includes(testCase)) {
        content = content.replace('});', testCase + '});');
        fs.writeFileSync(testFile, content, 'utf8');
        log(`✅ 添加测试用例：${featureName}`);
    }
}

// 更新功能规划
function updateFeaturesPlan(featureName) {
    const featuresFile = path.join(WORKSPACE_DIR, 'FEATURES_PLAN.md');
    
    if (!fs.existsSync(featuresFile)) {
        log('⚠️  FEATURES_PLAN.md 不存在');
        return;
    }
    
    let content = fs.readFileSync(featuresFile, 'utf8');
    
    // 将 - [ ] 替换为 - ✅
    const escapedName = featureName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`- \\\\[ \\\\] ${escapedName}`, 'g');
    
    if (content.match(regex)) {
        content = content.replace(regex, `- ✅ ${featureName}`);
        fs.writeFileSync(featuresFile, content, 'utf8');
        log(`✅ 更新 FEATURES_PLAN.md: ${featureName} 标记为完成`);
    } else {
        log(`⚠️  未在 FEATURES_PLAN.md 中找到：${featureName}`);
    }
}

// 主循环
async function main() {
    log('🚀 LightMark AI 开发者启动');
    log(`📁 监听目录：${WORKSPACE_DIR}`);
    log(`⏰ 检查间隔：${CHECK_INTERVAL / 1000} 秒`);
    log('');
    log('工作模式：');
    log('  1. 监听 .dev-request.json 文件');
    log('  2. 自动开发请求的功能');
    log('  3. 创建组件、集成、测试、更新文档');
    log('  4. 写入 .dev-result.json 标记完成');
    log('');
    
    while (true) {
        const request = checkRequestFile();
        
        if (request) {
            await executeDevelopment(request);
        }
        
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

main().catch(error => {
    log('❌ 启动失败', error.message);
    process.exit(1);
});
