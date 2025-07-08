"use strict";
/**
 * An adapter for Koa to serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * const handler = serve({
 *   client: inngest,
 *   functions
 * });
 *
 * app.use((ctx) => {
 *   if (ctx.request.path === "/api/inngest") {
 *     return handler(ctx);
 *   }
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
exports.frameworkName = "koa";
/**
 * Using Koa, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * const handler = serve({
 *   client: inngest,
 *   functions
 * });
 *
 * app.use((ctx) => {
 *   if (ctx.request.path === "/api/inngest") {
 *     return handler(ctx);
 *   }
 * });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (ctx) => {
            return {
                method: () => ctx.method,
                body: () => ctx.request.body,
                headers: (key) => {
                    const header = ctx.headers[key];
                    if (Array.isArray(header)) {
                        return header[0];
                    }
                    return header;
                },
                queryString: (key) => {
                    const qs = ctx.query[key];
                    if (Array.isArray(qs)) {
                        return qs[0];
                    }
                    return qs;
                },
                url: () => {
                    const hostname = ctx.host;
                    const protocol = (hostname === null || hostname === void 0 ? void 0 : hostname.includes("://"))
                        ? ""
                        : `${ctx.protocol}://`;
                    const url = new URL(ctx.originalUrl, `${protocol}${hostname || ""}`);
                    return url;
                },
                transformResponse: ({ body, headers, status }) => {
                    for (const [name, value] of Object.entries(headers)) {
                        ctx.set(name, value);
                    }
                    ctx.status = status;
                    ctx.body = body;
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=koa.js.map