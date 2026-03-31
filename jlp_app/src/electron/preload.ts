// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

// Define the API exposed to the renderer
export interface VersionsAPI {
    node: () => string,
    chrome: () => string,
    electron: () => string,
}

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
} as VersionsAPI)

// Expose shell API for opening external links
contextBridge.exposeInMainWorld('electron', {
    shell: {
        openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
    }
})

// Expose content CRUD API
contextBridge.exposeInMainWorld('content', {
    getAll: (userId: number) => ipcRenderer.invoke('content:getAll', userId),
    getById: (contentId: number) => ipcRenderer.invoke('content:getById', contentId),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('content:create', data),
    update: (contentId: number, data: Record<string, unknown>) => ipcRenderer.invoke('content:update', contentId, data),
    delete: (contentId: number) => ipcRenderer.invoke('content:delete', contentId),
    import: (url: string, userId: number) => ipcRenderer.invoke('content:import', url, userId),
    getGrammars: (contentId: number) => ipcRenderer.invoke('content:getGrammars', contentId),
    onImportProgress: (callback: (step: string) => void) => {
        ipcRenderer.on('content:importProgress', (_event, step: string) => callback(step));
    },
    offImportProgress: () => {
        ipcRenderer.removeAllListeners('content:importProgress');
    },
})

// Expose grammar API
contextBridge.exposeInMainWorld('grammar', {
    getAll: (userId: number) => ipcRenderer.invoke('grammar:getAll', userId),
    update: (masterGrammarId: number, data: Record<string, unknown>) => ipcRenderer.invoke('grammar:update', masterGrammarId, data),
    getSegmentsByContent: (masterGrammarId: number, contentId: number) => ipcRenderer.invoke('grammar:getSegmentsByContent', masterGrammarId, contentId),
    getSegments: (masterGrammarId: number, userId: number) => ipcRenderer.invoke('grammar:getSegments', masterGrammarId, userId),
})

// Expose media server port
contextBridge.exposeInMainWorld('media', {
    getPort: () => ipcRenderer.invoke('media:getPort'),
})

// Expose user API
contextBridge.exposeInMainWorld('user', {
    getAll: () => ipcRenderer.invoke('user:getAll'),
    create: (data: Record<string, unknown>) => ipcRenderer.invoke('user:create', data),
    delete: (userId: number) => ipcRenderer.invoke('user:delete', userId),
    signIn: (email: string, password: string) => ipcRenderer.invoke('user:signIn', email, password),
    getCurrent: () => ipcRenderer.invoke('user:getCurrent'),
    setCurrent: (userId: number) => ipcRenderer.invoke('user:setCurrent', userId),
})
