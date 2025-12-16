/**
 * LLM 服务类型定义
 * 统一的接口抽象，让 UI 层不需要关心底层是 WebLLM 还是 Ollama
 */

// LLM 提供者类型
export type LLMProviderType = 'webllm' | 'ollama';

// 聊天消息格式
export interface LLMMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// 聊天记录（带 ID）
export interface ChatMessage extends LLMMessage {
    id: string;
    timestamp: number;
    isStreaming?: boolean;
}

// Ollama 模型信息
export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
}

// Ollama API 响应
export interface OllamaTagsResponse {
    models: OllamaModel[];
}

// Ollama 聊天响应（流式）
export interface OllamaChatChunk {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

// LLM 状态
export type LLMStatus =
    | 'detecting'     // 正在检测 Ollama
    | 'loading'       // 正在加载模型
    | 'ready'         // 准备就绪
    | 'generating'    // 正在生成
    | 'error';        // 出错

// 模型加载进度
export interface LoadProgress {
    stage: string;
    progress: number;  // 0-100
    text: string;
}

// LLM 提供者接口
export interface LLMProvider {
    type: LLMProviderType;
    modelName: string;

    // 初始化
    initialize(): Promise<void>;

    // 检查状态
    isReady(): boolean;

    // 流式生成
    streamChat(
        messages: LLMMessage[],
        onToken: (token: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): Promise<void>;

    // 中止生成
    abort(): void;
}

// Web Worker 消息类型
export type WorkerMessageType =
    | 'init'
    | 'chat'
    | 'abort'
    | 'progress'
    | 'token'
    | 'complete'
    | 'error'
    | 'ready';

export interface WorkerMessage {
    type: WorkerMessageType;
    payload?: unknown;
}

// 系统提示词 - 精简版（用于 WebLLM 微型模型）
export const SYSTEM_PROMPT_LITE = `你是笔记助手。回答时优先使用下方提供的文件信息。如果问题涉及搜索，直接引用搜索结果中的文件名。`;

// 系统提示词 - 完整版（用于 Ollama 大模型）
export const SYSTEM_PROMPT_FULL = `你是「禅意笔记本」的写作助手，运行在用户本地设备上。

【核心原则】
- 回答时优先使用下方提供的文件信息和搜索结果
- 如果搜索到相关文件，直接告诉用户找到了哪些文件
- 回答简洁精炼，使用自然流畅的中文

【你的能力】
- 帮用户在笔记库中搜索和查找文件
- 帮助用户润色、修改、续写文章
- 总结内容、提取要点
- 提供写作建议和灵感

【回答风格】
- 不要重复用户的问题
- 直接给出有价值的回答
- 保持友好但专业的语气`;

// 兼容旧代码
export const SYSTEM_PROMPT = SYSTEM_PROMPT_LITE;

// 默认 WebLLM 模型 (内置模型)
export const DEFAULT_WEBLLM_MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

// WebLLM 可用模型列表
export interface WebLLMModelInfo {
    id: string;               // MLC 模型 ID
    name: string;             // 显示名称
    size: string;             // 参数量
    quality: number;          // 质量评分 1-5
    creativity: number;       // 创意评分 1-5
    speed: string;            // 速度描述
    useCase: string;          // 推荐用途
    isBuiltin: boolean;       // 是否内置
}

export const WEBLLM_MODELS: WebLLMModelInfo[] = [
    {
        id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
        name: 'Qwen2.5-0.5B',
        size: '0.5B',
        quality: 2,
        creativity: 1,
        speed: '🚀 极速',
        useCase: '简单改写、测试环境',
        isBuiltin: true
    },
    {
        id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
        name: 'Qwen2.5-1.5B',
        size: '1.5B',
        quality: 4,
        creativity: 3,
        speed: '🚀 极速',
        useCase: '最具性价比，低配设备首选',
        isBuiltin: false
    },
    {
        id: 'gemma-2-2b-it-q4f16_1-MLC',
        name: 'Gemma 2 2B',
        size: '2.6B',
        quality: 3,
        creativity: 5,
        speed: '⚡ 很快',
        useCase: '创意写作、散文、小说片段',
        isBuiltin: false
    },
    {
        id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        name: 'Llama 3.2 3B',
        size: '3.2B',
        quality: 3,
        creativity: 3,
        speed: '⚡ 很快',
        useCase: '商务邮件、双语写作、通用助手',
        isBuiltin: false
    },
    {
        id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
        name: 'Qwen2.5-3B',
        size: '3B',
        quality: 5,
        creativity: 4,
        speed: '🚗 流畅',
        useCase: '主力中文写作助手 (推荐)',
        isBuiltin: false
    },
    {
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        name: 'Phi-3.5 Mini',
        size: '3.8B',
        quality: 3,
        creativity: 2,
        speed: '🐢 较重',
        useCase: '严谨逻辑、大纲生成、学术辅助',
        isBuiltin: false
    }
];

// Ollama 默认配置
export const OLLAMA_BASE_URL = 'http://localhost:11434';
export const OLLAMA_DETECT_TIMEOUT = 3000; // 3秒超时
