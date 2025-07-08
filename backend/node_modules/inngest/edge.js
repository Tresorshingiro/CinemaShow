"use strict";
/**
 * An adapter for any request that handles standard Web APIs such as `fetch`,
 * `Request,` and `Response` to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * This is reused by many other adapters, but can be used directly.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/edge";
 * import functions from "~/inngest";
 *
 * export const handler = serve({ id: "my-edge-app", functions });
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "edge";
/**
 * In an edge runtime, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * The edge runtime is a generic term for any serverless runtime that supports
 * only standard Web APIs such as `fetch`, `Request`, and `Response`, such as
 * Cloudflare Workers, Vercel Edge Functions, and AWS Lambda@Edge.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/edge";
 * import functions from "~/inngest";
 *
 * export const handler = serve({ id: "my-edge-app", functions });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName, fetch: fetch.bind(globalThis) }, options), { handler: (req) => {
            return {
                body: () => req.json(),
                headers: (key) => req.headers.get(key),
                method: () => req.method,
                url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
                transformResponse: ({ body, status, headers }) => {
                    return new Response(body, { status, headers });
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=edge.js.map