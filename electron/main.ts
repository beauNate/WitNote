import { app, BrowserWindow } from 'electron'
import { join } from 'path'

// 禁用 GPU 沙箱以支持 WebGPU (WebLLM 需要)
app.commandLine.appendSwitch('enable-features', 'Vulkan')
app.commandLine.appendSwitch('use-vulkan')
app.commandLine.appendSwitch('enable-unsafe-webgpu')

// 开发服务器 URL (由 vite-plugin-electron 注入)
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,

        // macOS 原生视觉效果
        vibrancy: 'sidebar',
        visualEffectState: 'active',
        transparent: true,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 20, y: 18 },

        // 窗口圆角
        frame: false,
        hasShadow: true,

        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            // 启用 WebGPU
            experimentalFeatures: true
        }
    })

    // 开发模式连接 Vite 开发服务器
    if (VITE_DEV_SERVER_URL) {
        console.log('🔗 开发模式: 连接到', VITE_DEV_SERVER_URL)
        mainWindow.loadURL(VITE_DEV_SERVER_URL)
        mainWindow.webContents.openDevTools()
    } else {
        console.log('📦 生产模式: 加载本地文件')
        mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    // 打开 DevTools 后打印调试信息
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ 页面加载完成')
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 输出调试信息
console.log('🧘 禅意笔记本启动中...')
console.log('📊 VITE_DEV_SERVER_URL:', VITE_DEV_SERVER_URL || '未设置 (生产模式)')

