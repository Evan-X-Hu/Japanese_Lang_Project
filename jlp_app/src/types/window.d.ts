import type { ContentAPI } from './index';

// Electron API exposed via preload script
interface ElectronAPI {
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    content?: ContentAPI;
  }
}
