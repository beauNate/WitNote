/**
 * LLM 服务类型定义
 * Ollama-only 架构
 */

// LLM 提供者类型（仅Ollama）
export type LLMProviderType = 'ollama';

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

// Ollama 模型详情
export interface OllamaModelDetails {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
}

// Ollama 模型信息
export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
    details?: OllamaModelDetails;
    formattedSize?: string; // 用于显示的人类可读大小
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

// 系统提示词
export const SYSTEM_PROMPT = `你是「禅意笔记本」的写作助手，运行在用户本地设备上。

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

// Ollama 默认配置
export const OLLAMA_BASE_URL = 'http://localhost:11434';
export const OLLAMA_DETECT_TIMEOUT = 3000; // 3秒超时

// 推荐模型列表
export const RECOMMENDED_MODELS = [
    { name: 'qwen2.5:0.5b', description: '通义千问 0.5B (轻量高智)', size: '397MB' },
    { name: 'qwen2.5:1.5b', description: '通义千问 1.5B (均衡首选)', size: '986MB' },
    { name: 'llama3.2:1b', description: 'Llama 3.2 1B (Meta最新)', size: '1.3GB' },
    { name: 'gemma:2b', description: 'Gemma 2B (Google出品)', size: '1.4GB' }
];
