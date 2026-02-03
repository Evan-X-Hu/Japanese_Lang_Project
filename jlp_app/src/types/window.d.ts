// Electron API exposed via preload script
interface ElectronAPI {
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
}

interface Window {
  electron?: ElectronAPI;
}
