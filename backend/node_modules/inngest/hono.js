"use strict";
/**
 * An adapter for Hono to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * const handler = serve({
 *   client: inngest,
 *   functions
 * });
 *
 * app.use('/api/inngest',  async (c) => {
 *   return handler(c);
 * });
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const adapter_1 = require("hono/adapter");
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "hono";
/**
 * Using Hono, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * const handler = serve({
 *   client: inngest,
 *   functions
 * });
 *
 * app.use('/api/inngest',  async (c) => {
 *   return handler(c);
 * });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ fetch: fetch.bind(globalThis), frameworkName: exports.frameworkName }, options), { handler: (c) => {
            return {
                transformResponse: ({ headers, status, body }) => {
                    return c.body(body, { headers, status });
                },
                url: () => {
                    try {
                        // If this is an absolute URL, use it right now.
                        return new URL(c.req.url);
                    }
                    catch (_a) {
                        // no-op
                    }
                    // We now know that `c.req.url` is a relative URL, so let's try
                    // to build a base URL to pair it with.
                    const host = options.serveHost || c.req.header("host");
                    if (!host) {
                        throw new Error("No host header found in request and no `serveHost` given either.");
                    }
                    let baseUrl = host;
                    // Only set the scheme if we don't already have one, as a user may
                    // have specified the protocol in `serveHost` as a way to force it
                    // in their environment, e.g. for testing.
                    if (!baseUrl.includes("://")) {
                        let scheme = "https";
                        try {
                            // If we're in dev, assume `http` instead. Not that we directly
                            // access the environment instead of using any helpers here to
                            // ensure compatibility with tools with Webpack which will replace
                            // this with a literal.
                            // eslint-disable-next-line @inngest/internal/process-warn
                            if (process.env.NODE_ENV !== "production") {
                                scheme = "http";
                            }
                        }
                        catch (err) {
                            // no-op
                        }
                        baseUrl = `${scheme}://${baseUrl}`;
                    }
                    return new URL(c.req.url, baseUrl);
                },
                queryString: (key) => c.req.query(key),
                headers: (key) => c.req.header(key),
                method: () => c.req.method,
                body: () => c.req.json(),
                env: () => (0, adapter_1.env)(c),
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=hono.js.map