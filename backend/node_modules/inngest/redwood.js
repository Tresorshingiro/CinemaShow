"use strict";
/**
 * An adapter for AWS Lambda to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/redwood";
 * import { inngest } from "src/inngest/client";
 * import fnA from "src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 *   servePath: "/api/inngest",
 * });
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
exports.frameworkName = "redwoodjs";
/**
 * In Redwood.js, serve and register any declared functions with Inngest, making
 * them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/redwood";
 * import { inngest } from "src/inngest/client";
 * import fnA from "src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 *   servePath: "/api/inngest",
 * });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (event, _context) => {
            return {
                body: () => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return JSON.parse(event.body
                        ? event.isBase64Encoded
                            ? Buffer.from(event.body, "base64").toString()
                            : event.body
                        : "{}");
                },
                headers: (key) => event.headers[key],
                method: () => event.httpMethod,
                url: () => {
                    const scheme = (0, env_js_1.processEnv)("NODE_ENV") === "development" ? "http" : "https";
                    const url = new URL(event.path, `${scheme}://${event.headers.host || ""}`);
                    return url;
                },
                queryString: (key) => { var _a; return (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a[key]; },
                transformResponse: ({ body, status: statusCode, headers, }) => {
                    return { body, statusCode, headers };
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=redwood.js.map