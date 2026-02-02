import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

const createWindow = (): void => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false
        }
    })
    win.loadFile(path.join(__dirname, '../index.html'))
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')

    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
