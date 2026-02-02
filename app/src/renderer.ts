// Declare the global versions API exposed by preload
interface VersionsAPI {
    node: () => string
    chrome: () => string
    electron: () => string
    ping: () => Promise<string>
}

declare global {
    interface Window {
        versions: VersionsAPI
    }
}

// This export makes this file a module, which is required for global augmentation
export {}

const information = document.getElementById('info')
if (information) {
    information.innerText = `This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`
}

const func = async (): Promise<void> => {
    const response = await window.versions.ping()
    console.log(response)
}

func()
