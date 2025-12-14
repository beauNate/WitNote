/**
 * 状态指示器组件
 * 极简设计：状态灯 + 模型选择器
 */

import React from 'react'
import { Circle } from 'lucide-react'
import { LLMProviderType, LLMStatus, OllamaModel, LoadProgress } from '../services/types'

interface StatusIndicatorProps {
    providerType: LLMProviderType
    status: LLMStatus
    modelName: string
    ollamaModels: OllamaModel[]
    selectedModel: string
    onModelChange: (model: string) => void
    loadProgress: LoadProgress | null
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
    // 获取状态文字
    const getStatusText = () => {
        switch (status) {
            case 'detecting':
                return '检测中...'
            case 'loading':
                return loadProgress ? `${loadProgress.progress}%` : '加载中...'
            case 'error':
                return '错误'
            case 'ready':
                return providerType === 'ollama' ? 'Local Core' : 'Built-in Core'
            default:
                return '准备中'
        }
    }

    // 获取状态颜色
    const getStatusColor = () => {
        if (status === 'loading' || status === 'detecting') return 'status-loading'
        if (status === 'error') return 'status-error'
        return providerType === 'ollama' ? 'status-ollama' : 'status-webllm'
    }

    // 简化模型名称
    const formatModelName = (name: string) => {
        const base = name.split(':')[0]
        return base.charAt(0).toUpperCase() + base.slice(1)
    }

    return (
        <div className="ai-status-bar">
            {/* 状态指示 */}
            <div className="status-badge">
                <span className={`status-light ${getStatusColor()}`}>
                    <Circle size={6} fill="currentColor" />
                </span>
                <span className="status-text">{getStatusText()}</span>
            </div>

            {/* 分隔符 */}
            <span className="status-divider">·</span>

            {/* 模型选择 */}
            {status === 'ready' && (
                <div className="model-select">
                    {providerType === 'ollama' && ollamaModels.length > 1 ? (
                        <select
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value)}
                        >
                            {ollamaModels.map((model) => (
                                <option key={model.name} value={model.name}>
                                    {formatModelName(model.name)}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span className="model-name">
                            {formatModelName(modelName)}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default StatusIndicator
