"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._internals = exports.V0InngestExecution = exports.createV0InngestExecution = void 0;
const canonicalize_1 = __importDefault(require("canonicalize"));
const hash_js_1 = require("hash.js");
const zod_1 = require("zod");
const errors_js_1 = require("../../helpers/errors.js");
const functions_js_1 = require("../../helpers/functions.js");
const promises_js_1 = require("../../helpers/promises.js");
const types_js_1 = require("../../types.js");
const InngestMiddleware_js_1 = require("../InngestMiddleware.js");
const InngestStepTools_js_1 = require("../InngestStepTools.js");
const NonRetriableError_js_1 = require("../NonRetriableError.js");
const RetryAfterError_js_1 = require("../RetryAfterError.js");
const InngestExecution_js_1 = require("./InngestExecution.js");
const createV0InngestExecution = (options) => {
    return new V0InngestExecution(options);
};
exports.createV0InngestExecution = createV0InngestExecution;
class V0InngestExecution extends InngestExecution_js_1.InngestExecution {
    constructor(options) {
        super(options);
        this.userFnToRun = this.getUserFnToRun();
        this.state = this.createExecutionState();
        this.fnArg = this.createFnArg();
    }
    start() {
        var _a;
        this.debug("starting V0 execution");
        return ((_a = this.execution) !== null && _a !== void 0 ? _a : (this.execution = this._start().then((result) => {
            this.debug("result:", result);
            return result;
        })));
    }
    async _start() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        this.state.hooks = await this.initializeMiddleware();
        try {
            await this.transformInput();
            await ((_b = (_a = this.state.hooks).beforeMemoization) === null || _b === void 0 ? void 0 : _b.call(_a));
            if (this.state.opStack.length === 0 && !this.options.requestedRunStep) {
                await ((_d = (_c = this.state.hooks).afterMemoization) === null || _d === void 0 ? void 0 : _d.call(_c));
                await ((_f = (_e = this.state.hooks).beforeExecution) === null || _f === void 0 ? void 0 : _f.call(_e));
            }
            const userFnPromise = (0, promises_js_1.runAsPromise)(() => this.userFnToRun(this.fnArg));
            let pos = -1;
            do {
                if (pos >= 0) {
                    if (!this.options.requestedRunStep &&
                        pos === this.state.opStack.length - 1) {
                        await ((_h = (_g = this.state.hooks).afterMemoization) === null || _h === void 0 ? void 0 : _h.call(_g));
                        await ((_k = (_j = this.state.hooks).beforeExecution) === null || _k === void 0 ? void 0 : _k.call(_j));
                    }
                    this.state.tickOps = {};
                    const incomingOp = this.state.opStack[pos];
                    this.state.currentOp = this.state.allFoundOps[incomingOp.id];
                    if (!this.state.currentOp) {
                        /**
                         * We're trying to resume the function, but we can't find where to go.
                         *
                         * This means that either the function has changed or there are async
                         * actions in-between steps that we haven't noticed in previous
                         * executions.
                         *
                         * Whichever the case, this is bad and we can't continue in this
                         * undefined state.
                         */
                        throw new NonRetriableError_js_1.NonRetriableError((0, errors_js_1.prettyError)({
                            whatHappened: " Your function was stopped from running",
                            why: "We couldn't resume your function's state because it may have changed since the run started or there are async actions in-between steps that we haven't noticed in previous executions.",
                            consequences: "Continuing to run the function may result in unexpected behaviour, so we've stopped your function to ensure nothing unexpected happened!",
                            toFixNow: "Ensure that your function is either entirely step-based or entirely non-step-based, by either wrapping all asynchronous logic in `step.run()` calls or by removing all `step.*()` calls.",
                            otherwise: "For more information on why step functions work in this manner, see https://www.inngest.com/docs/functions/multi-step#gotchas",
                            stack: true,
                            code: errors_js_1.ErrCode.NON_DETERMINISTIC_FUNCTION,
                        }));
                    }
                    this.state.currentOp.fulfilled = true;
                    if (typeof incomingOp.data !== "undefined") {
                        this.state.currentOp.resolve(incomingOp.data);
                    }
                    else {
                        this.state.currentOp.reject(incomingOp.error);
                    }
                }
                await (0, promises_js_1.resolveAfterPending)();
                this.state.reset();
                pos++;
            } while (pos < this.state.opStack.length);
            await ((_m = (_l = this.state.hooks).afterMemoization) === null || _m === void 0 ? void 0 : _m.call(_l));
            const discoveredOps = Object.values(this.state.tickOps).map(tickOpToOutgoing);
            const runStep = this.options.requestedRunStep ||
                this.getEarlyExecRunStep(discoveredOps);
            if (runStep) {
                const userFnOp = this.state.allFoundOps[runStep];
                const stepToRun = userFnOp === null || userFnOp === void 0 ? void 0 : userFnOp.fn;
                if (!stepToRun) {
                    throw new Error(`Bad stack; executor requesting to run unknown step "${runStep}"`);
                }
                const outgoingUserFnOp = Object.assign(Object.assign({}, tickOpToOutgoing(userFnOp)), { op: types_js_1.StepOpCode.Step });
                await ((_p = (_o = this.state.hooks).beforeExecution) === null || _p === void 0 ? void 0 : _p.call(_o));
                this.state.executingStep = true;
                const result = await (0, promises_js_1.runAsPromise)(stepToRun)
                    .finally(() => {
                    this.state.executingStep = false;
                })
                    .catch(async (error) => {
                    return await this.transformOutput({ error }, outgoingUserFnOp);
                })
                    .then(async (data) => {
                    var _a, _b;
                    await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.afterExecution) === null || _b === void 0 ? void 0 : _b.call(_a));
                    return await this.transformOutput({ data }, outgoingUserFnOp);
                });
                const { type: _type } = result, rest = __rest(result, ["type"]);
                return {
                    type: "step-ran",
                    ctx: this.fnArg,
                    ops: this.ops,
                    step: Object.assign(Object.assign({}, outgoingUserFnOp), rest),
                };
            }
            if (!discoveredOps.length) {
                const fnRet = await Promise.race([
                    userFnPromise.then((data) => ({ type: "complete", data })),
                    (0, promises_js_1.resolveNextTick)().then(() => ({ type: "incomplete" })),
                ]);
                if (fnRet.type === "complete") {
                    await ((_r = (_q = this.state.hooks).afterExecution) === null || _r === void 0 ? void 0 : _r.call(_q));
                    const allOpsFulfilled = Object.values(this.state.allFoundOps).every((op) => {
                        return op.fulfilled;
                    });
                    if (allOpsFulfilled) {
                        return await this.transformOutput({ data: fnRet.data });
                    }
                }
                else if (!this.state.hasUsedTools) {
                    this.state.nonStepFnDetected = true;
                    const data = await userFnPromise;
                    await ((_t = (_s = this.state.hooks).afterExecution) === null || _t === void 0 ? void 0 : _t.call(_s));
                    return await this.transformOutput({ data });
                }
                else {
                    const hasOpsPending = Object.values(this.state.allFoundOps).some((op) => {
                        return op.fulfilled === false;
                    });
                    if (!hasOpsPending) {
                        throw new NonRetriableError_js_1.NonRetriableError((0, errors_js_1.functionStoppedRunningErr)(errors_js_1.ErrCode.ASYNC_DETECTED_AFTER_MEMOIZATION));
                    }
                }
            }
            await ((_v = (_u = this.state.hooks).afterExecution) === null || _v === void 0 ? void 0 : _v.call(_u));
            return {
                type: "steps-found",
                ctx: this.fnArg,
                ops: this.ops,
                steps: discoveredOps,
            };
        }
        catch (error) {
            return await this.transformOutput({ error });
        }
        finally {
            await ((_x = (_w = this.state.hooks).beforeResponse) === null || _x === void 0 ? void 0 : _x.call(_w));
        }
    }
    async initializeMiddleware() {
        const ctx = this.options.data;
        const hooks = await (0, InngestMiddleware_js_1.getHookStack)(this.options.fn["middleware"], "onFunctionRun", {
            ctx,
            fn: this.options.fn,
            steps: Object.values(this.options.stepState),
            reqArgs: this.options.reqArgs,
        }, {
            transformInput: (prev, output) => {
                return {
                    ctx: Object.assign(Object.assign({}, prev.ctx), output === null || output === void 0 ? void 0 : output.ctx),
                    fn: this.options.fn,
                    steps: prev.steps.map((step, i) => {
                        var _a;
                        return (Object.assign(Object.assign({}, step), (_a = output === null || output === void 0 ? void 0 : output.steps) === null || _a === void 0 ? void 0 : _a[i]));
                    }),
                    reqArgs: prev.reqArgs,
                };
            },
            transformOutput: (prev, output) => {
                return {
                    result: Object.assign(Object.assign({}, prev.result), output === null || output === void 0 ? void 0 : output.result),
                    step: prev.step,
                };
            },
        });
        return hooks;
    }
    createExecutionState() {
        const state = {
            allFoundOps: {},
            tickOps: {},
            tickOpHashes: {},
            currentOp: undefined,
            hasUsedTools: false,
            reset: () => {
                state.tickOpHashes = {};
                state.allFoundOps = Object.assign(Object.assign({}, state.allFoundOps), state.tickOps);
            },
            nonStepFnDetected: false,
            executingStep: false,
            opStack: this.options.stepCompletionOrder.reduce((acc, stepId) => {
                const stepState = this.options.stepState[stepId];
                if (!stepState) {
                    return acc;
                }
                return [...acc, stepState];
            }, []),
        };
        return state;
    }
    get ops() {
        return Object.fromEntries(Object.entries(this.state.allFoundOps).map(([id, op]) => [
            id,
            {
                id: op.id,
                rawArgs: op.rawArgs,
                data: op.data,
                error: op.error,
                fulfilled: op.fulfilled,
                seen: true,
            },
        ]));
    }
    getUserFnToRun() {
        if (!this.options.isFailureHandler) {
            return this.options.fn["fn"];
        }
        if (!this.options.fn["onFailureFn"]) {
            /**
             * Somehow, we've ended up detecting that this is a failure handler but
             * doesn't have an `onFailure` function. This should never happen.
             */
            throw new Error("Cannot find function `onFailure` handler");
        }
        // TODO: Review; inferred types results in an `any` here!
        return this.options.fn["onFailureFn"];
    }
    createFnArg() {
        var _a, _b, _c, _d;
        // Start referencing everything
        this.state.tickOps = this.state.allFoundOps;
        /**
         * Create a unique hash of an operation using only a subset of the operation's
         * properties; will never use `data` and will guarantee the order of the
         * object so we don't rely on individual tools for that.
         *
         * If the operation already contains an ID, the current ID will be used
         * instead, so that users can provide their own IDs.
         */
        const hashOp = (
        /**
         * The op to generate a hash from. We only use a subset of the op's
         * properties when creating the hash.
         */
        op) => {
            var _a, _b, _c, _d;
            /**
             * It's difficult for v0 to understand whether or not an op has
             * historically contained a custom ID, as all step usage now require them.
             *
             * For this reason, we make the assumption that steps in v0 do not have a
             * custom ID and generate one for them as we would in all recommendations
             * and examples.
             */
            const obj = {
                parent: (_b = (_a = this.state.currentOp) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                op: op.op,
                name: op.name,
                // Historically, no v0 runs could have options for `step.run()` call,
                // but this object can be specified in future versions.
                //
                // For this purpose, we change this to always use `null` if the op is
                // that of a `step.run()`.
                opts: op.op === types_js_1.StepOpCode.StepPlanned ? null : (_c = op.opts) !== null && _c !== void 0 ? _c : null,
            };
            const collisionHash = exports._internals.hashData(obj);
            const pos = (this.state.tickOpHashes[collisionHash] =
                ((_d = this.state.tickOpHashes[collisionHash]) !== null && _d !== void 0 ? _d : -1) + 1);
            return Object.assign(Object.assign({}, op), { id: exports._internals.hashData(Object.assign({ pos }, obj)) });
        };
        const stepHandler = ({ args, matchOp, opts }) => {
            if (this.state.nonStepFnDetected) {
                throw new NonRetriableError_js_1.NonRetriableError((0, errors_js_1.functionStoppedRunningErr)(errors_js_1.ErrCode.STEP_USED_AFTER_ASYNC));
            }
            if (this.state.executingStep) {
                throw new NonRetriableError_js_1.NonRetriableError((0, errors_js_1.prettyError)({
                    whatHappened: "Your function was stopped from running",
                    why: "We detected that you have nested `step.*` tooling.",
                    consequences: "Nesting `step.*` tooling is not supported.",
                    stack: true,
                    toFixNow: "Make sure you're not using `step.*` tooling inside of other `step.*` tooling. If you need to compose steps together, you can create a new async function and call it from within your step function, or use promise chaining.",
                    otherwise: "For more information on step functions with Inngest, see https://www.inngest.com/docs/functions/multi-step",
                    code: errors_js_1.ErrCode.NESTING_STEPS,
                }));
            }
            this.state.hasUsedTools = true;
            const stepOptions = (0, InngestStepTools_js_1.getStepOptions)(args[0]);
            const opId = hashOp(matchOp(stepOptions, ...args.slice(1)));
            return new Promise((resolve, reject) => {
                this.state.tickOps[opId.id] = Object.assign(Object.assign(Object.assign({}, opId), ((opts === null || opts === void 0 ? void 0 : opts.fn) ? { fn: () => { var _a; return (_a = opts.fn) === null || _a === void 0 ? void 0 : _a.call(opts, ...args); } } : {})), { rawArgs: args, resolve,
                    reject, fulfilled: false });
            });
        };
        const step = (0, InngestStepTools_js_1.createStepTools)(this.options.client, this, stepHandler);
        let fnArg = Object.assign(Object.assign({}, this.options.data), { step });
        if (this.options.isFailureHandler) {
            const eventData = zod_1.z
                .object({ error: types_js_1.jsonErrorSchema })
                .parse((_a = fnArg.event) === null || _a === void 0 ? void 0 : _a.data);
            fnArg = Object.assign(Object.assign({}, fnArg), { error: (0, errors_js_1.deserializeError)(eventData.error) });
        }
        return (_d = (_c = (_b = this.options).transformCtx) === null || _c === void 0 ? void 0 : _c.call(_b, fnArg)) !== null && _d !== void 0 ? _d : fnArg;
    }
    /**
     * Using middleware, transform input before running.
     */
    async transformInput() {
        var _a, _b;
        const inputMutations = await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.transformInput) === null || _b === void 0 ? void 0 : _b.call(_a, {
            ctx: Object.assign({}, this.fnArg),
            steps: Object.values(this.options.stepState),
            fn: this.options.fn,
            reqArgs: this.options.reqArgs,
        }));
        if (inputMutations === null || inputMutations === void 0 ? void 0 : inputMutations.ctx) {
            this.fnArg = inputMutations.ctx;
        }
        if (inputMutations === null || inputMutations === void 0 ? void 0 : inputMutations.steps) {
            this.state.opStack = [...inputMutations.steps];
        }
    }
    getEarlyExecRunStep(ops) {
        if (ops.length !== 1)
            return;
        const op = ops[0];
        if (op &&
            op.op === types_js_1.StepOpCode.StepPlanned
        // TODO We must individually check properties here that we do not want to
        // execute on, such as retry counts. Nothing exists here that falls in to
        // this case, but should be accounted for when we add them.
        // && typeof op.opts === "undefined"
        ) {
            return op.id;
        }
    }
    /**
     * Using middleware, transform output before returning.
     */
    async transformOutput(dataOrError, step) {
        var _a, _b, _c, _d;
        const output = Object.assign({}, dataOrError);
        if (typeof output.error !== "undefined") {
            output.data = (0, errors_js_1.serializeError)(output.error);
        }
        const transformedOutput = await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.transformOutput) === null || _b === void 0 ? void 0 : _b.call(_a, {
            result: Object.assign({}, output),
            step,
        }));
        const { data, error } = Object.assign(Object.assign({}, output), transformedOutput === null || transformedOutput === void 0 ? void 0 : transformedOutput.result);
        if (!step) {
            await ((_d = (_c = this.state.hooks) === null || _c === void 0 ? void 0 : _c.finished) === null || _d === void 0 ? void 0 : _d.call(_c, {
                result: Object.assign({}, (typeof error !== "undefined" ? { error } : { data })),
            }));
        }
        if (typeof error !== "undefined") {
            /**
             * Ensure we give middleware the chance to decide on retriable behaviour
             * by looking at the error returned from output transformation.
             */
            let retriable = !(error instanceof NonRetriableError_js_1.NonRetriableError);
            if (retriable && error instanceof RetryAfterError_js_1.RetryAfterError) {
                retriable = error.retryAfter;
            }
            const serializedError = (0, errors_js_1.serializeError)(error);
            return {
                type: "function-rejected",
                ctx: this.fnArg,
                ops: this.ops,
                error: serializedError,
                retriable,
            };
        }
        return {
            type: "function-resolved",
            ctx: this.fnArg,
            ops: this.ops,
            data: (0, functions_js_1.undefinedToNull)(data),
        };
    }
}
exports.V0InngestExecution = V0InngestExecution;
const tickOpToOutgoing = (op) => {
    return {
        op: op.op,
        id: op.id,
        name: op.name,
        opts: op.opts,
    };
};
const hashData = (op) => {
    return (0, hash_js_1.sha1)().update((0, canonicalize_1.default)(op)).digest("hex");
};
/**
 * Exported for testing.
 */
exports._internals = { hashData };
//# sourceMappingURL=v0.js.map