"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtInMiddleware = exports.Inngest = void 0;
const api_js_1 = require("../api/api.js");
const consts_js_1 = require("../helpers/consts.js");
const crypto_js_1 = require("../helpers/crypto.js");
const devserver_js_1 = require("../helpers/devserver.js");
const env_js_1 = require("../helpers/env.js");
const errors_js_1 = require("../helpers/errors.js");
const promises_js_1 = require("../helpers/promises.js");
const strings_js_1 = require("../helpers/strings.js");
const logger_js_1 = require("../middleware/logger.js");
const types_js_1 = require("../types.js");
const InngestFunction_js_1 = require("./InngestFunction.js");
const InngestMiddleware_js_1 = require("./InngestMiddleware.js");
/**
 * A client used to interact with the Inngest API by sending or reacting to
 * events.
 *
 * To provide event typing, see {@link EventSchemas}.
 *
 * ```ts
 * const inngest = new Inngest({ id: "my-app" });
 *
 * // or to provide event typing too
 * const inngest = new Inngest({
 *   id: "my-app",
 *   schemas: new EventSchemas().fromRecord<{
 *     "app/user.created": {
 *       data: { userId: string };
 *     };
 *   }>(),
 * });
 * ```
 *
 * @public
 */
class Inngest {
    get apiBaseUrl() {
        return this._apiBaseUrl;
    }
    get eventBaseUrl() {
        return this._eventBaseUrl;
    }
    get env() {
        var _a;
        return (_a = this.headers[consts_js_1.headerKeys.Environment]) !== null && _a !== void 0 ? _a : null;
    }
    get appVersion() {
        return this._appVersion;
    }
    /**
     * A client used to interact with the Inngest API by sending or reacting to
     * events.
     *
     * To provide event typing, see {@link EventSchemas}.
     *
     * ```ts
     * const inngest = new Inngest({ name: "My App" });
     *
     * // or to provide event typing too
     * const inngest = new Inngest({
     *   name: "My App",
     *   schemas: new EventSchemas().fromRecord<{
     *     "app/user.created": {
     *       data: { userId: string };
     *     };
     *   }>(),
     * });
     * ```
     */
    constructor(options) {
        /**
         * Inngest event key, used to send events to Inngest Cloud.
         */
        this.eventKey = "";
        /**
         * The absolute URL of the Inngest Cloud API.
         */
        this.sendEventUrl = new URL(`e/${this.eventKey}`, consts_js_1.defaultInngestEventBaseUrl);
        this.localFns = [];
        this.createFunction = (rawOptions, rawTrigger, handler) => {
            const fn = this._createFunction(rawOptions, rawTrigger, handler);
            this.localFns.push(fn);
            return fn;
        };
        this._createFunction = (rawOptions, rawTrigger, handler) => {
            const options = this.sanitizeOptions(rawOptions);
            const triggers = this.sanitizeTriggers(rawTrigger);
            return new InngestFunction_js_1.InngestFunction(this, Object.assign(Object.assign({}, options), { triggers }), handler);
        };
        this.options = options;
        const { id, fetch, logger = new logger_js_1.DefaultLogger(), middleware, isDev, schemas, appVersion, } = this.options;
        if (!id) {
            // TODO PrettyError
            throw new Error("An `id` must be passed to create an Inngest instance.");
        }
        this.id = id;
        this._mode = (0, env_js_1.getMode)({
            explicitMode: typeof isDev === "boolean" ? (isDev ? "dev" : "cloud") : undefined,
        });
        this.fetch = (0, env_js_1.getFetch)(fetch);
        this.inngestApi = new api_js_1.InngestApi({
            baseUrl: this.apiBaseUrl,
            signingKey: (0, env_js_1.processEnv)(consts_js_1.envKeys.InngestSigningKey) || "",
            signingKeyFallback: (0, env_js_1.processEnv)(consts_js_1.envKeys.InngestSigningKeyFallback),
            fetch: this.fetch,
            mode: this.mode,
        });
        this.schemas = schemas;
        this.loadModeEnvVars();
        this.logger = logger;
        this.middleware = this.initializeMiddleware([
            ...exports.builtInMiddleware,
            ...(middleware || []),
        ]);
        this._appVersion = appVersion;
    }
    /**
     * Returns a `Promise` that resolves when the app is ready and all middleware
     * has been initialized.
     */
    get ready() {
        return this.middleware.then(() => { });
    }
    /**
     * Set the environment variables for this client. This is useful if you are
     * passed environment variables at runtime instead of as globals and need to
     * update the client with those values as requests come in.
     */
    setEnvVars(env = (0, env_js_1.allProcessEnv)()) {
        this.mode = (0, env_js_1.getMode)({ env, client: this });
        return this;
    }
    loadModeEnvVars() {
        this._apiBaseUrl =
            this.options.baseUrl ||
                this.mode["env"][consts_js_1.envKeys.InngestApiBaseUrl] ||
                this.mode["env"][consts_js_1.envKeys.InngestBaseUrl] ||
                this.mode.getExplicitUrl(consts_js_1.defaultInngestApiBaseUrl);
        this._eventBaseUrl =
            this.options.baseUrl ||
                this.mode["env"][consts_js_1.envKeys.InngestEventApiBaseUrl] ||
                this.mode["env"][consts_js_1.envKeys.InngestBaseUrl] ||
                this.mode.getExplicitUrl(consts_js_1.defaultInngestEventBaseUrl);
        this.setEventKey(this.options.eventKey || this.mode["env"][consts_js_1.envKeys.InngestEventKey] || "");
        this.headers = (0, env_js_1.inngestHeaders)({
            inngestEnv: this.options.env,
            env: this.mode["env"],
        });
        this.inngestApi["mode"] = this.mode;
        this.inngestApi["apiBaseUrl"] = this._apiBaseUrl;
    }
    /**
     * Initialize all passed middleware, running the `register` function on each
     * in sequence and returning the requested hook registrations.
     */
    async initializeMiddleware(middleware = [], opts) {
        var _a;
        /**
         * Wait for the prefix stack to run first; do not trigger ours before this
         * is complete.
         */
        const prefix = await ((_a = opts === null || opts === void 0 ? void 0 : opts.prefixStack) !== null && _a !== void 0 ? _a : []);
        const stack = middleware.reduce(async (acc, m) => {
            // Be explicit about waiting for the previous middleware to finish
            const prev = await acc;
            const next = await m.init(Object.assign({ client: this }, opts === null || opts === void 0 ? void 0 : opts.registerInput));
            return [...prev, next];
        }, Promise.resolve([]));
        return [...prefix, ...(await stack)];
    }
    get mode() {
        return this._mode;
    }
    set mode(m) {
        this._mode = m;
        this.loadModeEnvVars();
    }
    /**
     * Given a response from Inngest, relay the error to the caller.
     */
    async getResponseError(response, rawBody, foundErr = "Unknown error") {
        let errorMessage = foundErr;
        if (errorMessage === "Unknown error") {
            switch (response.status) {
                case 401:
                    errorMessage = "Event key Not Found";
                    break;
                case 400:
                    errorMessage = "Cannot process event payload";
                    break;
                case 403:
                    errorMessage = "Forbidden";
                    break;
                case 404:
                    errorMessage = "Event key not found";
                    break;
                case 406:
                    errorMessage = `${JSON.stringify(await rawBody)}`;
                    break;
                case 409:
                case 412:
                    errorMessage = "Event transformation failed";
                    break;
                case 413:
                    errorMessage = "Event payload too large";
                    break;
                case 500:
                    errorMessage = "Internal server error";
                    break;
                default:
                    try {
                        errorMessage = await response.text();
                    }
                    catch (err) {
                        errorMessage = `${JSON.stringify(await rawBody)}`;
                    }
                    break;
            }
        }
        return new Error(`Inngest API Error: ${response.status} ${errorMessage}`);
    }
    /**
     * Set the event key for this instance of Inngest. This is useful if for some
     * reason the key is not available at time of instantiation or present in the
     * `INNGEST_EVENT_KEY` environment variable.
     */
    setEventKey(
    /**
     * Inngest event key, used to send events to Inngest Cloud. Use this is your
     * key is for some reason not available at time of instantiation or present
     * in the `INNGEST_EVENT_KEY` environment variable.
     */
    eventKey) {
        this.eventKey = eventKey || consts_js_1.dummyEventKey;
        this.sendEventUrl = new URL(`e/${this.eventKey}`, this.eventBaseUrl || consts_js_1.defaultInngestEventBaseUrl);
    }
    eventKeySet() {
        return Boolean(this.eventKey) && this.eventKey !== consts_js_1.dummyEventKey;
    }
    /**
     * EXPERIMENTAL: This API is not yet stable and may change in the future
     * without a major version bump.
     *
     * Send a Signal to Inngest.
     */
    async sendSignal({ signal, data, env, }) {
        const headers = Object.assign({}, (env ? { [consts_js_1.headerKeys.Environment]: env } : {}));
        return this._sendSignal({ signal, data, headers });
    }
    async _sendSignal({ signal, data, headers, }) {
        var _a;
        const res = await this.inngestApi.sendSignal({ signal, data }, Object.assign(Object.assign({}, this.headers), headers));
        if (res.ok) {
            return res.value;
        }
        throw new Error(`Failed to send signal: ${((_a = res.error) === null || _a === void 0 ? void 0 : _a.error) || "Unknown error"}`);
    }
    /**
     * Send one or many events to Inngest. Takes an entire payload (including
     * name) as each input.
     *
     * ```ts
     * await inngest.send({ name: "app/user.created", data: { id: 123 } });
     * ```
     *
     * Returns a promise that will resolve if the event(s) were sent successfully,
     * else throws with an error explaining what went wrong.
     *
     * If you wish to send an event with custom types (i.e. one that hasn't been
     * generated), make sure to add it when creating your Inngest instance, like
     * so:
     *
     * ```ts
     * const inngest = new Inngest({
     *   name: "My App",
     *   schemas: new EventSchemas().fromRecord<{
     *     "my/event": {
     *       name: "my/event";
     *       data: { bar: string };
     *     };
     *   }>(),
     * });
     * ```
     */
    async send(payload, options) {
        const headers = Object.assign({}, ((options === null || options === void 0 ? void 0 : options.env) ? { [consts_js_1.headerKeys.Environment]: options.env } : {}));
        return this._send({ payload, headers });
    }
    /**
     * Internal method for sending an event, used to allow Inngest internals to
     * further customize the request sent to an Inngest Server.
     */
    async _send({ payload, headers, }) {
        var _a;
        const nowMillis = new Date().getTime();
        let maxAttempts = 5;
        // Attempt to set the event ID seed header. If it fails then disable retries
        // (but we still want to send the event).
        try {
            const entropy = (0, crypto_js_1.createEntropy)(10);
            const entropyBase64 = Buffer.from(entropy).toString("base64");
            headers = Object.assign(Object.assign({}, headers), { [consts_js_1.headerKeys.EventIdSeed]: `${nowMillis},${entropyBase64}` });
        }
        catch (err) {
            let message = "Event-sending retries disabled";
            if (err instanceof Error) {
                message += `: ${err.message}`;
            }
            console.debug(message);
            // Disable retries.
            maxAttempts = 1;
        }
        const hooks = await (0, InngestMiddleware_js_1.getHookStack)(this.middleware, "onSendEvent", undefined, {
            transformInput: (prev, output) => {
                return Object.assign(Object.assign({}, prev), output);
            },
            transformOutput(prev, output) {
                return {
                    result: Object.assign(Object.assign({}, prev.result), output === null || output === void 0 ? void 0 : output.result),
                };
            },
        });
        let payloads = Array.isArray(payload)
            ? payload
            : payload
                ? [payload]
                : [];
        const inputChanges = await ((_a = hooks.transformInput) === null || _a === void 0 ? void 0 : _a.call(hooks, {
            payloads: [...payloads],
        }));
        if (inputChanges === null || inputChanges === void 0 ? void 0 : inputChanges.payloads) {
            payloads = [...inputChanges.payloads];
        }
        // Ensure that we always add "ts" and "data" fields to events. "ts" is auto-
        // filled by the event server so is safe, and adding here fixes Next.js
        // server action cache issues.
        payloads = payloads.map((p) => {
            return Object.assign(Object.assign({}, p), { 
                // Always generate an idempotency ID for an event for retries
                id: p.id, ts: p.ts || nowMillis, 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                data: p.data || {} });
        });
        const applyHookToOutput = async (arg) => {
            var _a;
            const hookOutput = await ((_a = hooks.transformOutput) === null || _a === void 0 ? void 0 : _a.call(hooks, arg));
            return Object.assign(Object.assign({}, arg.result), hookOutput === null || hookOutput === void 0 ? void 0 : hookOutput.result);
        };
        /**
         * It can be valid for a user to send an empty list of events; if this
         * happens, show a warning that this may not be intended, but don't throw.
         */
        if (!payloads.length) {
            console.warn((0, errors_js_1.prettyError)({
                type: "warn",
                whatHappened: "`inngest.send()` called with no events",
                reassurance: "This is not an error, but you may not have intended to do this.",
                consequences: "The returned promise will resolve, but no events have been sent to Inngest.",
                stack: true,
            }));
            return await applyHookToOutput({ result: { ids: [] } });
        }
        // When sending events, check if the dev server is available.  If so, use the
        // dev server.
        let url = this.sendEventUrl.href;
        /**
         * If in prod mode and key is not present, fail now.
         */
        if (this.mode.isCloud && !this.eventKeySet()) {
            throw new Error((0, errors_js_1.prettyError)({
                whatHappened: "Failed to send event",
                consequences: "Your event or events were not sent to Inngest.",
                why: "We couldn't find an event key to use to send events to Inngest.",
                toFixNow: errors_js_1.fixEventKeyMissingSteps,
            }));
        }
        /**
         * If dev mode has been inferred, try to hit the dev server first to see if
         * it exists. If it does, use it, otherwise fall back to whatever server we
         * have configured.
         *
         * `INNGEST_BASE_URL` is used to set both dev server and prod URLs, so if a
         * user has set this it means they have already chosen a URL to hit.
         */
        if (this.mode.isDev && this.mode.isInferred && !this.eventBaseUrl) {
            const devAvailable = await (0, devserver_js_1.devServerAvailable)(consts_js_1.defaultDevServerHost, this.fetch);
            if (devAvailable) {
                url = (0, devserver_js_1.devServerUrl)(consts_js_1.defaultDevServerHost, `e/${this.eventKey}`).href;
            }
        }
        const body = await (0, promises_js_1.retryWithBackoff)(async () => {
            let rawBody;
            let body;
            // We don't need to do fallback auth here because this uses event keys and
            // not signing keys
            const response = await this.fetch(url, {
                method: "POST",
                body: (0, strings_js_1.stringify)(payloads),
                headers: Object.assign(Object.assign({}, this.headers), headers),
            });
            try {
                rawBody = await response.json();
                body = await types_js_1.sendEventResponseSchema.parseAsync(rawBody);
            }
            catch (err) {
                throw await this.getResponseError(response, rawBody);
            }
            if (body.status !== 200 || body.error) {
                throw await this.getResponseError(response, rawBody, body.error);
            }
            return body;
        }, {
            maxAttempts,
            baseDelay: 100,
        });
        return await applyHookToOutput({ result: { ids: body.ids } });
    }
    get funcs() {
        return this.localFns;
    }
    /**
     * Runtime-only validation.
     */
    sanitizeOptions(options) {
        if (Object.prototype.hasOwnProperty.call(options, "fns")) {
            // v2 -> v3 migration warning
            console.warn(`${consts_js_1.logPrefix} InngestFunction: \`fns\` option has been deprecated in v3; use \`middleware\` instead. See https://www.inngest.com/docs/sdk/migration`);
        }
        if (typeof options === "string") {
            // v2 -> v3 runtime migraton warning
            console.warn(`${consts_js_1.logPrefix} InngestFunction: Creating a function with a string as the first argument has been deprecated in v3; pass an object instead. See https://www.inngest.com/docs/sdk/migration`);
            return { id: options };
        }
        return options;
    }
    /**
     * Runtime-only validation.
     */
    sanitizeTriggers(triggers) {
        if (typeof triggers === "string") {
            // v2 -> v3 migration warning
            console.warn(`${consts_js_1.logPrefix} InngestFunction: Creating a function with a string as the second argument has been deprecated in v3; pass an object instead. See https://www.inngest.com/docs/sdk/migration`);
            return [{ event: triggers }];
        }
        if (!Array.isArray(triggers)) {
            return [triggers];
        }
        return triggers;
    }
}
exports.Inngest = Inngest;
/**
 * Default middleware that is included in every client, placed after the user's
 * middleware on the client but before function-level middleware.
 *
 * It is defined here to ensure that comments are included in the generated TS
 * definitions. Without this, we infer the stack of built-in middleware without
 * comments, losing a lot of value.
 *
 * If this is moved, please ensure that using this package in another project
 * can correctly access comments on mutated input and output.
 *
 * This return pattern mimics the output of a `satisfies` suffix; it's used as
 * we support versions of TypeScript prior to the introduction of `satisfies`.
 */
