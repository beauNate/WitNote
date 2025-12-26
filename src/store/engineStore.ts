/**
 * Engine Store - 双引擎状态管理
 * 管理 Ollama, Cloud API 两种引擎的状态
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { OpenAIEngine, CloudConfig, DEFAULT_CLOUD_CONFIG } from '../engines/OpenAIEngine';
import { OllamaModel } from '../services/types';

export type EngineType = 'ollama' | 'openai';

export interface OllamaConfig {
    host: string;
    port: number;
}

export interface EngineState {
    currentEngine: EngineType;
    selectedModel: string;

    // Ollama 状态
    ollamaAvailable: boolean;
    ollamaConfig: OllamaConfig;
    ollamaModels: OllamaModel[];

    // Cloud API 状态
    cloudConfig: CloudConfig;
    cloudApiStatus: 'untested' | 'success' | 'error';

    // 通用
    isLoading: boolean;
    error: string | null;
}

export interface UseEngineStoreReturn extends EngineState {
    setEngine: (engine: EngineType) => void;
    selectModel: (modelId: string) => void;

    // Ollama
    updateOllamaConfig: (config: Partial<OllamaConfig>) => void;
    refreshOllamaStatus: () => Promise<void>;

    // Cloud API
    updateCloudConfig: (config: Partial<CloudConfig>) => void;
    testCloudApi: () => Promise<boolean>;

    // 引擎访问
    getEngine: () => any;

    // 错误报告
    reportError: (error: string) => void;
}

const STORAGE_KEYS = {
    ENGINE: 'zen-ai-engine',
    MODEL: 'zen-selected-model',
    OLLAMA_MODEL: 'zen-selected-ollama-model',
    OLLAMA: 'zen-ollama-config',
    CLOUD: 'zen-cloud-config'
};

export function useEngineStore(): UseEngineStoreReturn {
    // 从 localStorage 恢复配置（默认使用 Ollama）
    // 如果之前保存的是 webllm，强制转为 ollama
    let savedEngine = (localStorage.getItem(STORAGE_KEYS.ENGINE) as EngineType) || 'ollama';
    if (savedEngine === 'webllm' as any) {
        savedEngine = 'ollama';
    }

    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL) || '';
    const savedOllamaConfig: OllamaConfig = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.OLLAMA) || '{"host":"127.0.0.1","port":11434}'
    );
    const savedCloudConfig: CloudConfig = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLOUD) || JSON.stringify(DEFAULT_CLOUD_CONFIG)
    );

    const [state, setState] = useState<EngineState>({
        currentEngine: savedEngine,
        selectedModel: savedModel,
        ollamaAvailable: false,
        ollamaConfig: savedOllamaConfig,
        ollamaModels: [],
        cloudConfig: savedCloudConfig,
        cloudApiStatus: 'untested',
        isLoading: true,
        error: null
    });

    // 引擎实例引用
    const openaiEngineRef = useRef<OpenAIEngine | null>(null);

    // 设置引擎
    const setEngine = useCallback((engine: EngineType) => {
        localStorage.setItem(STORAGE_KEYS.ENGINE, engine);

        // 切换引擎时，恢复该引擎上次使用的模型
        let modelToRestore = '';
        if (engine === 'ollama') {
            // 如果只有 null，可以保留当前选中（但风险是当前选中可能是 webllm 的），或者用第一个 found model
            modelToRestore = localStorage.getItem(STORAGE_KEYS.OLLAMA_MODEL) || '';
        } else if (engine === 'openai') {
            modelToRestore = state.cloudConfig.modelName;
        }

        setState(prev => ({
            ...prev,
            currentEngine: engine,
            selectedModel: modelToRestore,
            error: null
        }));
    }, [state.cloudConfig.modelName]);

    // 选择模型
    const selectModel = useCallback((modelId: string) => {
        localStorage.setItem(STORAGE_KEYS.MODEL, modelId);

        // 分别存储引擎的模型选择
        if (state.currentEngine === 'ollama') {
            localStorage.setItem(STORAGE_KEYS.OLLAMA_MODEL, modelId);
        }

        setState(prev => ({ ...prev, selectedModel: modelId }));
    }, [state.currentEngine]);

    // 更新 Ollama 配置
    const updateOllamaConfig = useCallback((config: Partial<OllamaConfig>) => {
        setState(prev => {
            const newConfig = { ...prev.ollamaConfig, ...config };
            localStorage.setItem(STORAGE_KEYS.OLLAMA, JSON.stringify(newConfig));
            return { ...prev, ollamaConfig: newConfig };
        });
    }, []);

    // 刷新 Ollama 状态
    const refreshOllamaStatus = useCallback(async () => {
        const { host, port } = state.ollamaConfig;
        const baseUrl = `http://${host}:${port}`;

        try {
            const response = await fetch(`${baseUrl}/api/tags`, {
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                const models = data.models || [];
                setState(prev => ({
                    ...prev,
                    ollamaAvailable: true,
                    ollamaModels: models.map((m: any) => ({
                        name: m.name,
                        size: m.size || 0,
                        digest: m.digest,
                        modified_at: m.modified_at,
                        formattedSize: formatSize(m.size)
                    }))
                }));
            } else {
                setState(prev => ({ ...prev, ollamaAvailable: false, ollamaModels: [] }));
            }
        } catch {
            setState(prev => ({ ...prev, ollamaAvailable: false, ollamaModels: [] }));
        }
    }, [state.ollamaConfig]);

    // Ollama 配置改变时自动刷新状态
    useEffect(() => {
        if (state.currentEngine === 'ollama') {
            refreshOllamaStatus();
        }
    }, [state.ollamaConfig.host, state.ollamaConfig.port]);

    // 更新 Cloud 配置
    const updateCloudConfig = useCallback((config: Partial<CloudConfig>) => {
        setState(prev => {
            const newConfig = { ...prev.cloudConfig, ...config };
            localStorage.setItem(STORAGE_KEYS.CLOUD, JSON.stringify(newConfig));

            // 更新引擎实例
            if (openaiEngineRef.current) {
                openaiEngineRef.current.updateConfig(newConfig);
            }

            return { ...prev, cloudConfig: newConfig, cloudApiStatus: 'untested' };
        });
    }, []);

    // 测试 Cloud API
    const testCloudApi = useCallback(async () => {
        if (!openaiEngineRef.current) {
            openaiEngineRef.current = new OpenAIEngine(state.cloudConfig);
        }

        const result = await openaiEngineRef.current.testConnection();
        setState(prev => ({
            ...prev,
            cloudApiStatus: result ? 'success' : 'error'
        }));
        return result;
    }, [state.cloudConfig]);

    // 获取当前引擎实例
    const getEngine = useCallback(() => {
        switch (state.currentEngine) {
            case 'openai':
                if (!openaiEngineRef.current) {
                    openaiEngineRef.current = new OpenAIEngine(state.cloudConfig);
                }
                return openaiEngineRef.current;
            default:
                return null;
        }
    }, [state.currentEngine, state.cloudConfig]);

    // 报告错误
    const reportError = useCallback((errorMessage: string) => {
        setState(prev => ({
            ...prev,
            error: errorMessage
        }));
    }, []);

    // 初始化
    useEffect(() => {
        const init = async () => {
            await refreshOllamaStatus();
            setState(prev => ({ ...prev, isLoading: false }));
        };
        init();
    }, []);

    // 引擎切换时自动初始化
    useEffect(() => {
        const initEngine = async () => {
            switch (state.currentEngine) {
                case 'ollama':
                    // Ollama: 刷新状态（已在初始化时完成）
                    break;
                case 'openai':
                    // Cloud API: 创建引擎实例
                    if (!openaiEngineRef.current && state.cloudConfig.apiKey) {
                        try {
                            openaiEngineRef.current = new OpenAIEngine(state.cloudConfig);
                            console.log('✅ Cloud API 引擎已创建');
                        } catch (error) {
                            console.error('❌ Cloud API 引擎创建失败:', error);
                        }
                    }
                    break;
            }
        };
        initEngine();
    }, [state.currentEngine, state.selectedModel, state.cloudConfig.apiKey]);

    return {
        ...state,
        setEngine,
        selectModel,
        updateOllamaConfig,
        refreshOllamaStatus,
        updateCloudConfig,
        testCloudApi,
        getEngine,
        reportError
    };
}

// 辅助函数
function formatSize(bytes: number): string {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
}
