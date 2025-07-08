"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllFnData = exports.parseFnData = exports.undefinedToNull = exports.waterfall = exports.cacheFn = void 0;
const zod_1 = require("zod");
const schema_js_1 = require("../api/schema.js");
const InngestExecution_js_1 = require("../components/execution/InngestExecution.js");
const types_js_1 = require("../types.js");
const errors_js_1 = require("./errors.js");
/**
 * Wraps a function with a cache. When the returned function is run, it will
 * cache the result and return it on subsequent calls.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheFn = (fn) => {
    const key = "value";
    const cache = new Map();
    return ((...args) => {
        if (!cache.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            cache.set(key, fn(...args));
        }
        return cache.get(key);
    });
};
exports.cacheFn = cacheFn;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const waterfall = (fns, 
/**
 * A function that transforms the result of each function in the waterfall,
 * ready for the next function.
 *
 * Will not be called on the final function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
transform) => {
    return (...args) => {
        const chain = fns.reduce(async (acc, fn) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const prev = await acc;
            const output = (await fn(prev));
            if (transform) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return await transform(prev, output);
            }
            if (typeof output === "undefined") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return prev;
            }
            return output;
        }, Promise.resolve(args[0]));
        return chain;
    };
};
exports.waterfall = waterfall;
/**
 * Given a value `v`, return `v` if it's not undefined, otherwise return `null`.
 */
