/**
 * Medium 风格编辑器
 * 极致简洁：透明背景、无边框、Typography-centric
 */

import React, { useRef, useEffect, useState } from 'react'
import { FileText, FileCode } from 'lucide-react'

interface EditorProps {
    content: string
    onChange: (content: string) => void
    fileName: string
    fileExtension: string
    onTitleChange?: (newName: string) => void
    onFormatToggle?: () => void
    placeholder?: string
}

export const Editor: React.FC<EditorProps> = ({
    content,
    onChange,
    fileName,
    fileExtension,
    onTitleChange,
    onFormatToggle,
    placeholder = '写下你的想法...'
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [title, setTitle] = useState('')

    // 从文件名提取标题 (去掉扩展名)
    useEffect(() => {
        const baseName = fileName.replace(/\.[^/.]+$/, '')
        setTitle(baseName)
    }, [fileName])

    // 自动调整 textarea 高度
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }, [content])

    // 处理标题变化
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }

    // 标题失焦时保存
    const handleTitleBlur = () => {
        if (onTitleChange && title.trim()) {
            const newFileName = `${title.trim()}.${fileExtension}`
            if (newFileName !== fileName) {
                onTitleChange(newFileName)
            }
        }
    }

    // 标题回车时失焦
    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
                ; (e.target as HTMLInputElement).blur()
            textareaRef.current?.focus()
        }
    }

    // 判断是否为 Markdown
    const isMarkdown = fileExtension === 'md' || fileExtension === '.md'

    return (
        <div className="medium-editor">
            {/* 顶部工具栏 */}
            <div className="editor-top-bar">
                <div className="editor-file-icon">
                    {isMarkdown ? (
                        <FileCode size={16} strokeWidth={1.5} />
                    ) : (
                        <FileText size={16} strokeWidth={1.5} />
                    )}
                </div>

                <button
                    className="format-toggle"
                    onClick={onFormatToggle}
                    title="切换格式"
                >
                    {isMarkdown ? 'MD' : 'TXT'}
                </button>
            </div>

            {/* 标题输入 */}
            <input
                type="text"
                className="editor-title"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                placeholder="标题"
                spellCheck={false}
            />

            {/* 正文输入 */}
            <textarea
                ref={textareaRef}
                className="editor-body"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    )
}

export default Editor
