"use strict";
/**
 * An adapter for Deno's Fresh to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "https://esm.sh/inngest/deno/fresh";
 * import { inngest } from "./src/inngest/client.ts";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const InngestCommHandler_js_1 = require("../components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "deno/fresh";
/**
 * With Deno's Fresh framework, serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "https://esm.sh/inngest/deno/fresh";
 * import { inngest } from "./src/inngest/client.ts";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (req, env) => {
            return {
                body: () => req.json(),
                headers: (key) => req.headers.get(key),
                method: () => req.method,
                env: () => env,
                url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
                transformResponse: ({ body, status, headers }) => {
                    return new Response(body, { status, headers });
                },
            };
        } }));
    const fn = handler.createHandler();
    return function handleRequest(req, ...other) {
        return fn(req, Deno.env.toObject(), ...other);
    };
};
exports.serve = serve;
//# sourceMappingURL=fresh.js.map