const undefinedToNull = (v) => {
    const isUndefined = typeof v === "undefined";
    return isUndefined ? null : v;
};
exports.undefinedToNull = undefinedToNull;
const fnDataVersionSchema = zod_1.z.object({
    version: zod_1.z
        .literal(-1)
        .or(zod_1.z.literal(0))
        .or(zod_1.z.literal(1))
        .or(zod_1.z.literal(2))
        .optional()
        .transform((v) => {
        if (typeof v === "undefined") {
            console.debug(`No request version specified by executor; defaulting to v${InngestExecution_js_1.PREFERRED_EXECUTION_VERSION}`);
            return InngestExecution_js_1.PREFERRED_EXECUTION_VERSION;
        }
        return v === -1 ? InngestExecution_js_1.PREFERRED_EXECUTION_VERSION : v;
    }),
});
const parseFnData = (data) => {
    let version;
    try {
        ({ version } = fnDataVersionSchema.parse(data));
        const versionHandlers = {
            [InngestExecution_js_1.ExecutionVersion.V0]: () => (Object.assign({ version: InngestExecution_js_1.ExecutionVersion.V0 }, zod_1.z
                .object({
                event: zod_1.z.record(zod_1.z.any()),
                events: zod_1.z.array(zod_1.z.record(zod_1.z.any())).default([]),
                steps: schema_js_1.stepsSchemas[InngestExecution_js_1.ExecutionVersion.V0],
                ctx: zod_1.z
                    .object({
                    run_id: zod_1.z.string(),
                    attempt: zod_1.z.number().default(0),
                    stack: zod_1.z
                        .object({
                        stack: zod_1.z
                            .array(zod_1.z.string())
                            .nullable()
                            .transform((v) => (Array.isArray(v) ? v : [])),
                        current: zod_1.z.number(),
                    })
                        .passthrough()
                        .optional()
                        .nullable(),
                })
                    .optional()
                    .nullable(),
                use_api: zod_1.z.boolean().default(false),
            })
                .parse(data))),
            [InngestExecution_js_1.ExecutionVersion.V1]: () => (Object.assign({ version: InngestExecution_js_1.ExecutionVersion.V1 }, zod_1.z
                .object({
                event: zod_1.z.record(zod_1.z.any()),
                events: zod_1.z.array(zod_1.z.record(zod_1.z.any())).default([]),
                steps: schema_js_1.stepsSchemas[InngestExecution_js_1.ExecutionVersion.V1],
                ctx: zod_1.z
                    .object({
                    run_id: zod_1.z.string(),
                    attempt: zod_1.z.number().default(0),
                    disable_immediate_execution: zod_1.z.boolean().default(false),
                    use_api: zod_1.z.boolean().default(false),
                    stack: zod_1.z
                        .object({
                        stack: zod_1.z
                            .array(zod_1.z.string())
                            .nullable()
                            .transform((v) => (Array.isArray(v) ? v : [])),
                        current: zod_1.z.number(),
                    })
                        .passthrough()
                        .optional()
                        .nullable(),
                })
                    .optional()
                    .nullable(),
            })
                .parse(data))),
            [InngestExecution_js_1.ExecutionVersion.V2]: () => (Object.assign({ version: InngestExecution_js_1.ExecutionVersion.V2 }, zod_1.z
                .object({
                event: zod_1.z.record(zod_1.z.any()),
                events: zod_1.z.array(zod_1.z.record(zod_1.z.any())).default([]),
                steps: schema_js_1.stepsSchemas[InngestExecution_js_1.ExecutionVersion.V2],
                ctx: zod_1.z
                    .object({
                    run_id: zod_1.z.string(),
                    attempt: zod_1.z.number().default(0),
                    disable_immediate_execution: zod_1.z.boolean().default(false),
                    use_api: zod_1.z.boolean().default(false),
                    stack: zod_1.z
                        .object({
                        stack: zod_1.z
                            .array(zod_1.z.string())
                            .nullable()
                            .transform((v) => (Array.isArray(v) ? v : [])),
                        current: zod_1.z.number(),
                    })
                        .passthrough()
                        .optional()
                        .nullable(),
                })
                    .optional()
                    .nullable(),
            })
                .parse(data))),
        };
        return versionHandlers[version]();
    }
    catch (err) {
        throw new Error(parseFailureErr(err));
    }
};
exports.parseFnData = parseFnData;
const fetchAllFnData = async ({ data, api, version, }) => {
    var _a, _b, _c, _d;
    const result = Object.assign({}, data);
    try {
        if ((result.version === InngestExecution_js_1.ExecutionVersion.V0 && result.use_api) ||
            (result.version === InngestExecution_js_1.ExecutionVersion.V1 && ((_a = result.ctx) === null || _a === void 0 ? void 0 : _a.use_api))) {
            if (!((_b = result.ctx) === null || _b === void 0 ? void 0 : _b.run_id)) {
                return (0, types_js_1.err)((0, errors_js_1.prettyError)({
                    whatHappened: "failed to attempt retrieving data from API",
                    consequences: "function execution can't continue",
                    why: "run_id is missing from context",
                    stack: true,
                }));
            }
            const [evtResp, stepResp] = await Promise.all([
                api.getRunBatch(result.ctx.run_id),
                api.getRunSteps(result.ctx.run_id, version),
            ]);
            if (evtResp.ok) {
                result.events = evtResp.value;
            }
            else {
                return (0, types_js_1.err)((0, errors_js_1.prettyError)({
                    whatHappened: "failed to retrieve list of events",
                    consequences: "function execution can't continue",
                    why: (_c = evtResp.error) === null || _c === void 0 ? void 0 : _c.error,
                    stack: true,
                }));
            }
            if (stepResp.ok) {
                result.steps = stepResp.value;
            }
            else {
                return (0, types_js_1.err)((0, errors_js_1.prettyError)({
                    whatHappened: "failed to retrieve steps for function run",
                    consequences: "function execution can't continue",
                    why: (_d = stepResp.error) === null || _d === void 0 ? void 0 : _d.error,
                    stack: true,
                }));
            }
        }
        return (0, types_js_1.ok)(result);
    }
    catch (error) {
        // print it out for now.
        // move to something like protobuf so we don't have to deal with this
        console.error(error);
        return (0, types_js_1.err)(parseFailureErr(error));
    }
};
exports.fetchAllFnData = fetchAllFnData;
const parseFailureErr = (err) => {
    let why;
    if (err instanceof zod_1.ZodError) {
        why = err.toString();
    }
    return (0, errors_js_1.prettyError)({
        whatHappened: "Failed to parse data from executor.",
        consequences: "Function execution can't continue.",
        toFixNow: "Make sure that your API is set up to parse incoming request bodies as JSON, like body-parser for Express (https://expressjs.com/en/resources/middleware/body-parser.html).",
        stack: true,
        why,
    });
};
//# sourceMappingURL=functions.js.map