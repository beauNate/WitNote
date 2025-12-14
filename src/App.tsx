/**
 * 主应用组件
 * Phase 8: 可调整三栏布局 + 增强画廊
 */

import React, { useEffect, useState, useMemo } from 'react'
import {
    Panel,
    PanelGroup,
    PanelResizeHandle
} from 'react-resizable-panels'
import {
    FolderPlus,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    ArrowUpDown,
    Filter
} from 'lucide-react'
import Onboarding from './components/Onboarding'
import FileTree, { ColorKey } from './components/FileTree'
import Editor from './components/Editor'
import ChatPanel from './components/ChatPanel'
import InputDialog from './components/InputDialog'
import { ToastProvider, useToast } from './components/Toast'
import { useFileSystem, FileNode } from './hooks/useFileSystem'
import { useLLM } from './hooks/useLLM'
import './styles/index.css'

// 颜色配置
const COLORS: { key: ColorKey; hex: string; name: string }[] = [
    { key: 'none', hex: 'transparent', name: '无' },
    { key: 'red', hex: '#ff453a', name: '红' },
    { key: 'orange', hex: '#ff9500', name: '橙' },
    { key: 'yellow', hex: '#ffcc00', name: '黄' },
    { key: 'green', hex: '#30d158', name: '绿' },
    { key: 'blue', hex: '#007aff', name: '蓝' },
    { key: 'purple', hex: '#bf5af2', name: '紫' },
    { key: 'gray', hex: '#8e8e93', name: '灰' },
]

// 排序选项
type SortOption = 'name-asc' | 'name-desc' | 'time-asc' | 'time-desc'

// 生成文件名
const generateFileName = (): string => {
    const now = new Date()
    const timestamp = `${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}${now.getMinutes()}`
    return `Untitled_${timestamp}.txt`
}

