import React from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
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
    const { t } = useTranslation()

    // 获取状态文字（多语言支持）
    const getStatusText = () => {
        switch (status) {
            case 'detecting':
                return t('chat.detecting')
            case 'loading':
                if (loadProgress) {
                    if (loadProgress.stage === 'downloading') {
                        return `${t('chat.downloading')} ${loadProgress.progress}%`
                    } else if (loadProgress.stage === 'init') {
                        return t('chat.initializing')
                    } else {
                        return `${t('chat.loadingModel')} ${loadProgress.progress}%`
                    }
                }
                return t('chat.loading')
            case 'error':
                return t('chat.error')
            case 'ready':
                return providerType === 'ollama' ? '已接入 Ollama' : '使用内置模型'
            default:
                return '准备中'
        }
    }

    // 状态灯颜色
    const getStatusClass = () => {
        if (status === 'loading' || status === 'detecting') return 'status-loading'
        if (status === 'error') return 'status-error'
        return providerType === 'ollama' ? 'status-ollama' : 'status-webllm'
    }

    // 简化模型名
    const formatModelName = (name: string) => {
        const base = name.split(':')[0]
        return base.charAt(0).toUpperCase() + base.slice(1)
    }

    return (
        <div className="ai-status-bar">
            {/* 图标 */}
            <div className="ai-icon">
                <Sparkles size={16} strokeWidth={1.5} />
            </div>

            {/* 状态灯 + 文字 */}
            <div className="status-badge">
                <span className={`status-light ${getStatusClass()}`} />
                <span className="status-text">{getStatusText()}</span>
            </div>

            {/* 分隔符 */}
            {status === 'ready' && <span className="status-divider">·</span>}

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
