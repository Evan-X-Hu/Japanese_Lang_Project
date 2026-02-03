// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, shell } from 'electron'

// Define the API exposed to the renderer
export interface VersionsAPI {
    node: () => string,
    chrome: () => string,
    electron: () => string,
    ping: () => Promise<string>
}

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
} as VersionsAPI)

// Expose shell API for opening external links
contextBridge.exposeInMainWorld('electron', {
    shell: {
        openExternal: (url: string) => shell.openExternal(url)
    }
})
