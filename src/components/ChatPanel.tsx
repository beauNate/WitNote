import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Send, Square, Sparkles, Check } from 'lucide-react'
import { ChatMessage } from '../services/types'
import { UseLLMReturn } from '../hooks/useLLM'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import DOMPurify from 'dompurify'
import '../styles/chat-markdown.css'

// 配置 marked
marked.setOptions({
    gfm: true,
    breaks: true
})

// 渲染 LaTeX 公式
const renderLatex = (html: string): string => {
    const codeBlocks: string[] = []
    html = html.replace(/(<code[^>]*>[\s\S]*?<\/code>)|(<pre[^>]*>[\s\S]*?<\/pre>)/gi, (match) => {
        codeBlocks.push(match)
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`
    })

    html = html.replace(/\$\$([^$]+)\$\$/g, (_, formula) => {
        try {
            return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
        } catch {
            return formula
        }
    })

    html = html.replace(/\$([^$\n]+)\$/g, (_, formula) => {
        try {
            return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
        } catch {
            return formula
        }
    })

    html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
        return codeBlocks[parseInt(index)]
    })

    return html
}

interface ChatPanelProps {
    llm: UseLLMReturn
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ llm }) => {
    const { t } = useTranslation()

    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const {
        status,
        modelName,
        loadProgress,
        ollamaModels,
        selectedOllamaModel,
        setSelectedOllamaModel,
        messages,
        isGenerating,
        sendMessage,
        abortGeneration,
        retryDetection
    } = llm

    const [showModelMenu, setShowModelMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // 点击外部关闭模型菜单
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowModelMenu(false)
            }
        }
        if (showModelMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showModelMenu])

    // 滚动到底部
    const streamingContent = messages.find(m => m.isStreaming)?.content || ''
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    }, [messages, streamingContent])

    const handleSend = async () => {
        if (!inputValue.trim() || isGenerating || status !== 'ready') return
        const message = inputValue
        setInputValue('')
        if (inputRef.current) {
            inputRef.current.style.height = '20px'
        }
        await sendMessage(message)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
        const textarea = e.target
        textarea.style.height = '20px'
        const newHeight = Math.min(Math.max(textarea.scrollHeight, 20), 100)
        textarea.style.height = `${newHeight}px`
    }

    const formatModelName = (name: string) => {
        const base = name.split(':')[0]
        return base.charAt(0).toUpperCase() + base.slice(1)
    }

    return (
        <div className="chat-panel-v2">
            {/* 消息区域 */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <Sparkles size={32} strokeWidth={1.2} />
                        <p>{t('chat.title')}</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                        {isGenerating && !messages.some(m => m.isStreaming) && (
                            <div className="chat-bubble assistant">
                                <div className="bubble-content typing-indicator">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 底部区域 */}
            <div className="chat-footer">
                {/* 状态栏 */}
                <div className="chat-status-bar">
                    <div className="chat-model-info">
                        <div className={`ai-status-indicator ${isGenerating || status === 'loading' ? 'active' : 'idle'}`}>
                            <span className="indicator-dot"></span>
                            <span className="indicator-glow"></span>
                        </div>
                        {status === 'ready' ? (
                            isGenerating ? (
                                <span className="model-label thinking">{t('chat.thinking')}</span>
                            ) : ollamaModels.length >= 1 ? (
                                <div className="webllm-model-selector" ref={menuRef}>
                                    <button
                                        className="model-label clickable"
                                        onClick={() => setShowModelMenu(!showModelMenu)}
                                    >
                                        {formatModelName(selectedOllamaModel || modelName)}
                                    </button>
                                    {showModelMenu && createPortal(
                                        <div className="model-dropdown" ref={menuRef}>
                                            <div className="model-dropdown-header">
                                                <span className="header-icon">🤖</span>
                                                <span>{t('chat.ollamaConnected')}</span>
                                            </div>
                                            {ollamaModels.map((model) => {
                                                const isCurrentModel = model.name === selectedOllamaModel
                                                return (
                                                    <div
                                                        key={model.name}
                                                        className={`model-item ${isCurrentModel ? 'active' : ''}`}
                                                    >
                                                        <div className="model-item-row">
                                                            <div className="model-item-left">
                                                                <span className="model-item-name">{formatModelName(model.name)}</span>
                                                                {model.formattedSize && (
                                                                    <span className="model-item-size">{model.formattedSize}</span>
                                                                )}
                                                            </div>
                                                            <div className="model-item-right">
                                                                {isCurrentModel ? (
                                                                    <span className="model-tag active">
                                                                        <Check size={10} /> {t('chat.inUse')}
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        className="model-use-btn"
                                                                        onClick={() => {
                                                                            setSelectedOllamaModel(model.name)
                                                                            setShowModelMenu(false)
                                                                        }}
                                                                    >
                                                                        <span className="btn-default">{t('chat.downloaded')}</span>
                                                                        <span className="btn-hover">{t('chat.use')}</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            ) : (
                                <span className="model-label">{formatModelName(modelName)}</span>
                            )
                        ) : status === 'loading' ? (
                            <div className="model-loading-status">
                                <span className="loading-text">
                                    {loadProgress ? `${t('chat.loadingModel')} ${loadProgress.progress}%` : t('chat.loading')}
                                </span>
                                {loadProgress && (
                                    <div className="loading-progress-bar">
                                        <div
                                            className="loading-progress-fill"
                                            style={{ width: `${loadProgress.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : status === 'error' ? (
                            <button className="retry-btn" onClick={retryDetection}>
                                {t('chat.retry')}
                            </button>
                        ) : (
                            <span className="model-label">{t('chat.detecting')}</span>
                        )}
                    </div>
                </div>

                {/* 输入框 */}
                <div className="chat-input-wrapper">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={status === 'ready' ? t('chat.placeholder') : t('chat.waitingReady')}
                        disabled={status !== 'ready'}
                        rows={1}
                    />

                    {isGenerating ? (
                        <button className="send-btn stop" onClick={abortGeneration}>
                            <Square size={14} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || status !== 'ready'}
                        >
                            <Send size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}


const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const rawHtml = message.role === 'user'
        ? message.content.replace(/\n/g, '<br/>')
        : renderLatex(marked(message.content) as string)

    const sanitizedHtml = DOMPurify.sanitize(rawHtml)

    return (
        <div className={`chat-bubble ${message.role}`}>
            <div
                className={`bubble-content markdown-body ${message.isStreaming ? 'streaming' : ''}`}
            >
                <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                {message.isStreaming && <span className="typing-cursor" />}
            </div>
        </div>
    )
}

export default ChatPanel
