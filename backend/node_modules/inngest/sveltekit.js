"use strict";
/**
 * An adapter for SvelteKit to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * // app/routes/api.inngest.ts
 * // (for Remix 1, use app/routes/api/inngest.ts)
 * import { serve } from "inngest/remix";
 * import { inngest } from "~/inngest/client";
 * import fnA from "~/inngest/fnA";
 *
 * const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 *
 * export { handler as action, handler as loader };
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
const env_js_1 = require("./helpers/env.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "sveltekit";
/**
 * Using SvelteKit, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * // app/routes/api.inngest.ts
 * // (for Remix 1, use app/routes/api/inngest.ts)
 * import { serve } from "inngest/remix";
 * import { inngest } from "~/inngest/client";
 * import fnA from "~/inngest/fnA";
 *
 * const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 *
 * export { handler as action, handler as loader };
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (reqMethod, event) => {
            return {
                method: () => reqMethod || event.request.method || "",
                body: () => event.request.json(),
                headers: (key) => event.request.headers.get(key),
                url: () => {
                    const protocol = (0, env_js_1.processEnv)("NODE_ENV") === "development" ? "http" : "https";
                    return new URL(event.request.url, `${protocol}://${event.request.headers.get("host") || options.serveHost || ""}`);
                },
                transformResponse: ({ body, headers, status }) => {
                    /**
                     * If `Response` isn't included in this environment, it's probably a
                     * Node env that isn't already polyfilling. In this case, we can
                     * polyfill it here to be safe.
                     */
                    let Res;
                    if (typeof Response === "undefined") {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
                        Res = require("cross-fetch").Response;
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        Res = Response;
                    }
                    return new Res(body, { status, headers });
                },
            };
        } }));
    const baseFn = handler.createHandler();
    const fn = baseFn.bind(null, undefined);
    const handlerFn = Object.defineProperties(fn, {
        GET: { value: baseFn.bind(null, "GET") },
        POST: { value: baseFn.bind(null, "POST") },
        PUT: { value: baseFn.bind(null, "PUT") },
    });
    return handlerFn;
};
exports.serve = serve;
//# sourceMappingURL=sveltekit.js.map