exports.builtInMiddleware = ((m) => m)([
    new InngestMiddleware_js_1.InngestMiddleware({
        name: "Inngest: Logger",
        init({ client }) {
            return {
                onFunctionRun(arg) {
                    const { ctx } = arg;
                    const metadata = {
                        runID: ctx.runId,
                        eventName: ctx.event.name,
                        functionName: arg.fn.name,
                    };
                    let providedLogger = client["logger"];
                    // create a child logger if the provided logger has child logger implementation
                    try {
                        if ("child" in providedLogger) {
                            providedLogger = providedLogger.child(metadata);
                        }
                    }
                    catch (err) {
                        console.error('failed to create "childLogger" with error: ', err);
                        // no-op
                    }
                    const logger = new logger_js_1.ProxyLogger(providedLogger);
                    return {
                        transformInput() {
                            return {
                                ctx: {
                                    /**
                                     * The passed in logger from the user.
                                     * Defaults to a console logger if not provided.
                                     */
                                    logger: logger,
                                },
                            };
                        },
                        beforeExecution() {
                            logger.enable();
                        },
                        transformOutput({ result: { error } }) {
                            if (error) {
                                logger.error(error);
                            }
                        },
                        async beforeResponse() {
                            await logger.flush();
                        },
                    };
                },
            };
        },
    }),
]);
//# sourceMappingURL=Inngest.js.map