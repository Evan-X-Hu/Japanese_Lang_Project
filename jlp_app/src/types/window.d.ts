import type { ContentAPI, UserAPI } from './index';

// Electron API exposed via preload script
interface ElectronAPI {
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
}

interface MediaServerAPI {
  getPort: () => Promise<number>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    content?: ContentAPI;
    user?: UserAPI;
    media?: MediaServerAPI;
  }
}
