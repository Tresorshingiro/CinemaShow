"use strict";
/**
 * An adapter for Remix to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/remix";
 * import functions from "~/inngest";
 *
 * const handler = serve({ id: "my-remix-app", functions });
 *
 * export { handler as loader, handler as action };
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const zod_1 = require("zod");
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "remix";
const createNewResponse = ({ body, status, headers, }) => {
    /**
     * If `Response` isn't included in this environment, it's probably a Node env
     * that isn't already polyfilling. In this case, we can polyfill it here to be
     * safe.
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
    return new Res(body, {
        status,
        headers,
    });
};
/**
 * In Remix, serve and register any declared functions with Inngest, making them
 * available to be triggered by events.
 *
 * Remix requires that you export both a "loader" for serving `GET` requests,
 * and an "action" for serving other requests, therefore exporting both is
 * required.
 *
 * See {@link https://remix.run/docs/en/v1/guides/resource-routes}
 *
 * @example
 * ```ts
 * import { serve } from "inngest/remix";
 * import functions from "~/inngest";
 *
 * const handler = serve({ id: "my-remix-app", functions });
 *
 * export { handler as loader, handler as action };
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const contextSchema = zod_1.z.object({
        env: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    });
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: ({ request: req, context, }) => {
            return {
                env: () => {
                    const ctxParse = contextSchema.safeParse(context);
                    if (ctxParse.success && Object.keys(ctxParse.data.env).length) {
                        return ctxParse.data.env;
                    }
                },
                body: () => req.json(),
                headers: (key) => req.headers.get(key),
                method: () => req.method,
                url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
                transformResponse: createNewResponse,
                transformStreamingResponse: createNewResponse,
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=remix.js.map