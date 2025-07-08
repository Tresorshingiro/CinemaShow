export declare class ReconnectError extends Error {
    attempt: number;
    constructor(message: string, attempt: number);
}
export declare class AuthError extends ReconnectError {
    constructor(message: string, attempt: number);
}
export declare class ConnectionLimitError extends ReconnectError {
    constructor(attempt: number);
}
export declare function expBackoff(attempt: number): number;
/**
 * Wait for a given amount of time, but cancel if the given condition is true.
 *
 * Returns `true` if the condition was met, `false` if the timeout was reached.
 */
export declare function waitWithCancel(ms: number, cancelIf: () => boolean): Promise<boolean>;
export declare function parseTraceCtx(serializedTraceCtx: Uint8Array<ArrayBufferLike>): {
    traceParent: string;
    traceState: string;
} | null;
//# sourceMappingURL=util.d.ts.map