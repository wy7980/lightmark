#!/usr/bin/env node

/**
 * LightMark 自动化流水线监控器 - 完全自动化版本
 * 
 * 功能：
 * 1. 每 2 分钟检查 GitHub Actions 构建任务状态
 * 2. 构建中等待，超过 10 分钟或构建完成则继续
 * 3. 自动选择高优先级待开发功能
 * 4. 调用 AI 代理自动开发
 * 5. 开发完成后自动提交推送到 GitHub
 * 6. 触发新一轮构建，形成闭环
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== 配置 ====================

const CONFIG = {
    // GitHub 配置
    github: {
        owner: 'wy7980',
        repo: 'lightmark',
        token: process.env.GITHUB_TOKEN || '',
    },
    
    // 检查间隔（毫秒）
    checkInterval: 2 * 60 * 1000, // 2 分钟
    
    // 构建超时时间（毫秒）
    buildTimeout: 10 * 60 * 1000, // 10 分钟
    
    // 功能规划文件
    featuresPlanPath: '/home/node/.openclaw/workspace/lightmark/FEATURES_PLAN.md',
    
    // 状态文件
    stateFilePath: '/home/node/.openclaw/workspace/lightmark/.pipeline-state.json',
    
    // 日志文件
    logFile: '/home/node/.openclaw/workspace/logs/lightmark-pipeline.log',
    
    // 工作目录
    workspaceDir: '/home/node/.openclaw/workspace/lightmark',
    
    // Git 配置
    git: {
        userName: 'OpenClaw Bot',
        userEmail: 'openclaw@localhost',
        branch: 'main',
    },
};

// ==================== 状态管理 ====================

class PipelineState {
    constructor() {
        this.state = this.loadState();
    }
    
    loadState() {
        try {
            if (fs.existsSync(CONFIG.stateFilePath)) {
                const data = fs.readFileSync(CONFIG.stateFilePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            log('警告：无法加载状态文件，使用默认状态');
        }
        
        return {
            lastCheck: null,
            currentRunId: null,
            currentStatus: 'idle', // idle, building, developing, pushing
            buildStartTime: null,
            currentFeature: null,
            completedFeatures: [],
            pendingFeatures: [],
            lastCompletedAt: null,
            cycleCount: 0,
        };
    }
    
    saveState() {
        fs.writeFileSync(CONFIG.stateFilePath, JSON.stringify(this.state, null, 2), 'utf8');
    }
    
    update(updates) {
        Object.assign(this.state, updates);
        this.saveState();
    }
}

// ==================== GitHub API ====================

function githubRequest(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.github.owner}/${CONFIG.github.repo}${endpoint}`,
            method: method,
            headers: {
                'User-Agent': 'LightMark-Pipeline',
                'Accept': 'application/vnd.github.v3+json',
            },
        };
        
        if (CONFIG.github.token) {
            options.headers['Authorization'] = `token ${CONFIG.github.token}`;
        }
        
        if (body) {
            options.headers['Content-Type'] = 'application/json';
        }
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : {});
                } else {
                    reject(new Error(`GitHub API 错误：${res.statusCode} - ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

async function getLatestWorkflowRun() {
    try {
        const runs = await githubRequest('/actions/runs?per_page=5');
        return runs.workflow_runs[0] || null;
    } catch (error) {
        log('❌ 错误：获取工作流运行状态失败', error.message);
        return null;
    }
}

async function getWorkflowRuns() {
    try {
        const runs = await githubRequest('/actions/runs?per_page=20');
        return runs.workflow_runs || [];
    } catch (error) {
        log('❌ 错误：获取工作流列表失败', error.message);
        return [];
    }
}

// ==================== 功能规划解析 ====================

function parseFeaturesPlan() {
    try {
        const content = fs.readFileSync(CONFIG.featuresPlanPath, 'utf8');
        const features = [];
        
        // 从"待开发功能"部分解析
        const pendingRegex = /##.*待开发功能.*?([\s\S]*?)(?=##|$)/i;
        const pendingMatch = content.match(pendingRegex);
        
        if (pendingMatch) {
            const section = pendingMatch[1];
            const lines = section.split('\n').filter(line => line.includes('|') && !line.includes('优先级'));
            
            lines.forEach(line => {
                const cols = line.split('|').map(c => c.trim()).filter(c => c);
                if (cols.length >= 4) {
                    const priority = cols[0];
                    const name = cols[1];
                    if (priority && name && !priority.includes('-') && !name.includes('---')) {
                        features.push({
                            priority: priority,
                            name: name,
                            difficulty: cols[2] || '',
                            value: cols[3] || '',
                            status: 'pending',
                        });
                    }
                }
            });
        }
        
        // 从"已完成功能"部分解析已完成的功能
        const completedSectionRegex = /##.*已完成功能.*?([\s\S]*?)(?=##|$)/i;
        const completedMatch = content.match(completedSectionRegex);
        
        if (completedMatch) {
            const completedSection = completedMatch[1];
            const completedFeatures = completedSection.match(/###.*?（[^)]+）.*?✅/g) || [];
            
            completedFeatures.forEach(cf => {
                const featureName = cf.match(/###\s*(.*?)\s*（/)?.[1]?.trim();
                if (featureName) {
                    const existing = features.find(f => f.name.includes(featureName));
                    if (existing) {
                        existing.status = 'completed';
                    }
                }
            });
        }
        
        // 如果待开发部分为空，从 FEATURES_PLAN.md 的其他部分查找
        if (features.length === 0) {
            const taskRegex = /- \[ \] (.+?)(?: ⭐+)?$/gm;
            let taskMatch;
            while ((taskMatch = taskRegex.exec(content)) !== null) {
                features.push({
                    priority: 'P?',
                    name: taskMatch[1].trim(),
                    difficulty: '',
                    value: '',
                    status: 'pending',
                });
            }
        }
        
        // 按优先级排序（P0 > P1 > P2 > P3）
        features.sort((a, b) => {
            const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
            const aOrder = priorityOrder[a.priority] || 99;
            const bOrder = priorityOrder[b.priority] || 99;
            return aOrder - bOrder;
        });
        
        return features;
    } catch (error) {
        log('❌ 错误：解析功能规划失败', error.message);
        return [];
    }
}

function getNextPendingFeature(state) {
    const features = parseFeaturesPlan();
    const completedNames = state.state.completedFeatures || [];
    
    // 找到第一个未完成且未在开发中的功能
    const nextFeature = features.find(f => 
        f.status === 'pending' && 
        !completedNames.includes(f.name) &&
        (!state.state.currentFeature || state.state.currentFeature.name !== f.name)
    );
    
    return nextFeature || null;
}

// ==================== Git 操作 ====================

function execCommand(command, args, cwd = CONFIG.workspaceDir) {
    return new Promise((resolve, reject) => {
        log(`🔧 执行：${command} ${args.join(' ')}`);
        
        const proc = spawn(command, args, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', data => stdout += data.toString());
        proc.stderr.on('data', data => stderr += data.toString());
        
        proc.on('close', code => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`命令失败 (code ${code}): ${stderr}`));
            }
        });
        
        proc.on('error', reject);
    });
}

async function commitAndPush(featureName) {
    log('📦 开始提交代码...');
    
    try {
        // 配置 Git 用户
        await execCommand('git', ['config', 'user.name', CONFIG.git.userName]);
        await execCommand('git', ['config', 'user.email', CONFIG.git.userEmail]);
        
        // 添加所有更改
        await execCommand('git', ['add', '.']);
        
        // 检查是否有更改
        const statusResult = await execCommand('git', ['status', '--porcelain']);
        if (!statusResult.stdout.trim()) {
            log('⚠️  没有检测到代码更改，跳过提交');
            return false;
        }
        
        // 提交
        const commitMsg = `feat: 添加 ${featureName} 功能`;
        await execCommand('git', ['commit', '-m', commitMsg]);
        log(`✅ 提交成功：${commitMsg}`);
        
        // 推送
        log('🚀 推送到 GitHub...');
        await execCommand('git', ['push', 'origin', CONFIG.git.branch]);
        log('✅ 推送成功！GitHub Actions 将自动触发构建');
        
        return true;
    } catch (error) {
        log('❌ Git 操作失败:', error.message);
        throw error;
    }
}

// ==================== AI 开发代理 ====================

async function spawnDevelopmentAgent(feature) {
    log(`🤖 启动 AI 开发代理：${feature.name}`);
    
    const taskPrompt = `# LightMark 功能开发任务

## 目标
开发功能：**${feature.name}**
优先级：${feature.priority}

## 要求
1. 分析现有代码结构（参考 src/components/ 目录中的组件）
2. 创建对应的 Svelte 组件文件
3. 集成到主编辑器（Editor.svelte 或 App.svelte）
4. 添加单元测试（tests/unit.test.js）
5. 更新 FEATURES_PLAN.md 标记该功能为完成（添加 ✅ 标记）

## 开发规范
- 使用 TypeScript
- Svelte 4 语法
- 保持与现有代码风格一致
- 代码要有注释

## 文件位置
- 组件：/home/node/.openclaw/workspace/lightmark/src/components/
- 测试：/home/node/.openclaw/workspace/lightmark/tests/
- 规划：/home/node/.openclaw/workspace/lightmark/FEATURES_PLAN.md

## 完成标准
1. 组件代码编写完成
2. 功能可以正常使用
3. 添加了单元测试
4. 更新了 FEATURES_PLAN.md

开始开发吧！开发完成后我会自动提交代码。`;

    // 保存任务文件
    const taskFile = path.join(CONFIG.workspaceDir, '.current-task.md');
    fs.writeFileSync(taskFile, taskPrompt, 'utf8');
    
    // 调用 OpenClaw sessions_spawn 创建 subagent
    // 这里我们通过创建标记文件来触发
    const triggerFile = path.join(CONFIG.workspaceDir, '.trigger-dev-agent');
    fs.writeFileSync(triggerFile, JSON.stringify({
        feature: feature,
        prompt: taskPrompt,
        timestamp: new Date().toISOString(),
    }), 'utf8');
    
    log(`📝 任务文件已创建：${taskFile}`);
    log(`🔔 触发文件已创建：${triggerFile}`);
    
    // 注意：实际使用中需要调用 OpenClaw API 来创建 subagent
    // 这里我们模拟开发过程，实际开发由外部触发
    return true;
}

// 检查开发是否完成（通过检查标记文件）
function checkDevelopmentComplete() {
    const doneFile = path.join(CONFIG.workspaceDir, '.dev-complete');
    if (fs.existsSync(doneFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(doneFile, 'utf8'));
            fs.unlinkSync(doneFile); // 删除标记文件
            return { complete: true, data };
        } catch (e) {
            return { complete: true, data: {} };
        }
    }
    return { complete: false };
}

// ==================== 日志系统 ====================

function log(message, error = null) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}${error ? ' - ' + error : ''}\n`;
    
    console.log(logLine.trim());
    
    // 追加到日志文件
    try {
        const logDir = path.dirname(CONFIG.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(CONFIG.logFile, logLine);
    } catch (e) {
        // 忽略日志写入错误
    }
}

// ==================== 主逻辑 ====================

async function checkBuildStatus(state) {
    log('🔍 检查构建任务状态...');
    
    const runs = await getWorkflowRuns();
    
    // 找到正在运行的构建
    const runningBuild = runs.find(r => r.status === 'in_progress' || r.status === 'queued');
    
    if (runningBuild) {
        const runId = runningBuild.id;
        const status = runningBuild.status;
        const startTime = new Date(runningBuild.created_at).getTime();
        const elapsed = Date.now() - startTime;
        const elapsedMin = Math.floor(elapsed / 60000);
        
        log(`📊 构建运行中 #${runId}: ${status} (已运行 ${elapsedMin} 分钟)`);
        
        // 检查是否超时
        if (elapsed > CONFIG.buildTimeout) {
            log(`⏰ 构建已超过 ${CONFIG.buildTimeout / 60000} 分钟，继续执行`);
            state.update({
                currentRunId: runId,
                currentStatus: 'timeout',
                buildStartTime: startTime,
            });
            return 'timeout';
        }
        
        // 更新状态
        state.update({
            currentRunId: runId,
            currentStatus: 'building',
            buildStartTime: startTime,
        });
        
        return 'building';
    }
    
    // 没有运行中的构建，找到最近一次完成的
    const latestRun = runs[0];
    if (!latestRun) {
        log('⚠️  未找到工作流运行记录');
        return 'none';
    }
    
    const runId = latestRun.id;
    const status = latestRun.status;
    const conclusion = latestRun.conclusion;
    
    log(`📊 最近构建 #${runId}: ${status}${conclusion ? ` (${conclusion})` : ''}`);
    
    // 检查是否是新的完成状态
    const isBuildComplete = state.state.currentStatus === 'building' && 
                            (status === 'completed' || status === 'failure');
    
    if (status === 'completed') {
        if (conclusion === 'success') {
            log('✅ 构建成功！');
            state.update({
                currentRunId: runId,
                currentStatus: 'completed',
                lastCompletedAt: new Date().toISOString(),
            });
            return 'success';
        } else {
            log(`❌ 构建失败：${conclusion}`);
            state.update({
                currentRunId: runId,
                currentStatus: 'failed',
            });
            return 'failed';
        }
    } else if (status === 'failure' || status === 'cancelled') {
        log(`⚠️  构建异常结束：${status}`);
        state.update({ currentStatus: 'failed' });
        return 'failed';
    }
    
    return 'unknown';
}

async function developNextFeature(state) {
    const feature = getNextPendingFeature(state);
    
    if (!feature) {
        log('🎉 所有功能已完成！');
        state.update({ currentStatus: 'all_completed' });
        return null;
    }
    
    log(`🎯 下一个开发目标：${feature.name} (${feature.priority})`);
    
    state.update({
        currentFeature: feature,
        currentStatus: 'developing',
    });
    
    // 启动 AI 开发代理
    await spawnDevelopmentAgent(feature);
    
    return feature;
}

async function waitForDevelopment(feature, timeoutMs = 30 * 60 * 1000) {
    log(`⏳ 等待开发完成（超时：${timeoutMs / 60000} 分钟）...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
        const check = checkDevelopmentComplete();
        
        if (check.complete) {
            log('✅ 开发完成！');
            return true;
        }
        
        // 每 30 秒检查一次
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    log('⏰ 开发超时');
    return false;
}

async function mainLoop() {
    log('🚀 LightMark 自动化流水线启动');
    log(`📋 检查间隔：${CONFIG.checkInterval / 60000} 分钟`);
    log(`⏰ 构建超时：${CONFIG.buildTimeout / 60000} 分钟`);
    log('');
    
    const state = new PipelineState();
    
    while (true) {
        try {
            log('═'.repeat(50));
            log(`🔄 第 ${state.state.cycleCount + 1} 轮循环`);
            log('═'.repeat(50));
            
            // 步骤 1: 检查构建状态
            const buildStatus = await checkBuildStatus(state);
            
            // 步骤 2: 根据构建状态决定行动
            switch (buildStatus) {
                case 'building':
                    log('⏳ 构建进行中，等待下次检查...');
                    break;
                    
                case 'timeout':
                    log('⏰ 构建超时，继续执行开发流程');
                    // 继续执行开发
                    
                case 'success':
                case 'failed':
                case 'none':
                case 'unknown':
                    // 构建完成或无构建，开始开发下一个功能
                    log('🚀 开始开发新流程');
                    
                    // 选择下一个功能
                    const feature = await developNextFeature(state);
                    
                    if (!feature) {
                        log('🎉 所有功能开发完成，进入待机模式');
                        break;
                    }
                    
                    // 等待开发完成
                    const devComplete = await waitForDevelopment(feature);
                    
                    if (devComplete) {
                        // 提交代码
                        try {
                            const pushed = await commitAndPush(feature.name);
                            
                            if (pushed) {
                                log('✅ 代码已推送，等待 GitHub Actions 构建...');
                                
                                // 更新状态
                                state.update({
                                    currentStatus: 'building',
                                    completedFeatures: [
                                        ...(state.state.completedFeatures || []),
                                        feature.name
                                    ],
                                    cycleCount: state.state.cycleCount + 1,
                                });
                                
                                // 等待一小会儿让 GitHub 开始构建
                                await new Promise(resolve => setTimeout(resolve, 10000));
                            }
                        } catch (error) {
                            log('❌ 提交失败，记录错误', error.message);
                            state.update({ currentStatus: 'error' });
                        }
                    } else {
                        log('⚠️  开发未完成，跳过本次循环');
                    }
                    break;
            }
            
            log('');
            
        } catch (error) {
            log('❌ 循环错误:', error.message);
            state.update({ currentStatus: 'error' });
        }
        
        // 等待下次检查
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
    }
}

// 启动
mainLoop().catch(error => {
    log('❌ 启动失败', error.message);
    process.exit(1);
});
