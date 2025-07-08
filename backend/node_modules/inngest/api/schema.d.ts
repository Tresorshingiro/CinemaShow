import { z } from "zod";
import { ExecutionVersion } from "../components/execution/InngestExecution.js";
import { type EventPayload } from "../types.js";
export declare const errorSchema: z.ZodObject<{
    error: z.ZodString;
    status: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    error: string;
    status: number;
}, {
    error: string;
    status: number;
}>;
export type ErrorResponse = z.infer<typeof errorSchema>;
export declare const stepsSchemas: {
    0: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodAny, any, any>>>>;
    1: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"data">>>;
        data: z.ZodEffects<z.ZodAny, any, any>;
    }, "strict", z.ZodTypeAny, {
        type: "data";
        data?: any;
    }, {
        type?: "data" | undefined;
        data?: any;
    }>, z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"error">>>;
        error: z.ZodType<import("../types.js").JsonError, z.ZodTypeDef, import("../types.js").JsonError>;
    }, "strict", z.ZodTypeAny, {
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
    }, {
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
        type?: "error" | undefined;
    }>]>, z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"input">>>;
        input: z.ZodEffects<z.ZodAny, any, any>;
    }, "strict", z.ZodTypeAny, {
        type: "input";
        input?: any;
    }, {
        type?: "input" | undefined;
        input?: any;
    }>]>, z.ZodEffects<z.ZodAny, {
        type: "data";
        data: any;
    }, any>]>>>;
    2: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"data">>>;
        data: z.ZodEffects<z.ZodAny, any, any>;
    }, "strict", z.ZodTypeAny, {
        type: "data";
        data?: any;
    }, {
        type?: "data" | undefined;
        data?: any;
    }>, z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"error">>>;
        error: z.ZodType<import("../types.js").JsonError, z.ZodTypeDef, import("../types.js").JsonError>;
    }, "strict", z.ZodTypeAny, {
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
    }, {
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
        type?: "error" | undefined;
    }>]>, z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"input">>>;
        input: z.ZodEffects<z.ZodAny, any, any>;
    }, "strict", z.ZodTypeAny, {
        type: "input";
        input?: any;
    }, {
        type?: "input" | undefined;
        input?: any;
    }>]>, z.ZodEffects<z.ZodAny, {
        type: "data";
        data: any;
    }, any>]>>>;
};
export type StepsResponse = {
    [V in ExecutionVersion]: z.infer<(typeof stepsSchemas)[V]>;
}[ExecutionVersion];
export declare const batchSchema: z.ZodArray<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodAny>, EventPayload<any>, Record<string, any>>, "many">;
export type BatchResponse = z.infer<typeof batchSchema>;
//# sourceMappingURL=schema.d.ts.map