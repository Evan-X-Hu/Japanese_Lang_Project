interface VersionsAPI {
    node: () => string;
    chrome: () => string;
    electron: () => string;
    ping: () => Promise<string>;
}
declare global {
    interface Window {
        versions: VersionsAPI;
    }
}
export {};
//# sourceMappingURL=renderer.d.ts.map