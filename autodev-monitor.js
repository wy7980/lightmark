#!/usr/bin/env node

/**
 * LightMark 真正的全自动开发流水线
 * 
 * 特点：
 * 1. 自动检查 GitHub Actions 构建状态
 * 2. 构建完成后自动调用 AI 开发下一个功能
 * 3. AI 开发完成后自动提交推送
 * 4. 形成完整的自动化闭环
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== 配置 ====================

const CONFIG = {
    github: {
        owner: 'wy7980',
        repo: 'lightmark',
        token: process.env.GITHUB_TOKEN || '',
    },
    
    checkInterval: 2 * 60 * 1000, // 2 分钟
    buildTimeout: 10 * 60 * 1000, // 10 分钟
    
    featuresPlanPath: '/home/node/.openclaw/workspace/lightmark/FEATURES_PLAN.md',
    stateFilePath: '/home/node/.openclaw/workspace/lightmark/.pipeline-state.json',
    logFile: '/home/node/.openclaw/workspace/logs/lightmark-autodev.log',
    workspaceDir: '/home/node/.openclaw/workspace/lightmark',
    
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
                return JSON.parse(fs.readFileSync(CONFIG.stateFilePath, 'utf8'));
            }
        } catch (error) {
            log('警告：无法加载状态文件');
        }
        
        return {
            lastCheck: null,
            currentRunId: null,
            currentStatus: 'idle',
            completedFeatures: [],
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
            method,
            headers: {
                'User-Agent': 'LightMark-AutoDev',
                'Accept': 'application/vnd.github.v3+json',
            },
        };
        
        if (CONFIG.github.token) {
            options.headers['Authorization'] = `token ${CONFIG.github.token}`;
        }
        
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            req.write(JSON.stringify(body));
        }
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : {});
                } else {
                    reject(new Error(`GitHub API 错误：${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function getWorkflowRuns() {
    try {
        const runs = await githubRequest('/actions/runs?per_page=10');
        return runs.workflow_runs || [];
    } catch (error) {
        log('❌ 获取工作流失败:', error.message);
        return [];
    }
}

// ==================== 功能规划解析 ====================

function parseFeaturesPlan() {
    try {
        const content = fs.readFileSync(CONFIG.featuresPlanPath, 'utf8');
        const features = [];
        
        // 查找所有待开发功能（- [ ] 格式）
        const taskRegex = /- \[ \] (.+?)(?: ⭐*)?$/gm;
        let match;
        
        while ((match = taskRegex.exec(content)) !== null) {
            const name = match[1].trim();
            // 跳过已经完成的
            if (!name.includes('✅')) {
                features.push({
                    name: name,
                    status: 'pending',
                });
            }
        }
        
        // 按优先级排序（P0 > P1 > P2 > P3）
        features.sort((a, b) => {
            const priorityMatch = (name) => {
                if (name.includes('P0')) return 0;
                if (name.includes('P1')) return 1;
                if (name.includes('P2')) return 2;
                if (name.includes('P3')) return 3;
                return 4;
            };
            return priorityMatch(a.name) - priorityMatch(b.name);
        });
        
        return features;
    } catch (error) {
        log('❌ 解析功能规划失败:', error.message);
        return [];
    }
}

function getNextPendingFeature(state) {
    const features = parseFeaturesPlan();
    const completed = state.state.completedFeatures || [];
    
    return features.find(f => !completed.includes(f.name)) || null;
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
        await execCommand('git', ['config', 'user.name', CONFIG.git.userName]);
        await execCommand('git', ['config', 'user.email', CONFIG.git.userEmail]);
        await execCommand('git', ['add', '.']);
        
        const statusResult = await execCommand('git', ['status', '--porcelain']);
        if (!statusResult.stdout.trim()) {
            log('⚠️  没有代码更改，跳过提交');
            return false;
        }
        
        const commitMsg = `feat: 添加 ${featureName} 功能`;
        await execCommand('git', ['commit', '-m', commitMsg]);
        log(`✅ 提交成功：${commitMsg}`);
        
        log('🚀 推送到 GitHub...');
        await execCommand('git', ['push', 'origin', CONFIG.git.branch]);
        log('✅ 推送成功！GitHub Actions 将自动触发构建');
        
        return true;
    } catch (error) {
        log('❌ Git 操作失败:', error.message);
        throw error;
    }
}

// ==================== AI 开发调用 ====================

async function spawnAIDeveloper(feature) {
    log(`🤖 调用 AI 开发者：${feature.name}`);
    
    const taskPrompt = `你是一个专业的 Svelte 前端开发工程师。为 LightMark Markdown 编辑器开发功能：${feature.name}

## 要求
1. 分析 src/components/ 目录中的现有组件
2. 创建或修改对应的 Svelte 组件
3. 集成到 Editor.svelte 或 App.svelte
4. 添加单元测试到 tests/unit.test.js
5. 更新 FEATURES_PLAN.md，将该功能的 - [ ] 改为 - ✅

## 技术栈
- Svelte 4 + TypeScript
- CodeMirror 6
- Tauri 2.0

## 文件位置
- 组件：/home/node/.openclaw/workspace/lightmark/src/components/
- 测试：/home/node/.openclaw/workspace/lightmark/tests/
- 规划：/home/node/.openclaw/workspace/lightmark/FEATURES_PLAN.md

开始开发！完成后我会自动提交代码。`;

    // 创建开发请求文件
    const requestFile = path.join(CONFIG.workspaceDir, '.dev-request.json');
    fs.writeFileSync(requestFile, JSON.stringify({
        feature: feature,
        prompt: taskPrompt,
        createdAt: new Date().toISOString(),
        status: 'pending',
    }), 'utf8');
    
    log('📝 开发请求已创建：' + requestFile);
    log('⏳ 等待 AI 开发完成...');
    
    // 轮询检查开发结果
    const resultFile = path.join(CONFIG.workspaceDir, '.dev-result.json');
    const startTime = Date.now();
    const timeout = 30 * 60 * 1000; // 30 分钟
    
    while (Date.now() - startTime < timeout) {
        if (fs.existsSync(resultFile)) {
            try {
                const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
                fs.unlinkSync(resultFile);
                
                if (result.status === 'success') {
                    log('✅ AI 开发完成！');
                    return true;
                } else {
                    log('❌ AI 开发失败:', result.error);
                    return false;
                }
            } catch (e) {
                log('⚠️  读取开发结果失败');
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    log('⏰ AI 开发超时');
    return false;
}

// ==================== 日志系统 ====================

function log(message, error = null) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}${error ? ' - ' + error : ''}\n`;
    
    console.log(logLine.trim());
    
    try {
        const logDir = path.dirname(CONFIG.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(CONFIG.logFile, logLine);
    } catch (e) {}
}

// ==================== 主逻辑 ====================

async function checkBuildStatus() {
    const runs = await getWorkflowRuns();
    const runningBuild = runs.find(r => r.status === 'in_progress' || r.status === 'queued');
    
    if (runningBuild) {
        const elapsed = Date.now() - new Date(runningBuild.created_at).getTime();
        log(`📊 构建运行中 #${runningBuild.id} (${Math.floor(elapsed / 60000)}分钟)`);
        
        if (elapsed > CONFIG.buildTimeout) {
            return 'timeout';
        }
        return 'building';
    }
    
    const latestRun = runs[0];
    if (!latestRun) return 'none';
    
    if (latestRun.status === 'completed') {
        return latestRun.conclusion === 'success' ? 'success' : 'failed';
    }
    
    return 'unknown';
}

async function mainLoop() {
    log('🚀 LightMark 真正的全自动开发流水线启动');
    log(`📋 检查间隔：${CONFIG.checkInterval / 60000} 分钟`);
    log(`⏰ 构建超时：${CONFIG.buildTimeout / 60000} 分钟`);
    log('');
    
    const state = new PipelineState();
    
    while (true) {
        try {
            log('═'.repeat(60));
            log(`🔄 第 ${state.state.cycleCount + 1} 轮循环`);
            log('═'.repeat(60));
            
            const buildStatus = await checkBuildStatus();
            log(`📊 构建状态：${buildStatus}`);
            
            if (buildStatus === 'building') {
                log('⏳ 等待构建完成...');
            } else if (buildStatus === 'success' || buildStatus === 'timeout' || buildStatus === 'none') {
                log('🚀 开始开发新流程');
                
                const feature = getNextPendingFeature(state);
                
                if (!feature) {
                    log('🎉 所有功能已完成！');
                    break;
                }
                
                log(`🎯 下一个功能：${feature.name}`);
                
                // 调用 AI 开发
                const devSuccess = await spawnAIDeveloper(feature);
                
                if (devSuccess) {
                    // 提交代码
                    const pushed = await commitAndPush(feature.name);
                    
                    if (pushed) {
                        state.update({
                            currentStatus: 'building',
                            completedFeatures: [...(state.state.completedFeatures || []), feature.name],
                            cycleCount: state.state.cycleCount + 1,
                        });
                        
                        log('⏳ 等待 GitHub 开始构建...');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                } else {
                    log('⚠️  开发失败，跳过本次循环');
                }
            } else if (buildStatus === 'failed') {
                log('❌ 构建失败，继续尝试开发');
            }
            
            log('');
            
        } catch (error) {
            log('❌ 循环错误:', error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
    }
}

mainLoop().catch(error => {
    log('❌ 启动失败', error.message);
    process.exit(1);
});
