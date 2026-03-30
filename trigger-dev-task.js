#!/usr/bin/env node

/**
 * LightMark 自动开发触发器
 * 
 * 当检测到构建完成后，自动创建子代理任务来开发下一个功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 下一个待开发功能
const NEXT_FEATURE = {
    name: '内联预览（行内 Markdown 渲染）',
    priority: 'P0',
    description: 'Typora 核心特性 - 所见即所得编辑，在编辑行内直接渲染 Markdown 语法',
};

// 开发任务描述
const TASK_PROMPT = `
# LightMark 功能开发任务

## 目标
开发功能：**${NEXT_FEATURE.name}**

## 优先级
${NEXT_FEATURE.priority} - ${NEXT_FEATURE.description}

## 要求
1. 参考已实现的功能代码风格（如 Outline.svelte, TableEditor.svelte）
2. 保持与现有代码的一致性
3. 添加相应的单元测试
4. 更新 FEATURES_PLAN.md 标记完成状态

## 开发步骤
1. 分析功能需求
2. 创建或修改组件文件
3. 集成到主编辑器
4. 编写测试
5. 更新文档
6. 提交代码触发构建

## 文件位置
- 组件：/home/node/.openclaw/workspace/lightmark/src/components/
- 测试：/home/node/.openclaw/workspace/lightmark/tests/
- 规划：/home/node/.openclaw/workspace/lightmark/FEATURES_PLAN.md

开始开发吧！
`;

// 保存任务文件
const taskFile = path.join(__dirname, '.next-task.md');
fs.writeFileSync(taskFile, `# 下一个开发任务\n\n${TASK_PROMPT}`, 'utf8');

console.log('✅ 开发任务已创建');
console.log(`📄 任务文件：${taskFile}`);
console.log(`🎯 功能：${NEXT_FEATURE.name}`);

// 如果需要，可以在这里触发 OpenClaw subagent
// 例如：sessions_spawn({ task: TASK_PROMPT, ... })
