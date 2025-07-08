"use strict";
/**
 * An adapter for AWS Lambda to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 *
 * ```ts
 * import { Inngest } from "inngest";
 * import { serve } from "inngest/lambda";
 *
 * const inngest = new Inngest({ id: "my-lambda-app" });
 *
 * const fn = inngest.createFunction(
 *   { id: "hello-world" },
 *   { event: "test/hello.world" },
 *   async ({ event }) => {
 *    return "Hello World";
 *  }
 * );
 *
 * export const handler = serve({ client: inngest, functions: [fn] });
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
exports.frameworkName = "aws-lambda";
/**
 * With AWS Lambda, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 *
 * ```ts
 * import { Inngest } from "inngest";
 * import { serve } from "inngest/lambda";
 *
 * const inngest = new Inngest({ id: "my-lambda-app" });
 *
 * const fn = inngest.createFunction(
 *   { id: "hello-world" },
 *   { event: "test/hello.world" },
 *   async ({ event }) => {
 *    return "Hello World";
 *  }
 * );
 *
 * export const handler = serve({ client: inngest, functions: [fn] });
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (event, _context) => {
            /**
             * Try to handle multiple incoming event types, as Lambda can have many
             * triggers.
             *
             * This still doesn't handle all cases, but it's a start.
             */
            const eventIsV2 = ((ev) => {
                return ev.version === "2.0";
            })(event);
            // Create a map of headers
            const headersMap = new Map([
                ...Object.entries(event.headers).map(([key, value]) => [key.toLowerCase().trim(), value]),
            ]);
            const getHeader = (key) => {
                return headersMap.get(key.toLowerCase().trim());
            };
            return {
                body: () => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return JSON.parse(event.body
                        ? event.isBase64Encoded
                            ? Buffer.from(event.body, "base64").toString()
                            : event.body
                        : "{}");
                },
                headers: getHeader,
                method: () => {
                    return eventIsV2
                        ? event.requestContext.http.method
                        : event.httpMethod;
                },
                url: () => {
                    const path = eventIsV2 ? event.requestContext.http.path : event.path;
                    const proto = getHeader("x-forwarded-proto") || "https";
                    const url = new URL(path, `${proto}://${getHeader("host") || ""}`);
                    return url;
                },
                queryString: (key) => {
                    var _a;
                    return (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a[key];
                },
                transformResponse: ({ body, status: statusCode, headers, }) => {
                    return Promise.resolve({ body, statusCode, headers });
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=lambda.js.map