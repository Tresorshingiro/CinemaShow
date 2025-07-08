export declare function retrieveSystemAttributes(): Promise<{
    cpuCores: number;
    memBytes: number;
    os: string;
}>;
export declare function onShutdown(signals: string[], fn: () => void): () => void;
export declare function getHostname(): Promise<string>;
//# sourceMappingURL=os.d.ts.map