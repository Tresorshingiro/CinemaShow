import { z } from "zod";
import { type InngestApi } from "../api/api.js";
import { ExecutionVersion } from "../components/execution/InngestExecution.js";
import { type Result } from "../types.js";
import { type Await } from "./types.js";
/**
 * Wraps a function with a cache. When the returned function is run, it will
 * cache the result and return it on subsequent calls.
 */
export declare const cacheFn: <T extends (...args: any[]) => any>(fn: T) => T;
/**
 * Given an array of functions, return a new function that will run each
 * function in series and return the result of the final function. Regardless of
 * if the functions are synchronous or asynchronous, they'll be made into an
 * async promise chain.
 *
 * If an error is thrown, the waterfall will stop and return the error.
 *
 * Because this needs to support both sync and async functions, it only allows
 * functions that accept a single argument.
 */
export declare const waterfall: <TFns extends ((arg?: any) => any)[]>(fns: TFns, 
/**
 * A function that transforms the result of each function in the waterfall,
 * ready for the next function.
 *
 * Will not be called on the final function.
 */
transform?: (prev: any, output: any) => any) => ((...args: Parameters<TFns[number]>) => Promise<Await<TFns[number]>>);
/**
 * Given a value `v`, return `v` if it's not undefined, otherwise return `null`.
 */
export declare const undefinedToNull: (v: unknown) => {} | null;
export declare const parseFnData: (data: unknown) => {
    readonly event: Record<string, any>;
    readonly events: Record<string, any>[];
    readonly use_api: boolean;
    readonly steps?: Record<string, any> | null | undefined;
    readonly ctx?: {
        run_id: string;
        attempt: number;
        stack?: z.objectOutputType<{
            stack: z.ZodEffects<z.ZodNullable<z.ZodArray<z.ZodString, "many">>, string[], string[] | null>;
            current: z.ZodNumber;
        }, z.ZodTypeAny, "passthrough"> | null | undefined;
    } | null | undefined;
    readonly version: ExecutionVersion.V0;
} | {
    readonly event: Record<string, any>;
    readonly events: Record<string, any>[];
    readonly steps: Record<string, {
        type: "data";
        data?: any;
    } | {
        error: {
            name?: string | undefined;
            error?: string | undefined;
            message?: string | undefined;
            stack?: string | undefined;
        } & {
            name: string;
            message: string;
            cause?: unknown;
        };
        type: "error";
    } | {
        type: "input";
        input?: any;
    } | {
        type: "data";
        data: any;
    }>;
    readonly ctx?: {
        run_id: string;
        attempt: number;
        use_api: boolean;
        disable_immediate_execution: boolean;
        stack?: z.objectOutputType<{
            stack: z.ZodEffects<z.ZodNullable<z.ZodArray<z.ZodString, "many">>, string[], string[] | null>;
            current: z.ZodNumber;
        }, z.ZodTypeAny, "passthrough"> | null | undefined;
    } | null | undefined;
    readonly version: ExecutionVersion.V1;
} | {
    readonly event: Record<string, any>;
    readonly events: Record<string, any>[];
    readonly steps: Record<string, {
        type: "data";
        data?: any;
    } | {
        error: {
            name?: string | undefined;
            error?: string | undefined;
            message?: string | undefined;
            stack?: string | undefined;
        } & {
            name: string;
            message: string;
            cause?: unknown;
        };
        type: "error";
    } | {
        type: "input";
        input?: any;
    } | {
        type: "data";
        data: any;
    }>;
    readonly ctx?: {
        run_id: string;
        attempt: number;
        use_api: boolean;
        disable_immediate_execution: boolean;
        stack?: z.objectOutputType<{
            stack: z.ZodEffects<z.ZodNullable<z.ZodArray<z.ZodString, "many">>, string[], string[] | null>;
            current: z.ZodNumber;
        }, z.ZodTypeAny, "passthrough"> | null | undefined;
    } | null | undefined;
    readonly version: ExecutionVersion.V2;
};
export type FnData = ReturnType<typeof parseFnData>;
type ParseErr = string;
export declare const fetchAllFnData: ({ data, api, version, }: {
    data: FnData;
    api: InngestApi;
    version: ExecutionVersion;
}) => Promise<Result<FnData, ParseErr>>;
export {};
//# sourceMappingURL=functions.d.ts.map