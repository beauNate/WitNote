/**
 * LLM Service Type Definitions
 * Ollama-only Architecture
 */

// LLM Provider Type (Ollama only)
export type LLMProviderType = 'ollama';

// Chat Message Format
export interface LLMMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Chat Record (with ID)
export interface ChatMessage extends LLMMessage {
    id: string;
    timestamp: number;
    isStreaming?: boolean;
}

// Ollama Model Details
export interface OllamaModelDetails {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
}

// Ollama Model Info
export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
    details?: OllamaModelDetails;
    formattedSize?: string; // Human readable size
}

// Ollama API Response
export interface OllamaTagsResponse {
    models: OllamaModel[];
}

// Ollama Chat Response (Streaming)
export interface OllamaChatChunk {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

// LLM Status
export type LLMStatus =
    | 'detecting'     // Detecting Ollama
    | 'loading'       // Loading model
    | 'ready'         // Ready
    | 'generating'    // Generating
    | 'error';        // Error

// Model Load Progress
export interface LoadProgress {
    stage: string;
    progress: number;  // 0-100
    text: string;
}

// LLM Provider Interface
export interface LLMProvider {
    type: LLMProviderType;
    modelName: string;

    // Initialize
    initialize(): Promise<void>;

    // Check status
    isReady(): boolean;

    // Stream chat
    streamChat(
        messages: LLMMessage[],
        onToken: (token: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): Promise<void>;


    // Abort generation
    abort(): void;
}

// ========================================
// System Prompts - English Only
// ========================================

// Engine Type
export type EngineType = 'webllm' | 'ollama' | 'openai';

// --- Built-in Model (WebLLM) - Lite Version (~120 chars) ---
export const SYSTEM_PROMPT_LITE_EN = `You are NurseStation writing assistant. Answer concisely. Prioritize provided file content.`;

// --- System Instruction Templates ---

// Default Role Identity (No extra instructions)
export const DEFAULT_ROLE_IDENTITY_EN = `You are the writing assistant for "NurseStation", running locally on the user's device.`;

// Lite: Identity only
export const INSTRUCTION_TEMPLATE_LITE_EN = ``;

// Standard: Core principles and basic capabilities
export const INSTRUCTION_TEMPLATE_STANDARD_EN = `
【Core Principles】
- Prioritize provided file content
- Keep responses concise and clear

【Capabilities】
- Search and find files
- Polish, edit, and continue writing
- Summarize and extract key points`;

// Full: Detailed principles, capabilities and style
export const INSTRUCTION_TEMPLATE_FULL_EN = `
【Core Principles】
- Prioritize information from files and search results provided below
- If relevant files are found, tell the user which files were found
- Keep responses concise and clear

【Capabilities】
- Search and find files in the user's note library
- Help polish, edit, and continue writing articles
- Summarize content and extract key points
- Provide writing suggestions and inspiration

【Response Style】
- Don't repeat the user's question
- Provide valuable answers directly
- Maintain a friendly but professional tone`;

// Compatibility constants
export const SYSTEM_PROMPT_STANDARD_EN = `You are the writing assistant for "NurseStation", running locally on the user's device.` + INSTRUCTION_TEMPLATE_STANDARD_EN;
export const SYSTEM_PROMPT_EN = `You are the writing assistant for "NurseStation", running locally on the user's device.

【Core Principles】
- Prioritize information from files and search results provided below
- If relevant files are found, tell the user which files were found
- Keep responses concise and clear

【Your Capabilities】
- Search and find files in the user's note library
- Help polish, edit, and continue writing articles
- Summarize content and extract key points
- Provide writing suggestions and inspiration

【Response Style】
- Don't repeat the user's question
- Provide valuable answers directly
- Maintain a friendly but professional tone`;

export const SYSTEM_PROMPT = SYSTEM_PROMPT_EN;

// Get default system prompt (Always English)
export function getDefaultSystemPrompt(_lang: string, level: 'lite' | 'standard' | 'full' = 'standard'): string {
    const baseIdentity = DEFAULT_ROLE_IDENTITY_EN;
    let instruction = '';

    if (level === 'lite') {
        return baseIdentity;
    }

    if (level === 'standard') {
        instruction = INSTRUCTION_TEMPLATE_STANDARD_EN;
    } else if (level === 'full') {
        instruction = INSTRUCTION_TEMPLATE_FULL_EN;
    }

    return baseIdentity + instruction;
}

// Get lite system prompt (Always English)
export function getLiteSystemPrompt(_lang: string): string {
    return SYSTEM_PROMPT_LITE_EN;
}

// Get standard system prompt (Always English)
export function getStandardSystemPrompt(_lang: string): string {
    return SYSTEM_PROMPT_STANDARD_EN;
}

// Get system prompt by engine (Always English)
export function getSystemPromptByEngine(engine: EngineType, _lang: string): string {
    switch (engine) {
        case 'webllm':
            return getLiteSystemPrompt('en');
        case 'ollama':
            return getStandardSystemPrompt('en');
        case 'openai':
        default:
            return getDefaultSystemPrompt('en');
    }
}

// Ollama Default Config
export const OLLAMA_BASE_URL = 'http://localhost:11434';
export const OLLAMA_DETECT_TIMEOUT = 3000;

// Recommended Models
export interface RecommendedModel {
    name: string;
    taglineKey: string;
    size: string;
    sizeBytes: number;
    builtIn?: boolean;
}

// All Downloadable Models
export const ALL_MODELS: RecommendedModel[] = [
    {
        name: 'qwen2.5:0.5b',
        taglineKey: 'models.qwen05b',
        size: '290MB',
        sizeBytes: 397,
        builtIn: true
    },
    {
        name: 'gemma3:1b',
        taglineKey: 'models.gemma1b',
        size: '815MB',
        sizeBytes: 815
    },
    {
        name: 'qwen2.5:1.5b',
        taglineKey: 'models.qwen15b',
        size: '986MB',
        sizeBytes: 986
    },
    {
        name: 'llama3.2:1b',
        taglineKey: 'models.llama1b',
        size: '1.3GB',
        sizeBytes: 1300
    },
    {
        name: 'llama3.2:3b',
        taglineKey: 'models.llama3b',
        size: '2.0GB',
        sizeBytes: 2000
    },
    {
        name: 'phi3:mini',
        taglineKey: 'models.phi3mini',
        size: '2.3GB',
        sizeBytes: 2300
    },
    {
        name: 'gemma3:4b',
        taglineKey: 'models.gemma4b',
        size: '3.3GB',
        sizeBytes: 3300
    },
    {
        name: 'mistral:7b',
        taglineKey: 'models.mistral7b',
        size: '4.1GB',
        sizeBytes: 4100
    },
    {
        name: 'qwen2.5:7b',
        taglineKey: 'models.qwen7b',
        size: '4.7GB',
        sizeBytes: 4700
    },
    {
        name: 'gemma3:12b',
        taglineKey: 'models.gemma12b',
        size: '8.1GB',
        sizeBytes: 8100
    },
    {
        name: 'qwen2.5:14b',
        taglineKey: 'models.qwen14b',
        size: '9.0GB',
        sizeBytes: 9000
    },
];

// Compatibility exports
export const RECOMMENDED_MODELS = ALL_MODELS.slice(0, 5);
export const ADVANCED_MODELS = ALL_MODELS.slice(5);