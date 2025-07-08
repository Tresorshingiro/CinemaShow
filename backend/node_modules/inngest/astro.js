"use strict";
/**
 * An adapter for Astro to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * export const { GET, POST, PUT } = serve({
 *   client: inngest,
 *   functions: [fn1, fn2],
 * });
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
exports.frameworkName = "astro";
/**
 * In Astro, serve and register any declared functions with Inngest, making them
 * available to be triggered by events.
 *
 * @example
 * ```ts
 * export const { GET, POST, PUT } = serve({
 *   client: inngest,
 *   functions: [fn1, fn2],
 * });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const commHandler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName, fetch: fetch.bind(globalThis) }, options), { handler: ({ request: req }) => {
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
    const requestHandler = commHandler.createHandler();
    return Object.defineProperties(requestHandler, {
        GET: { value: requestHandler },
        POST: { value: requestHandler },
        PUT: { value: requestHandler },
    });
};
exports.serve = serve;
//# sourceMappingURL=astro.js.map