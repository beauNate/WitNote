/**
 * WebLLM Web Worker
 * 在独立线程中运行 WebLLM 引擎，避免阻塞主线程
 */

import * as webllm from '@mlc-ai/web-llm';
import { WorkerMessage, DEFAULT_WEBLLM_MODEL, LLMMessage } from './types';

// WebGPU 类型扩展
declare global {
    interface Navigator {
        gpu?: {
            requestAdapter(): Promise<GPUAdapter | null>;
        };
    }
    interface GPUAdapter {
        requestDevice(): Promise<GPUDevice | null>;
        requestAdapterInfo(): Promise<{ vendor: string; architecture: string }>;
    }
    interface GPUDevice { }
}

let engine: webllm.MLCEngine | null = null;

// 发送消息到主线程
function postMessage(message: WorkerMessage) {
    self.postMessage(message);
}

// 检测 WebGPU 支持
async function checkWebGPU(): Promise<boolean> {
    try {
        if (!navigator.gpu) {
            console.error('❌ WebGPU 不可用: navigator.gpu 未定义');
            return false;
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            console.error('❌ WebGPU 不可用: 无法获取 GPU 适配器');
            return false;
        }

        console.log('✅ WebGPU 可用');
        try {
            const info = await adapter.requestAdapterInfo();
            console.log('📊 GPU 适配器:', info);
        } catch {
            console.log('📊 GPU 适配器信息不可用');
        }
        return true;
    } catch (error) {
        console.error('❌ WebGPU 检测失败:', error);
        return false;
    }
}

// 初始化引擎
async function initEngine(modelId: string) {
    try {
        console.log('🔄 Worker: 检测 WebGPU...');

        const hasWebGPU = await checkWebGPU();
        if (!hasWebGPU) {
            postMessage({
                type: 'error',
                payload: 'WebGPU 不可用。请确保使用支持 WebGPU 的浏览器/Electron 版本。'
            });
            return;
        }

        console.log(`🔄 Worker: 开始加载模型 ${modelId}`);

        // 发送初始进度（stage 标识符，UI 层处理翻译）
        postMessage({
            type: 'progress',
            payload: {
                stage: 'init',
                progress: 0,
                text: ''  // UI 层根据 stage 显示翻译文本
            }
        });

        // 创建引擎并设置进度回调
        engine = new webllm.MLCEngine({
            initProgressCallback: (progress: { text: string; progress: number }) => {
                const progressPercent = Math.round(progress.progress * 100);
                const originalText = progress.text;

                // 根据 WebLLM 返回的文本判断是下载还是加载
                const isDownloading = originalText.toLowerCase().includes('fetch') ||
                    originalText.toLowerCase().includes('download');

                console.log(`📥 进度: ${progressPercent}% - ${originalText}`);
                postMessage({
                    type: 'progress',
                    payload: {
                        stage: isDownloading ? 'downloading' : 'loading',
                        progress: progressPercent,
                        text: ''  // UI 层根据 stage 显示翻译文本
                    }
                });
            }
        });

        await engine.reload(modelId);

        console.log('✅ Worker: 模型加载完成');
        postMessage({ type: 'ready' });
    } catch (error) {
        console.error('❌ Worker: 模型加载失败:', error);
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        postMessage({
            type: 'error',
            payload: `模型加载失败: ${errorMsg}`
        });
    }
}

// 流式聊天
async function streamChat(messages: LLMMessage[]) {
    if (!engine) {
        postMessage({
            type: 'error',
            payload: '引擎未初始化'
        });
        return;
    }

    try {
        // 不再添加系统提示词，useLLM 的 buildContextPrompt 已经包含
        const fullMessages: webllm.ChatCompletionMessageParam[] = messages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
        }));

        const asyncChunkGenerator = await engine.chat.completions.create({
            messages: fullMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1024
        });

        for await (const chunk of asyncChunkGenerator) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                postMessage({
                    type: 'token',
                    payload: delta
                });
            }
        }

        postMessage({ type: 'complete' });
    } catch (error) {
        console.error('❌ Worker: 生成失败:', error);
        postMessage({
            type: 'error',
            payload: error instanceof Error ? error.message : '生成失败'
        });
    }
}

// 中止生成
function abortGeneration() {
    if (engine) {
        engine.interruptGenerate();
        console.log('🛑 Worker: 生成已中止');
    }
}

// 监听主线程消息
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'init':
            const modelId = (payload as { modelId: string })?.modelId || DEFAULT_WEBLLM_MODEL;
            await initEngine(modelId);
            break;

        case 'chat':
            const messages = payload as LLMMessage[];
            await streamChat(messages);
            break;

        case 'abort':
            abortGeneration();
            break;

        default:
            console.warn('Worker: 未知消息类型:', type);
    }
};

console.log('🧵 WebLLM Worker 已启动');
console.log('📊 默认模型:', DEFAULT_WEBLLM_MODEL);
