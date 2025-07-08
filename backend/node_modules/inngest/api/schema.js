"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchSchema = exports.stepsSchemas = exports.errorSchema = void 0;
const zod_1 = require("zod");
const InngestExecution_js_1 = require("../components/execution/InngestExecution.js");
const types_js_1 = require("../types.js");
exports.errorSchema = zod_1.z.object({
    error: zod_1.z.string(),
    status: zod_1.z.number(),
});
const v0StepSchema = zod_1.z
    .record(zod_1.z.any().refine((v) => typeof v !== "undefined", {
    message: "Values in steps must be defined",
}))
    .optional()
    .nullable();
const v1StepSchema = zod_1.z
    .record(zod_1.z
    .object({
    type: zod_1.z.literal("data").optional().default("data"),
    data: zod_1.z.any().refine((v) => typeof v !== "undefined", {
        message: "Data in steps must be defined",
    }),
})
    .strict()
    .or(zod_1.z
    .object({
    type: zod_1.z.literal("error").optional().default("error"),
    error: types_js_1.jsonErrorSchema,
})
    .strict())
    .or(zod_1.z
    .object({
    type: zod_1.z.literal("input").optional().default("input"),
    input: zod_1.z.any().refine((v) => typeof v !== "undefined", {
        message: "If input is present it must not be `undefined`",
    }),
})
    .strict())
    /**
     * If the result isn't a distcint `data` or `error` object, then it's
     * likely that the executor has set this directly to a value, for example
     * in the case of `sleep` or `waitForEvent`.
     *
     * In this case, pull the entire value through as data.
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    .or(zod_1.z.any().transform((v) => ({ type: "data", data: v }))))
    .default({});
const v2StepSchema = v1StepSchema;
exports.stepsSchemas = {
    [InngestExecution_js_1.ExecutionVersion.V0]: v0StepSchema,
    [InngestExecution_js_1.ExecutionVersion.V1]: v1StepSchema,
    [InngestExecution_js_1.ExecutionVersion.V2]: v2StepSchema,
};
exports.batchSchema = zod_1.z.array(zod_1.z.record(zod_1.z.any()).transform((v) => v));
//# sourceMappingURL=schema.js.map