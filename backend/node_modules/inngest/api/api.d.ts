import { type fetch } from "cross-fetch";
import { type ExecutionVersion } from "../components/execution/InngestExecution.js";
import { type Mode } from "../helpers/env.js";
import { type Result } from "../types.js";
import { type BatchResponse, type ErrorResponse, type StepsResponse } from "./schema.js";
type FetchT = typeof fetch;
export declare namespace InngestApi {
    interface Options {
        baseUrl?: string;
        signingKey: string;
        signingKeyFallback: string | undefined;
        fetch: FetchT;
        mode: Mode;
    }
    interface Subscription {
        topics: string[];
        channel: string;
    }
    interface PublishOptions extends Subscription {
        runId?: string;
    }
    interface SendSignalOptions {
        signal: string;
        data?: unknown;
    }
    interface SendSignalResponse {
        /**
         * The ID of the run that was signaled.
         *
         * If this is undefined, the signal could not be matched to a run.
         */
        runId: string | undefined;
    }
}
export declare class InngestApi {
    apiBaseUrl?: string;
    private signingKey;
    private signingKeyFallback;
    private readonly fetch;
    private mode;
    constructor({ baseUrl, signingKey, signingKeyFallback, fetch, mode, }: InngestApi.Options);
    private get hashedKey();
    private get hashedFallbackKey();
    setSigningKey(key: string | undefined): void;
    setSigningKeyFallback(key: string | undefined): void;
    private getTargetUrl;
    getRunSteps(runId: string, version: ExecutionVersion): Promise<Result<StepsResponse, ErrorResponse>>;
    getRunBatch(runId: string): Promise<Result<BatchResponse, ErrorResponse>>;
    publish(publishOptions: InngestApi.PublishOptions, data: any): Promise<Result<void, ErrorResponse>>;
    sendSignal(signalOptions: InngestApi.SendSignalOptions, options?: {
        headers?: Record<string, string>;
    }): Promise<Result<InngestApi.SendSignalResponse, ErrorResponse>>;
    getSubscriptionToken(channel: string, topics: string[]): Promise<string>;
}
export {};
//# sourceMappingURL=api.d.ts.map