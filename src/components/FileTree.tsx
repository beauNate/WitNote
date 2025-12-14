/**
 * Finder 风格文件树
 * Apple Finder 布局：Chevron + Icon + Name + Count
 * 支持右键菜单和拖放
 */

import React, { useState, useRef } from 'react'
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    FileText,
    FileCode,
    MoreHorizontal
} from 'lucide-react'
import { FileNode } from '../hooks/useFileSystem'

interface FileTreeProps {
    nodes: FileNode[]
    activeFilePath: string | null
    onFileSelect: (node: FileNode) => void
    onRename?: (node: FileNode) => void
    onDelete?: (node: FileNode) => void
    level?: number
}

export const FileTree: React.FC<FileTreeProps> = ({
    nodes,
    activeFilePath,
    onFileSelect,
    onRename,
    onDelete,
    level = 0
}) => {
    return (
        <div className="finder-tree">
            {nodes.map((node) => (
                <FileTreeItem
                    key={node.path}
                    node={node}
                    activeFilePath={activeFilePath}
                    onFileSelect={onFileSelect}
                    onRename={onRename}
                    onDelete={onDelete}
                    level={level}
                />
            ))}
        </div>
    )
}

interface FileTreeItemProps {
    node: FileNode
    activeFilePath: string | null
    onFileSelect: (node: FileNode) => void
    onRename?: (node: FileNode) => void
    onDelete?: (node: FileNode) => void
    level: number
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
    node,
    activeFilePath,
    onFileSelect,
    onRename,
    onDelete,
    level
}) => {
    const [isExpanded, setIsExpanded] = useState(level < 1)
    const [showMenu, setShowMenu] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const itemRef = useRef<HTMLDivElement>(null)

    const isActive = activeFilePath === node.path
    const hasChildren = node.isDirectory && node.children && node.children.length > 0

    // 计算文件夹内文件数量
    const getFileCount = (): number => {
        if (!node.isDirectory || !node.children) return 0
        return node.children.filter(c => !c.isDirectory).length
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (node.isDirectory) {
            setIsExpanded(!isExpanded)
        }
        onFileSelect(node)
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setShowMenu(true)
    }

    const handleMenuAction = (action: 'rename' | 'delete') => {
        setShowMenu(false)
        if (action === 'rename' && onRename) {
            onRename(node)
        } else if (action === 'delete' && onDelete) {
            onDelete(node)
        }
    }

    // 关闭菜单
    React.useEffect(() => {
        const handleClickOutside = () => setShowMenu(false)
        if (showMenu) {
            document.addEventListener('click', handleClickOutside)
            return () => document.removeEventListener('click', handleClickOutside)
        }
    }, [showMenu])

    // 获取图标
    const getIcon = () => {
        if (node.isDirectory) {
            return isExpanded ? (
                <FolderOpen size={16} strokeWidth={1.5} />
            ) : (
                <Folder size={16} strokeWidth={1.5} />
            )
        }
        const ext = node.extension?.toLowerCase()
        if (ext === 'md' || ext === '.md') {
            return <FileCode size={16} strokeWidth={1.5} />
        }
        return <FileText size={16} strokeWidth={1.5} />
    }

    const fileCount = getFileCount()

    return (
        <div className="finder-tree-node">
            <div
                ref={itemRef}
                className={`finder-tree-item ${isActive ? 'active' : ''}`}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                style={{ paddingLeft: `${12 + level * 16}px` }}
            >
                {/* Chevron */}
                <span className={`finder-chevron ${!hasChildren ? 'invisible' : ''}`}>
                    {isExpanded ? (
                        <ChevronDown size={12} strokeWidth={2} />
                    ) : (
                        <ChevronRight size={12} strokeWidth={2} />
                    )}
                </span>

                {/* Icon */}
                <span className="finder-icon">{getIcon()}</span>

                {/* Name */}
                <span className="finder-name">{node.name}</span>

                {/* Spacer */}
                <span className="finder-spacer" />

                {/* Count (仅文件夹) */}
                {node.isDirectory && fileCount > 0 && (
                    <span className="finder-count">{fileCount}</span>
                )}

                {/* More button */}
                <button
                    className="finder-more"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleContextMenu(e)
                    }}
                >
                    <MoreHorizontal size={14} strokeWidth={1.5} />
                </button>
            </div>

            {/* 右键菜单 */}
            {showMenu && (
                <div
                    className="finder-context-menu"
                    style={{
                        position: 'fixed',
                        left: menuPosition.x,
                        top: menuPosition.y
                    }}
                >
                    <button onClick={() => handleMenuAction('rename')}>
                        重命名
                    </button>
                    <button onClick={() => handleMenuAction('delete')} className="danger">
                        删除
                    </button>
                </div>
            )}

            {/* 子节点 */}
            {node.isDirectory && isExpanded && node.children && (
                <FileTree
                    nodes={node.children}
                    activeFilePath={activeFilePath}
                    onFileSelect={onFileSelect}
                    onRename={onRename}
                    onDelete={onDelete}
                    level={level + 1}
                />
            )}
        </div>
    )
}

export default FileTree
