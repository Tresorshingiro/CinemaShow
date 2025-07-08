"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._internals = exports.createV1InngestExecution = void 0;
const api_1 = require("@opentelemetry/api");
const hash_js_1 = require("hash.js");
const zod_1 = require("zod");
const consts_js_1 = require("../../helpers/consts.js");
const errors_js_1 = require("../../helpers/errors.js");
const functions_js_1 = require("../../helpers/functions.js");
const promises_js_1 = require("../../helpers/promises.js");
const types_js_1 = require("../../types.js");
const version_js_1 = require("../../version.js");
const InngestMiddleware_js_1 = require("../InngestMiddleware.js");
const InngestStepTools_js_1 = require("../InngestStepTools.js");
const NonRetriableError_js_1 = require("../NonRetriableError.js");
const RetryAfterError_js_1 = require("../RetryAfterError.js");
const StepError_js_1 = require("../StepError.js");
const InngestExecution_js_1 = require("./InngestExecution.js");
const als_js_1 = require("./als.js");
const access_js_1 = require("./otel/access.js");
const createV1InngestExecution = (options) => {
    return new V1InngestExecution(options);
};
exports.createV1InngestExecution = createV1InngestExecution;
class V1InngestExecution extends InngestExecution_js_1.InngestExecution {
    constructor(options) {
        super(options);
        this.timeoutDuration = 1000 * 10;
        this.userFnToRun = this.getUserFnToRun();
        this.state = this.createExecutionState();
        this.fnArg = this.createFnArg();
        this.checkpointHandlers = this.createCheckpointHandlers();
        this.initializeTimer(this.state);
        this.debug("created new V1 execution for run;", this.options.requestedRunStep
            ? `wanting to run step "${this.options.requestedRunStep}"`
            : "discovering steps");
        this.debug("existing state keys:", Object.keys(this.state.stepState));
    }
    /**
     * Idempotently start the execution of the user's function.
     */
    start() {
        if (!this.execution) {
            this.debug("starting V1 execution");
            const tracer = api_1.trace.getTracer("inngest", version_js_1.version);
            this.execution = (0, als_js_1.getAsyncLocalStorage)().then((als) => {
                return als.run({ app: this.options.client, ctx: this.fnArg }, async () => {
                    return tracer.startActiveSpan("inngest.execution", (span) => {
                        var _a;
                        (_a = access_js_1.clientProcessorMap.get(this.options.client)) === null || _a === void 0 ? void 0 : _a.declareStartingSpan({
                            span,
                            runId: this.options.runId,
                            traceparent: this.options.headers[consts_js_1.headerKeys.TraceParent],
                            tracestate: this.options.headers[consts_js_1.headerKeys.TraceState],
                        });
                        return this._start()
                            .then((result) => {
                            this.debug("result:", result);
                            return result;
                        })
                            .finally(() => {
                            span.end();
                        });
                    });
                });
            });
        }
        return this.execution;
    }
    /**
     * Starts execution of the user's function and the core loop.
     */
    async _start() {
        var _a, e_1, _b, _c;
        var _d, _e;
        try {
            const allCheckpointHandler = this.getCheckpointHandler("");
            this.state.hooks = await this.initializeMiddleware();
            await this.startExecution();
            try {
                for (var _f = true, _g = __asyncValues(this.state.loop), _h; _h = await _g.next(), _a = _h.done, !_a; _f = true) {
                    _c = _h.value;
                    _f = false;
                    const checkpoint = _c;
                    await allCheckpointHandler(checkpoint);
                    const handler = this.getCheckpointHandler(checkpoint.type);
                    const result = await handler(checkpoint);
                    if (result) {
                        return result;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_f && !_a && (_b = _g.return)) await _b.call(_g);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (error) {
            return await this.transformOutput({ error });
        }
        finally {
            void this.state.loop.return();
            await ((_e = (_d = this.state.hooks) === null || _d === void 0 ? void 0 : _d.beforeResponse) === null || _e === void 0 ? void 0 : _e.call(_d));
        }
        /**
         * If we're here, the generator somehow finished without returning a value.
         * This should never happen.
         */
        throw new Error("Core loop finished without returning a value");
    }
    /**
     * Creates a handler for every checkpoint type, defining what to do when we
     * reach that checkpoint in the core loop.
     */
    createCheckpointHandlers() {
        return {
            /**
             * Run for all checkpoints. Best used for logging or common actions.
             * Use other handlers to return values and interrupt the core loop.
             */
            "": (checkpoint) => {
                this.debug("checkpoint:", checkpoint);
            },
            /**
             * The user's function has completed and returned a value.
             */
            "function-resolved": async (checkpoint) => {
                return await this.transformOutput({ data: checkpoint.data });
            },
            /**
             * The user's function has thrown an error.
             */
            "function-rejected": async (checkpoint) => {
                return await this.transformOutput({ error: checkpoint.error });
            },
            /**
             * We've found one or more steps. Here we may want to run a step or report
             * them back to Inngest.
             */
            "steps-found": async ({ steps }) => {
                const stepResult = await this.tryExecuteStep(steps);
                if (stepResult) {
                    const transformResult = await this.transformOutput(stepResult);
                    /**
                     * Transforming output will always return either function rejection or
                     * resolution. In most cases, this can be immediately returned, but in
                     * this particular case we want to handle it differently.
                     */
                    if (transformResult.type === "function-resolved") {
                        return {
                            type: "step-ran",
                            ctx: transformResult.ctx,
                            ops: transformResult.ops,
                            step: exports._internals.hashOp(Object.assign(Object.assign({}, stepResult), { data: transformResult.data })),
                        };
                    }
                    else if (transformResult.type === "function-rejected") {
                        return {
                            type: "step-ran",
                            ctx: transformResult.ctx,
                            ops: transformResult.ops,
                            step: exports._internals.hashOp(Object.assign(Object.assign({}, stepResult), { error: transformResult.error })),
                            retriable: transformResult.retriable,
                        };
                    }
                    return transformResult;
                }
                const newSteps = await this.filterNewSteps(Array.from(this.state.steps.values()));
                if (newSteps) {
                    return {
                        type: "steps-found",
                        ctx: this.fnArg,
                        ops: this.ops,
                        steps: newSteps,
                    };
                }
            },
            /**
             * While trying to find a step that Inngest has told us to run, we've
             * timed out or have otherwise decided that it doesn't exist.
             */
            "step-not-found": ({ step }) => {
                return { type: "step-not-found", ctx: this.fnArg, ops: this.ops, step };
            },
        };
    }
    getCheckpointHandler(type) {
        return this.checkpointHandlers[type];
    }
    async tryExecuteStep(steps) {
        var _a;
        const hashedStepIdToRun = this.options.requestedRunStep || this.getEarlyExecRunStep(steps);
        if (!hashedStepIdToRun) {
            return;
        }
        const step = steps.find((step) => step.hashedId === hashedStepIdToRun && step.fn);
        if (step) {
            return await this.executeStep(step);
        }
        /**
         * Ensure we reset the timeout if we have a requested run step but couldn't
         * find it, but also that we don't reset if we found and executed it.
         */
        void ((_a = this.timeout) === null || _a === void 0 ? void 0 : _a.reset());
    }
    /**
     * Given a list of outgoing ops, decide if we can execute an op early and
     * return the ID of the step to execute if we can.
     */
    getEarlyExecRunStep(steps) {
        /**
         * We may have been disabled due to parallelism, in which case we can't
         * immediately execute unless explicitly requested.
         */
        if (this.options.disableImmediateExecution)
            return;
        const unfulfilledSteps = steps.filter((step) => !step.fulfilled);
        if (unfulfilledSteps.length !== 1)
            return;
        const op = unfulfilledSteps[0];
        if (op &&
            op.op === types_js_1.StepOpCode.StepPlanned
        // TODO We must individually check properties here that we do not want to
        // execute on, such as retry counts. Nothing exists here that falls in to
        // this case, but should be accounted for when we add them.
        // && typeof op.opts === "undefined"
        ) {
            return op.hashedId;
        }
    }
    async filterNewSteps(foundSteps) {
        var _a, _b, _c, _d, _e, _f;
        if (this.options.requestedRunStep) {
            return;
        }
        /**
         * Gather any steps that aren't memoized and report them.
         */
        const newSteps = foundSteps.filter((step) => !step.fulfilled);
        if (!newSteps.length) {
            return;
        }
        /**
         * Warn if we've found new steps but haven't yet seen all previous
         * steps. This may indicate that step presence isn't determinate.
         */
        let knownSteps = 0;
        for (const step of foundSteps) {
            if (step.fulfilled) {
                knownSteps++;
            }
        }
        const foundAllCompletedSteps = this.state.stepsToFulfill === knownSteps;
        if (!foundAllCompletedSteps) {
            // TODO Tag
            console.warn((0, errors_js_1.prettyError)({
                type: "warn",
                whatHappened: "Function may be indeterminate",
                why: "We found new steps before seeing all previous steps, which may indicate that the function is non-deterministic.",
                consequences: "This may cause unexpected behaviour as Inngest executes your function.",
                reassurance: "This is expected if a function is updated in the middle of a run, but may indicate a bug if not.",
            }));
        }
        /**
         * We're finishing up; let's trigger the last of the hooks.
         */
        await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.afterMemoization) === null || _b === void 0 ? void 0 : _b.call(_a));
        await ((_d = (_c = this.state.hooks) === null || _c === void 0 ? void 0 : _c.beforeExecution) === null || _d === void 0 ? void 0 : _d.call(_c));
        await ((_f = (_e = this.state.hooks) === null || _e === void 0 ? void 0 : _e.afterExecution) === null || _f === void 0 ? void 0 : _f.call(_e));
        const stepList = newSteps.map((step) => ({
            displayName: step.displayName,
            op: step.op,
            id: step.hashedId,
            name: step.name,
            opts: step.opts,
        }));
        /**
         * We also run `onSendEvent` middleware hooks against `step.invoke()` steps
         * to ensure that their `data` is transformed correctly.
         */
        return await this.transformNewSteps(stepList);
    }
    /**
     * Using middleware, transform any newly-found steps before returning them to
     * an Inngest Server.
     */
    async transformNewSteps(steps) {
        return Promise.all(steps.map(async (step) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (step.op !== types_js_1.StepOpCode.InvokeFunction) {
                return step;
            }
            const onSendEventHooks = await (0, InngestMiddleware_js_1.getHookStack)(this.options.fn["middleware"], "onSendEvent", undefined, {
                transformInput: (prev, output) => {
                    return Object.assign(Object.assign({}, prev), output);
                },
                transformOutput: (prev, output) => {
                    return {
                        result: Object.assign(Object.assign({}, prev.result), output === null || output === void 0 ? void 0 : output.result),
                    };
                },
            });
            /**
             * For each event being sent, create a new `onSendEvent` hook stack to
             * process it. We do this as middleware hooks are intended to run once
             * during each lifecycle (onFunctionRun or onSendEvent) and here, a hook
             * is run for every single event.
             *
             * This is done because a developer can use this hook to filter out
             * events entirely; if we batch all of the events together, we can't
             * tell which ones were filtered out if we're processing >1 invocation
             * here.
             */
            const transformedPayload = await ((_a = onSendEventHooks.transformInput) === null || _a === void 0 ? void 0 : _a.call(onSendEventHooks, {
                payloads: [
                    Object.assign(Object.assign({}, ((_c = (_b = step.opts) === null || _b === void 0 ? void 0 : _b.payload) !== null && _c !== void 0 ? _c : {})), { name: consts_js_1.internalEvents.FunctionInvoked }),
                ],
            }));
            const newPayload = InngestStepTools_js_1.invokePayloadSchema.parse((_e = (_d = transformedPayload === null || transformedPayload === void 0 ? void 0 : transformedPayload.payloads) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : {});
            return Object.assign(Object.assign({}, step), { opts: Object.assign(Object.assign({}, step.opts), { payload: Object.assign(Object.assign({}, ((_g = (_f = step.opts) === null || _f === void 0 ? void 0 : _f.payload) !== null && _g !== void 0 ? _g : {})), newPayload) }) });
        }));
    }
    async executeStep({ id, name, opts, fn, displayName, }) {
        var _a, _b, _c, _d, _e;
        (_a = this.timeout) === null || _a === void 0 ? void 0 : _a.clear();
        await ((_c = (_b = this.state.hooks) === null || _b === void 0 ? void 0 : _b.afterMemoization) === null || _c === void 0 ? void 0 : _c.call(_b));
        await ((_e = (_d = this.state.hooks) === null || _d === void 0 ? void 0 : _d.beforeExecution) === null || _e === void 0 ? void 0 : _e.call(_d));
        const outgoingOp = {
            id,
            op: types_js_1.StepOpCode.StepRun,
            name,
            opts,
            displayName,
        };
        this.state.executingStep = outgoingOp;
        const store = await (0, als_js_1.getAsyncCtx)();
        if (store) {
            store.executingStep = {
                id,
                name: displayName,
            };
        }
        this.debug(`executing step "${id}"`);
        return ((0, promises_js_1.runAsPromise)(fn)
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .finally(async () => {
            var _a, _b;
            if (store) {
                delete store.executingStep;
            }
            await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.afterExecution) === null || _b === void 0 ? void 0 : _b.call(_a));
        })
            .then((data) => {
            return Object.assign(Object.assign({}, outgoingOp), { data });
        })
            .catch((error) => {
            return Object.assign(Object.assign({}, outgoingOp), { op: types_js_1.StepOpCode.StepError, 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                error });
        }));
    }
    /**
     * Starts execution of the user's function, including triggering checkpoints
     * and middleware hooks where appropriate.
     */
    async startExecution() {
        var _a, _b, _c, _d, _e, _f, _g;
        /**
         * Mutate input as neccessary based on middleware.
         */
        await this.transformInput();
        /**
         * Start the timer to time out the run if needed.
         */
        void ((_a = this.timeout) === null || _a === void 0 ? void 0 : _a.start());
        await ((_c = (_b = this.state.hooks) === null || _b === void 0 ? void 0 : _b.beforeMemoization) === null || _c === void 0 ? void 0 : _c.call(_b));
        /**
         * If we had no state to begin with, immediately end the memoization phase.
         */
        if (this.state.allStateUsed()) {
            await ((_e = (_d = this.state.hooks) === null || _d === void 0 ? void 0 : _d.afterMemoization) === null || _e === void 0 ? void 0 : _e.call(_d));
            await ((_g = (_f = this.state.hooks) === null || _f === void 0 ? void 0 : _f.beforeExecution) === null || _g === void 0 ? void 0 : _g.call(_f));
        }
        /**
         * Trigger the user's function.
         */
        (0, promises_js_1.runAsPromise)(() => this.userFnToRun(this.fnArg))
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .finally(async () => {
            var _a, _b, _c, _d, _e, _f;
            await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.afterMemoization) === null || _b === void 0 ? void 0 : _b.call(_a));
            await ((_d = (_c = this.state.hooks) === null || _c === void 0 ? void 0 : _c.beforeExecution) === null || _d === void 0 ? void 0 : _d.call(_c));
            await ((_f = (_e = this.state.hooks) === null || _e === void 0 ? void 0 : _e.afterExecution) === null || _f === void 0 ? void 0 : _f.call(_e));
        })
            .then((data) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.state.setCheckpoint({ type: "function-resolved", data });
        })
            .catch((error) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.state.setCheckpoint({ type: "function-rejected", error });
        });
    }
    /**
     * Using middleware, transform input before running.
     */
    async transformInput() {
        var _a, _b;
        const inputMutations = await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.transformInput) === null || _b === void 0 ? void 0 : _b.call(_a, {
            ctx: Object.assign({}, this.fnArg),
            steps: Object.values(this.state.stepState),
            fn: this.options.fn,
            reqArgs: this.options.reqArgs,
        }));
        if (inputMutations === null || inputMutations === void 0 ? void 0 : inputMutations.ctx) {
            this.fnArg = inputMutations.ctx;
        }
        if (inputMutations === null || inputMutations === void 0 ? void 0 : inputMutations.steps) {
            this.state.stepState = Object.fromEntries(inputMutations.steps.map((step) => [step.id, step]));
        }
    }
    /**
     * Using middleware, transform output before returning.
     */
    async transformOutput(dataOrError) {
        var _a, _b, _c, _d;
        const output = Object.assign({}, dataOrError);
        /**
         * If we've been given an error and it's one that we just threw from a step,
         * we should return a `NonRetriableError` to stop execution.
         */
        if (typeof output.error !== "undefined") {
            output.data = (0, errors_js_1.serializeError)(output.error);
        }
        const isStepExecution = Boolean(this.state.executingStep);
        const transformedOutput = await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.transformOutput) === null || _b === void 0 ? void 0 : _b.call(_a, {
            result: Object.assign({}, output),
            step: this.state.executingStep,
        }));
        const { data, error } = Object.assign(Object.assign({}, output), transformedOutput === null || transformedOutput === void 0 ? void 0 : transformedOutput.result);
        if (!isStepExecution) {
            await ((_d = (_c = this.state.hooks) === null || _c === void 0 ? void 0 : _c.finished) === null || _d === void 0 ? void 0 : _d.call(_c, {
                result: Object.assign({}, (typeof error !== "undefined" ? { error } : { data })),
            }));
        }
        if (typeof error !== "undefined") {
            /**
             * Ensure we give middleware the chance to decide on retriable behaviour
             * by looking at the error returned from output transformation.
             */
            let retriable = !(error instanceof NonRetriableError_js_1.NonRetriableError || error instanceof StepError_js_1.StepError);
            if (retriable && error instanceof RetryAfterError_js_1.RetryAfterError) {
                retriable = error.retryAfter;
            }
            const serializedError = (0, errors_js_1.minifyPrettyError)((0, errors_js_1.serializeError)(error));
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
    createExecutionState() {
        const d = (0, promises_js_1.createDeferredPromiseWithStack)();
        let checkpointResolve = d.deferred.resolve;
        const checkpointResults = d.results;
        const loop = (function (cleanUp) {
            return __asyncGenerator(this, arguments, function* () {
                try {
                    while (true) {
                        const res = (yield __await(checkpointResults.next())).value;
                        if (res) {
                            yield yield __await(res);
                        }
                    }
                }
                finally {
                    cleanUp === null || cleanUp === void 0 ? void 0 : cleanUp();
                }
            });
        })(() => {
            var _a;
            (_a = this.timeout) === null || _a === void 0 ? void 0 : _a.clear();
            void checkpointResults.return();
        });
        const stepsToFulfill = Object.keys(this.options.stepState).length;
        const state = {
            stepState: this.options.stepState,
            stepsToFulfill,
            steps: new Map(),
            loop,
            hasSteps: Boolean(stepsToFulfill),
            stepCompletionOrder: [...this.options.stepCompletionOrder],
            remainingStepsToBeSeen: new Set(this.options.stepCompletionOrder),
            setCheckpoint: (checkpoint) => {
                ({ resolve: checkpointResolve } = checkpointResolve(checkpoint));
            },
            allStateUsed: () => {
                return this.state.remainingStepsToBeSeen.size === 0;
            },
        };
        return state;
    }
    get ops() {
        return Object.fromEntries(this.state.steps);
    }
    createFnArg() {
        var _a, _b, _c, _d;
        const step = this.createStepTools();
        let fnArg = Object.assign(Object.assign({}, this.options.data), { step });
        /**
         * Handle use of the `onFailure` option by deserializing the error.
         */
        if (this.options.isFailureHandler) {
            const eventData = zod_1.z
                .object({ error: types_js_1.jsonErrorSchema })
                .parse((_a = fnArg.event) === null || _a === void 0 ? void 0 : _a.data);
            fnArg = Object.assign(Object.assign({}, fnArg), { error: (0, errors_js_1.deserializeError)(eventData.error) });
        }
        return (_d = (_c = (_b = this.options).transformCtx) === null || _c === void 0 ? void 0 : _c.call(_b, fnArg)) !== null && _d !== void 0 ? _d : fnArg;
    }
    createStepTools() {
        /**
         * A list of steps that have been found and are being rolled up before being
         * reported to the core loop.
         */
        const foundStepsToReport = new Map();
        /**
         * A map of the subset of found steps to report that have not yet been
         * handled. Used for fast access to steps that need to be handled in order.
         */
        const unhandledFoundStepsToReport = new Map();
        /**
         * A map of the latest sequential step indexes found for each step ID. Used
         * to ensure that we don't index steps in parallel.
         *
         * Note that these must be sequential; if we've seen or assigned `a:1`,
         * `a:2` and `a:4`, the latest sequential step index is `2`.
         *
         */
        const expectedNextStepIndexes = new Map();
        /**
         * An ordered list of step IDs that have yet to be handled in this
         * execution. Used to ensure that we handle steps in the order they were
         * found and based on the `stepCompletionOrder` in this execution's state.
         */
        const remainingStepCompletionOrder = this.state.stepCompletionOrder.slice();
        /**
         * A promise that's used to ensure that step reporting cannot be run more than
         * once in a given asynchronous time span.
         */
        let foundStepsReportPromise;
        /**
         * A promise that's used to represent middleware hooks running before
         * execution.
         */
        let beforeExecHooksPromise;
        /**
         * A flag used to ensure that we only warn about parallel indexing once per
         * execution to avoid spamming the console.
         */
        let warnOfParallelIndexing = false;
        /**
         * Counts the number of times we've extended this tick.
         */
        let tickExtensionCount = 0;
        /**
         * Given a colliding step ID, maybe warn the user about parallel indexing.
         */
        const maybeWarnOfParallelIndexing = (collisionId) => {
            if (warnOfParallelIndexing) {
                return;
            }
            const stepExists = this.state.steps.has(collisionId);
            if (stepExists) {
                const stepFoundThisTick = foundStepsToReport.has(collisionId);
                if (!stepFoundThisTick) {
                    warnOfParallelIndexing = true;
                    console.warn((0, errors_js_1.prettyError)({
                        type: "warn",
                        whatHappened: "We detected that you have multiple steps with the same ID.",
                        code: errors_js_1.ErrCode.AUTOMATIC_PARALLEL_INDEXING,
                        why: `This can happen if you're using the same ID for multiple steps across different chains of parallel work. We found the issue with step "${collisionId}".`,
                        reassurance: "Your function is still running, though it may exhibit unexpected behaviour.",
                        consequences: "Using the same IDs across parallel chains of work can cause unexpected behaviour.",
                        toFixNow: "We recommend using a unique ID for each step, especially those happening in parallel.",
                    }));
                }
            }
        };
        /**
         * A helper used to report steps to the core loop. Used after adding an item
         * to `foundStepsToReport`.
         */
        const reportNextTick = () => {
            // Being explicit instead of using `??=` to appease TypeScript.
            if (foundStepsReportPromise) {
                return;
            }
            let extensionPromise;
            if (++tickExtensionCount >= 10) {
                tickExtensionCount = 0;
                extensionPromise = new Promise((resolve) => setTimeout(resolve));
            }
            else {
                extensionPromise = (0, promises_js_1.resolveAfterPending)();
            }
            foundStepsReportPromise = extensionPromise
                /**
                 * Ensure that we wait for this promise to resolve before continuing.
                 *
                 * The groups in which steps are reported can affect how we detect some
                 * more complex determinism issues like parallel indexing. This promise
                 * can represent middleware hooks being run early, in the middle of
                 * ingesting steps to report.
                 *
                 * Because of this, it's important we wait for this middleware to resolve
                 * before continuing to report steps to ensure that all steps have a
                 * chance to be reported throughout this asynchronous action.
                 */
                .then(() => beforeExecHooksPromise)
                .then(() => {
                var _a;
                foundStepsReportPromise = undefined;
                for (let i = 0; i < remainingStepCompletionOrder.length; i++) {
                    const nextStepId = remainingStepCompletionOrder[i];
                    if (!nextStepId) {
                        // Strange - skip this empty index
                        continue;
                    }
                    const handled = (_a = unhandledFoundStepsToReport
                        .get(nextStepId)) === null || _a === void 0 ? void 0 : _a.handle();
                    if (handled) {
                        remainingStepCompletionOrder.splice(i, 1);
                        unhandledFoundStepsToReport.delete(nextStepId);
                        return void reportNextTick();
                    }
                }
                // If we've handled no steps in this "tick," roll up everything we've
                // found and report it.
                const steps = [...foundStepsToReport.values()];
                foundStepsToReport.clear();
                unhandledFoundStepsToReport.clear();
                return void this.state.setCheckpoint({
                    type: "steps-found",
                    steps: steps,
                });
            });
        };
        /**
         * A helper used to push a step to the list of steps to report.
         */
        const pushStepToReport = (step) => {
            foundStepsToReport.set(step.id, step);
            unhandledFoundStepsToReport.set(step.hashedId, step);
            reportNextTick();
        };
        const stepHandler = async ({ args, matchOp, opts, }) => {
            var _a, _b, _c, _d;
            await beforeExecHooksPromise;
            const stepOptions = (0, InngestStepTools_js_1.getStepOptions)(args[0]);
            const opId = matchOp(stepOptions, ...args.slice(1));
            if (this.state.executingStep) {
                /**
                 * If a step is found after asynchronous actions during another step's
                 * execution, everything is fine. The problem here is if we've found
                 * that a step nested inside another a step, which is something we don't
                 * support at the time of writing.
                 *
                 * In this case, we could use something like Async Hooks to understand
                 * how the step is being triggered, though this isn't available in all
                 * environments.
                 *
                 * Therefore, we'll only show a warning here to indicate that this is
                 * potentially an issue.
                 */
                console.warn((0, errors_js_1.prettyError)({
                    whatHappened: `We detected that you have nested \`step.*\` tooling in \`${(_a = opId.displayName) !== null && _a !== void 0 ? _a : opId.id}\``,
                    consequences: "Nesting `step.*` tooling is not supported.",
                    type: "warn",
                    reassurance: "It's possible to see this warning if steps are separated by regular asynchronous calls, which is fine.",
                    stack: true,
                    toFixNow: "Make sure you're not using `step.*` tooling inside of other `step.*` tooling. If you need to compose steps together, you can create a new async function and call it from within your step function, or use promise chaining.",
                    code: errors_js_1.ErrCode.NESTING_STEPS,
                }));
            }
            if (this.state.steps.has(opId.id)) {
                const originalId = opId.id;
                maybeWarnOfParallelIndexing(originalId);
                const expectedNextIndex = (_b = expectedNextStepIndexes.get(originalId)) !== null && _b !== void 0 ? _b : 1;
                for (let i = expectedNextIndex;; i++) {
                    const newId = originalId + InngestStepTools_js_1.STEP_INDEXING_SUFFIX + i;
                    if (!this.state.steps.has(newId)) {
                        expectedNextStepIndexes.set(originalId, i + 1);
                        opId.id = newId;
                        break;
                    }
                }
            }
            const { promise, resolve, reject } = (0, promises_js_1.createDeferredPromise)();
            const hashedId = exports._internals.hashId(opId.id);
            const stepState = this.state.stepState[hashedId];
            let isFulfilled = false;
            if (stepState) {
                stepState.seen = true;
                this.state.remainingStepsToBeSeen.delete(hashedId);
                if (typeof stepState.input === "undefined") {
                    isFulfilled = true;
                }
            }
            let extraOpts;
            let fnArgs = [...args];
            if (typeof (stepState === null || stepState === void 0 ? void 0 : stepState.input) !== "undefined" &&
                Array.isArray(stepState.input)) {
                switch (opId.op) {
                    // `step.run()` has its function input affected
                    case types_js_1.StepOpCode.StepPlanned: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        fnArgs = [...args.slice(0, 2), ...stepState.input];
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        extraOpts = { input: [...stepState.input] };
                        break;
                    }
                    // `step.ai.infer()` has its body affected
                    case types_js_1.StepOpCode.AiGateway: {
                        extraOpts = {
                            body: Object.assign(Object.assign({}, (typeof ((_c = opId.opts) === null || _c === void 0 ? void 0 : _c.body) === "object"
                                ? Object.assign({}, opId.opts.body) : {})), stepState.input[0]),
                        };
                        break;
                    }
                }
            }
            const step = Object.assign(Object.assign({}, opId), { opts: Object.assign(Object.assign({}, opId.opts), extraOpts), rawArgs: fnArgs, // TODO What is the right value here? Should this be raw args without affected input?
                hashedId, input: stepState === null || stepState === void 0 ? void 0 : stepState.input, 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fn: (opts === null || opts === void 0 ? void 0 : opts.fn) ? () => { var _a; return (_a = opts.fn) === null || _a === void 0 ? void 0 : _a.call(opts, ...fnArgs); } : undefined, promise, fulfilled: isFulfilled, hasStepState: Boolean(stepState), displayName: (_d = opId.displayName) !== null && _d !== void 0 ? _d : opId.id, handled: false, handle: () => {
                    if (step.handled) {
                        return false;
                    }
                    step.handled = true;
                    if (isFulfilled && stepState) {
                        stepState.fulfilled = true;
                        // For some execution scenarios such as testing, `data`, `error`,
                        // and `input` may be `Promises`. This could also be the case for
                        // future middleware applications. For this reason, we'll make sure
                        // the values are fully resolved before continuing.
                        void Promise.all([
                            stepState.data,
                            stepState.error,
                            stepState.input,
                        ]).then(() => {
                            if (typeof stepState.data !== "undefined") {
                                resolve(stepState.data);
                            }
                            else {
                                this.state.recentlyRejectedStepError = new StepError_js_1.StepError(opId.id, stepState.error);
                                reject(this.state.recentlyRejectedStepError);
                            }
                        });
                    }
                    return true;
                } });
            this.state.steps.set(opId.id, step);
            this.state.hasSteps = true;
            pushStepToReport(step);
            /**
             * If this is the last piece of state we had, we've now finished
             * memoizing.
             */
            if (!beforeExecHooksPromise && this.state.allStateUsed()) {
                await (beforeExecHooksPromise = (async () => {
                    var _a, _b, _c, _d;
                    await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.afterMemoization) === null || _b === void 0 ? void 0 : _b.call(_a));
                    await ((_d = (_c = this.state.hooks) === null || _c === void 0 ? void 0 : _c.beforeExecution) === null || _d === void 0 ? void 0 : _d.call(_c));
                })());
            }
            return promise;
        };
        return (0, InngestStepTools_js_1.createStepTools)(this.options.client, this, stepHandler);
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
        return this.options.fn["onFailureFn"];
    }
    initializeTimer(state) {
        if (!this.options.requestedRunStep) {
            return;
        }
        this.timeout = (0, promises_js_1.createTimeoutPromise)(this.timeoutDuration);
        void this.timeout.then(async () => {
            var _a, _b, _c, _d, _e, _f;
            await ((_b = (_a = this.state.hooks) === null || _a === void 0 ? void 0 : _a.afterMemoization) === null || _b === void 0 ? void 0 : _b.call(_a));
            await ((_d = (_c = this.state.hooks) === null || _c === void 0 ? void 0 : _c.beforeExecution) === null || _d === void 0 ? void 0 : _d.call(_c));
            await ((_f = (_e = this.state.hooks) === null || _e === void 0 ? void 0 : _e.afterExecution) === null || _f === void 0 ? void 0 : _f.call(_e));
            state.setCheckpoint({
                type: "step-not-found",
                step: {
                    id: this.options.requestedRunStep,
                    op: types_js_1.StepOpCode.StepNotFound,
                },
            });
        });
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
}
const hashId = (id) => {
    return (0, hash_js_1.sha1)().update(id).digest("hex");
};
const hashOp = (op) => {
    return Object.assign(Object.assign({}, op), { id: hashId(op.id) });
};
/**
 * Exported for testing.
 */
exports._internals = { hashOp, hashId };
//# sourceMappingURL=v1.js.map