const AppContent: React.FC = () => {
    const fileSystem = useFileSystem()
    const llm = useLLM()
    const { showToast } = useToast()

    // 面板状态
    const [leftCollapsed, setLeftCollapsed] = useState(false)
    const [rightCollapsed, setRightCollapsed] = useState(false)

    // 对话框状态
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [renameTarget, setRenameTarget] = useState<FileNode | null>(null)

    // 颜色系统
    const [colors, setColors] = useState<Record<string, ColorKey>>({})

    // 排序和筛选
    const [sortBy, setSortBy] = useState<SortOption>('name-asc')
    const [filterColor, setFilterColor] = useState<ColorKey | 'all'>('all')
    const [showSortMenu, setShowSortMenu] = useState(false)
    const [showFilterMenu, setShowFilterMenu] = useState(false)

    // 文件预览缓存
    const [previews, setPreviews] = useState<Record<string, string>>({})

    // 画廊右键菜单
    const [galleryMenu, setGalleryMenu] = useState<{
        show: boolean
        x: number
        y: number
        node: FileNode | null
    }>({ show: false, x: 0, y: 0, node: null })

    const {
        vaultPath,
        isInitialized,
        fileTree,
        activeFile,
        activeFolder,
        fileContent,
        selectVault,
        openFile,
        setFileContent,
        toggleFileFormat,
        createNewFile,
        createNewFolder,
        renameItem,
        deleteFile,
    } = fileSystem

    // 引擎切换
    useEffect(() => {
        llm.onEngineChange((event) => {
            if (event.reason === 'heartbeat') {
                showToast(
                    event.to === 'ollama' ? 'success' : 'info',
                    event.to === 'ollama' ? '🟢 Ollama 已连接' : '🔵 使用内置模型'
                )
            }
        })
    }, [llm, showToast])

    // 上下文同步
    useEffect(() => {
        if (activeFile) {
            llm.loadChatHistory(activeFile.path)
            llm.setActiveFileContext(activeFile.path, activeFile.name, fileContent)
        } else if (activeFolder) {
            const files = activeFolder.children?.filter(c => !c.isDirectory).map(c => c.name) || []
            llm.setActiveFolderContext(activeFolder.name, files)
        } else {
            llm.setActiveFileContext(null, null, null)
        }
    }, [activeFile?.path, activeFolder?.path])

    useEffect(() => {
        if (activeFile) {
            llm.setActiveFileContext(activeFile.path, activeFile.name, fileContent)
        }
    }, [fileContent])

    // 加载文件预览
    useEffect(() => {
        const loadPreviews = async () => {
            const files = getCurrentFolderFiles()
            for (const file of files) {
                if (!previews[file.path] && window.fs) {
                    try {
                        const content = await window.fs.readFile(file.path.replace(vaultPath + '/', ''))
                        setPreviews(prev => ({
                            ...prev,
                            [file.path]: content.slice(0, 100)
                        }))
                    } catch {
                        // 忽略错误
                    }
                }
            }
        }
        if (vaultPath) loadPreviews()
    }, [activeFolder, fileTree, vaultPath])

    // 关闭菜单
    useEffect(() => {
        const close = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.dropdown-menu') && !target.closest('.gallery-menu')) {
                setShowSortMenu(false)
                setShowFilterMenu(false)
                setGalleryMenu(prev => ({ ...prev, show: false }))
            }
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    // 颜色系统
    const getColor = (path: string): ColorKey => colors[path] || 'none'
    const setColor = (path: string, color: ColorKey) => {
        setColors(prev => {
            const next = { ...prev }
            if (color === 'none') delete next[path]
            else next[path] = color
            return next
        })
    }

    // 获取当前文件夹的文件
    const getCurrentFolderFiles = (): FileNode[] => {
        if (activeFolder) {
            return activeFolder.children?.filter(c => !c.isDirectory) || []
        }
        return fileTree.filter(n => !n.isDirectory)
    }

    // 排序和筛选后的文件
    const sortedFilteredFiles = useMemo(() => {
        let files = getCurrentFolderFiles()

        // 颜色筛选
        if (filterColor !== 'all') {
            files = files.filter(f => getColor(f.path) === filterColor)
        }

        // 排序
        files.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name)
                case 'name-desc':
                    return b.name.localeCompare(a.name)
                case 'time-asc':
                    return (a.name).localeCompare(b.name) // 暂用名称代替时间
                case 'time-desc':
                    return (b.name).localeCompare(a.name)
                default:
                    return 0
            }
        })

        return files
    }, [activeFolder, fileTree, sortBy, filterColor, colors])

    // 加载中
    if (!isInitialized) {
        return (
            <div className="app-loading">
                <div className="loading-spinner">🧘</div>
                <p>正在初始化...</p>
            </div>
        )
    }

    if (!vaultPath) {
        return <Onboarding onSelectVault={selectVault} />
    }

    // Handlers
    const handleCreateFolder = async (name: string) => {
        await createNewFolder(name)
        setShowNewFolderDialog(false)
    }

    const handleQuickCreate = async () => {
        const fileName = generateFileName()
        await createNewFile(fileName)
    }

    const handleRename = async (newName: string) => {
        if (renameTarget) {
            await renameItem(renameTarget.path, newName)
            setShowRenameDialog(false)
            setRenameTarget(null)
        }
    }

    const handleDelete = async (node: FileNode) => {
        if (confirm(`删除 "${node.name}"?`)) {
            await deleteFile(node.path)
        }
    }

    const handleTitleChange = async (newFileName: string) => {
        if (activeFile && newFileName !== activeFile.name) {
            await renameItem(activeFile.path, newFileName)
        }
    }

    // 画廊右键菜单
    const handleCardContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault()
        setGalleryMenu({ show: true, x: e.clientX, y: e.clientY, node })
    }

    const handleGalleryAction = (action: 'open' | 'rename' | 'delete') => {
        const node = galleryMenu.node
        setGalleryMenu({ show: false, x: 0, y: 0, node: null })
        if (node) {
            if (action === 'open') openFile(node)
            else if (action === 'rename') {
                setRenameTarget(node)
                setShowRenameDialog(true)
            }
            else if (action === 'delete') handleDelete(node)
        }
    }

    const handleGalleryColor = (color: ColorKey) => {
        if (galleryMenu.node) {
            setColor(galleryMenu.node.path, color)
        }
        setGalleryMenu({ show: false, x: 0, y: 0, node: null })
    }

    // 颜色边框样式
    const getCardStyle = (path: string) => {
        const color = getColor(path)
        const c = COLORS.find(x => x.key === color)
        if (!c || color === 'none') return { border: 'rgba(0,0,0,0.08)', bg: 'transparent' }
        return { border: c.hex, bg: `${c.hex}10` }
    }

    return (
        <div className="app-root">
            <div className="titlebar-drag-region" />

            {/* 对话框 */}
            <InputDialog
                isOpen={showNewFolderDialog}
                title="新建文件夹"
                placeholder="名称"
                onConfirm={handleCreateFolder}
                onCancel={() => setShowNewFolderDialog(false)}
            />
            <InputDialog
                isOpen={showRenameDialog}
                title="重命名"
                placeholder="新名称"
                defaultValue={renameTarget?.name || ''}
                onConfirm={handleRename}
                onCancel={() => { setShowRenameDialog(false); setRenameTarget(null) }}
            />

            {/* 可调整三栏布局 */}
            <PanelGroup direction="horizontal" className="panel-group">
                {/* 左侧边栏 */}
                {!leftCollapsed && (
                    <>
                        <Panel defaultSize={20} minSize={15} maxSize={35} className="panel-sidebar">
                            <div className="sidebar-inner">
                                <div className="sidebar-header">
                                    <span className="sidebar-title">文件</span>
                                    <button
                                        className="sidebar-btn"
                                        onClick={() => setShowNewFolderDialog(true)}
                                    >
                                        <FolderPlus size={16} strokeWidth={1.5} />
                                    </button>
                                </div>

                                <div className="sidebar-content">
                                    {fileTree.length === 0 ? (
                                        <div className="sidebar-empty">空</div>
                                    ) : (
                                        <FileTree
                                            nodes={fileTree}
                                            activeFilePath={activeFile?.path || activeFolder?.path || null}
                                            onFileSelect={openFile}
                                            onRename={(node) => {
                                                setRenameTarget(node)
                                                setShowRenameDialog(true)
                                            }}
                                            onDelete={handleDelete}
                                            getColor={getColor}
                                            onColorChange={setColor}
                                        />
                                    )}
                                </div>
                            </div>
                        </Panel>
                        <PanelResizeHandle className="resize-handle" />
                    </>
                )}

                {/* 中间内容区 */}
                <Panel defaultSize={leftCollapsed && rightCollapsed ? 100 : 50} minSize={30} className="panel-main">
                    <div className="main-inner">
                        {/* 折叠按钮 */}
                        <div className="panel-toggles">
                            <button
                                className="panel-toggle left"
                                onClick={() => setLeftCollapsed(!leftCollapsed)}
                                title={leftCollapsed ? '展开左侧' : '折叠左侧'}
                            >
                                {leftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                            </button>
                            <button
                                className="panel-toggle right"
                                onClick={() => setRightCollapsed(!rightCollapsed)}
                                title={rightCollapsed ? '展开右侧' : '折叠右侧'}
                            >
                                {rightCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                            </button>
                        </div>

                        {activeFile ? (
                            <Editor
                                content={fileContent}
                                onChange={setFileContent}
                                fileName={activeFile.name}
                                fileExtension={activeFile.extension || 'txt'}
                                onTitleChange={handleTitleChange}
                                onFormatToggle={toggleFileFormat}
                                onNewFile={handleQuickCreate}
                            />
                        ) : (
                            /* 画廊视图 */
                            <div className="gallery-view">
                                {/* 画廊头部 */}
                                <div className="gallery-header">
                                    <h2 className="gallery-title">
                                        {activeFolder ? activeFolder.name : '所有文件'}
                                    </h2>

                                    <div className="gallery-actions">
                                        {/* 排序 */}
                                        <div className="dropdown">
                                            <button
                                                className="action-btn"
                                                onClick={() => setShowSortMenu(!showSortMenu)}
                                            >
                                                <ArrowUpDown size={16} strokeWidth={1.5} />
                                            </button>
                                            {showSortMenu && (
                                                <div className="dropdown-menu">
                                                    <button onClick={() => { setSortBy('name-asc'); setShowSortMenu(false) }}>
                                                        名称 A-Z
                                                    </button>
                                                    <button onClick={() => { setSortBy('name-desc'); setShowSortMenu(false) }}>
                                                        名称 Z-A
                                                    </button>
                                                    <button onClick={() => { setSortBy('time-desc'); setShowSortMenu(false) }}>
                                                        最新优先
                                                    </button>
                                                    <button onClick={() => { setSortBy('time-asc'); setShowSortMenu(false) }}>
                                                        最早优先
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* 颜色筛选 */}
                                        <div className="dropdown">
                                            <button
                                                className="action-btn"
                                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                            >
                                                <Filter size={16} strokeWidth={1.5} />
                                            </button>
                                            {showFilterMenu && (
                                                <div className="dropdown-menu filter-menu">
                                                    <button onClick={() => { setFilterColor('all'); setShowFilterMenu(false) }}>
                                                        全部
                                                    </button>
                                                    <div className="color-filter-dots">
                                                        {COLORS.filter(c => c.key !== 'none').map(c => (
                                                            <button
                                                                key={c.key}
                                                                className="color-dot-btn"
                                                                style={{ background: c.hex }}
                                                                onClick={() => { setFilterColor(c.key); setShowFilterMenu(false) }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 新建按钮 */}
                                        <button className="action-btn primary" onClick={handleQuickCreate}>
                                            <Plus size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                {/* 文件网格 */}
                                <div className="gallery-grid-square">
                                    {sortedFilteredFiles.length === 0 ? (
                                        <div className="gallery-empty-clean">
                                            <button className="empty-create-btn" onClick={handleQuickCreate}>
                                                <Plus size={24} strokeWidth={1.2} />
                                            </button>
                                        </div>
                                    ) : (
                                        sortedFilteredFiles.map(file => {
                                            const style = getCardStyle(file.path)
                                            const preview = previews[file.path] || ''
                                            return (
                                                <div
                                                    key={file.path}
                                                    className="file-card-square"
                                                    onClick={() => openFile(file)}
                                                    onContextMenu={(e) => handleCardContextMenu(e, file)}
                                                    style={{
                                                        borderColor: style.border,
                                                        background: style.bg
                                                    }}
                                                >
                                                    <div className="card-title">
                                                        {file.name.replace(/\.[^/.]+$/, '')}
                                                    </div>
                                                    <div className="card-summary">
                                                        {preview || '...'}
                                                    </div>
                                                    <div className="card-date">
                                                        {new Date().toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* 右侧 AI 面板 */}
                {!rightCollapsed && (
                    <>
                        <PanelResizeHandle className="resize-handle" />
                        <Panel defaultSize={30} minSize={20} maxSize={45} className="panel-chat">
                            <ChatPanel llm={llm} />
                        </Panel>
                    </>
                )}
            </PanelGroup>

            {/* 画廊右键菜单 */}
            {galleryMenu.show && galleryMenu.node && (
                <div
                    className="gallery-menu context-menu"
                    style={{ position: 'fixed', left: galleryMenu.x, top: galleryMenu.y }}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <button onClick={() => handleGalleryAction('open')}>打开</button>
                    <button onClick={() => handleGalleryAction('rename')}>重命名</button>
                    <div className="color-dots">
                        {COLORS.map(c => (
                            <button
                                key={c.key}
                                className="color-dot"
                                style={{
                                    background: c.key === 'none' ? '#e5e5e5' : c.hex,
                                    border: c.key === 'none' ? '1px dashed #ccc' : 'none'
                                }}
                                onClick={() => handleGalleryColor(c.key)}
                                title={c.name}
                            />
                        ))}
                    </div>
                    <div className="menu-divider" />
                    <button className="danger" onClick={() => handleGalleryAction('delete')}>删除</button>
                </div>
            )}
        </div>
    )
}

export const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
)

export default App
