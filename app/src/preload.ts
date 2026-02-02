import { contextBridge, ipcRenderer } from 'electron'

// Define the API exposed to the renderer
export interface VersionsAPI {
    node: () => string
    chrome: () => string
    electron: () => string
    ping: () => Promise<string>
}

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
} satisfies VersionsAPI)
