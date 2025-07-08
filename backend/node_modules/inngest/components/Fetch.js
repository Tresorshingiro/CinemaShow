"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = void 0;
const debug_1 = __importDefault(require("debug"));
const als_js_1 = require("./execution/als.js");
const InngestStepTools_js_1 = require("./InngestStepTools.js");
const globalFetch = globalThis.fetch;
const debug = (0, debug_1.default)("inngest:fetch");
const createFetchShim = () => {
    // eslint-disable-next-line prefer-const
    let stepFetch;
    const fetch = async (input, init) => {
        const ctx = await (0, als_js_1.getAsyncCtx)();
        if (!ctx) {
            // Not in a function run
            if (!stepFetch.fallback) {
                // TODO Tell the user how to solve
                throw new Error("step.fetch() called outside of a function and had no fallback set");
            }
            debug("step.fetch() called outside of a function; falling back to global fetch");
            return stepFetch.fallback(input, init);
        }
        // In a function run
        if (ctx.executingStep) {
            // Inside a step
            if (!stepFetch.fallback) {
                // TODO Tell the user how to solve
                throw new Error(`step.fetch() called inside step "${ctx.executingStep.id}" and had no fallback set`);
            }
            debug(`step.fetch() called inside step "${ctx.executingStep.id}"; falling back to global fetch`);
            return stepFetch.fallback(input, init);
        }
        const targetUrl = new URL(input instanceof Request ? input.url : input.toString());
        debug("step.fetch() shimming request to", targetUrl.hostname);
        // Purposefully do not try/cacth this; if it throws then we treat that as a
        // regular `fetch()` throw, which also would not return a `Response`.
        const jsonRes = await ctx.ctx.step[InngestStepTools_js_1.gatewaySymbol](`step.fetch: ${targetUrl.hostname}`, input, init);
        return new Response(jsonRes.body, {
            headers: jsonRes.headers,
            status: jsonRes.status,
        });
    };
    const optionsRef = {
        fallback: globalFetch,
    };
    const extras = Object.assign({ config: (options) => {
            Object.assign(optionsRef, options);
            Object.assign(stepFetch, optionsRef);
            return stepFetch;
        } }, optionsRef);
    stepFetch = Object.assign(fetch, extras);
    return stepFetch;
};
/**
 * `fetch` is a Fetch API-compatible function that can be used to make any HTTP
 * code durable if it's called within an Inngest function.
 *
 * It will gracefully fall back to the global `fetch` if called outside of this
 * context, and a custom fallback can be set using the `config` method.
 *
 * @example Basic usage
 * ```ts
 * import { fetch } from "inngest";
 *
 * const api = new MyProductApi({ fetch });
 * ```
 *
 * @example Setting a custom fallback
 * ```ts
 * import { fetch } from "inngest";
 *
 * const api = new MyProductApi({
 *            fetch: fetch.config({ fallback: myCustomFetch }),
 * });
 * ```
 *
 * @example Do not allow fallback
 * ```ts
 * import { fetch } from "inngest";
 *
 * const api = new MyProductApi({
 *            fetch: fetch.config({ fallback: undefined }),
 * });
 * ```
 */
exports.fetch = createFetchShim();
//# sourceMappingURL=Fetch.js.map