"use strict";
/**
 * An adapter for Bun to serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/bun";
 * import { functions, inngest } from "./inngest";
 *
 * Bun.serve({
 *   port: 3000,
 *   fetch(request: Request) {
 *     const url = new URL(request.url);
 *
 *     if (url.pathname === "/api/inngest") {
 *       return serve({ client: inngest, functions })(request);
 *     }
 *
 *     return new Response("Not found", { status: 404 });
 *   },
 * });
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const edge_js_1 = require("./edge.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "bun";
/**
 * Using `Bun.serve()`, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/bun";
 * import { functions, inngest } from "./inngest";
 *
 * Bun.serve({
 *   port: 3000,
 *   fetch(request: Request) {
 *     const url = new URL(request.url);
 *
 *     if (url.pathname === "/api/inngest") {
 *       return serve({ client: inngest, functions })(request);
 *     }
 *
 *     return new Response("Not found", { status: 404 });
 *   },
 * });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const optsOverrides = Object.assign(Object.assign({}, options), { frameworkName: exports.frameworkName });
    return (0, edge_js_1.serve)(optsOverrides);
};
exports.serve = serve;
//# sourceMappingURL=bun.js.map