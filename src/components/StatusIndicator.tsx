/**
 * 状态指示器组件
 * 显示当前 AI 引擎状态和模型选择
 */

import React from 'react';
import { LLMProviderType, LLMStatus, OllamaModel, LoadProgress } from '../services/types';

interface StatusIndicatorProps {
    providerType: LLMProviderType;
    status: LLMStatus;
    modelName: string;
    ollamaModels: OllamaModel[];
    selectedModel: string;
    onModelChange: (model: string) => void;
    loadProgress: LoadProgress | null;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    providerType,
    status,
    modelName,
    ollamaModels,
    selectedModel,
    onModelChange,
    loadProgress
}) => {
    // 获取状态点的样式类
    const getDotClass = () => {
        if (status === 'loading' || status === 'detecting') return 'loading';
        if (status === 'error') return 'error';
        return providerType;
    };

    // 获取状态标签
    const getStatusLabel = () => {
        switch (status) {
            case 'detecting':
                return '正在探测 Ollama...';
            case 'loading':
                return '正在加载模型...';
            case 'error':
                return '引擎错误';
            case 'ready':
                return providerType === 'ollama' ? '🟢 本地核心' : '🔵 内置核心';
            default:
                return '准备中';
        }
    };

    // 格式化模型名称显示（更详细）
    const formatModelName = (name: string) => {
        // 简化 WebLLM 模型名
        if (name.includes('gemma-2-2b')) {
            return 'Gemma 2B';
        }
        if (name.includes('gemma')) {
            return name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1);
        }
        // Ollama 模型名: 保留完整名称以区分版本
        return name;
    };

    // 格式化模型大小
    const formatSize = (bytes: number) => {
        if (bytes >= 1e9) {
            return `${(bytes / 1e9).toFixed(1)}GB`;
        }
        return `${(bytes / 1e6).toFixed(0)}MB`;
    };

    return (
        <div className="status-indicator">
            <div className="status-info">
                <span className={`status-dot ${getDotClass()}`} />
                <span className="status-label">{getStatusLabel()}</span>

                {status === 'ready' && (
                    <span className="status-model">
                        {providerType === 'ollama' && ollamaModels.length > 0 ? (
                            <div className="model-selector">
                                <select
                                    value={selectedModel}
                                    onChange={(e) => onModelChange(e.target.value)}
                                >
                                    {ollamaModels.map((model) => (
                                        <option key={model.name} value={model.name}>
                                            {formatModelName(model.name)} ({formatSize(model.size)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            formatModelName(modelName)
                        )}
                    </span>
                )}
            </div>

            {/* 加载进度 */}
            {status === 'loading' && loadProgress && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {loadProgress.progress}%
                </div>
            )}
        </div>
    );
};

export default StatusIndicator;

