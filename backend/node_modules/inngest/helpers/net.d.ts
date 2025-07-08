/**
 * Send an HTTP request with the given signing key. If the response is a 401 or
 * 403, then try again with the fallback signing key
 */
export declare function fetchWithAuthFallback<TFetch extends typeof fetch>({ authToken, authTokenFallback, fetch, options, url, }: {
    authToken?: string;
    authTokenFallback?: string;
    fetch: TFetch;
    options?: Parameters<TFetch>[1];
    url: URL | string;
}): Promise<Response>;
export declare function signDataWithKey(data: unknown, signingKey: string, ts: string): string;
//# sourceMappingURL=net.d.ts.map