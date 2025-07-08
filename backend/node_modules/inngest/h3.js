"use strict";
/**
 * An adapter for H3 to serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { createApp, eventHandler, toNodeListener } from "h3";
 * import { serve } from "inngest/h3";
 * import { createServer } from "node:http";
 * import { inngest } from "./inngest/client";
 * import fnA from "./inngest/fnA";
 *
 * const app = createApp();
 * app.use(
 *   "/api/inngest",
 *   eventHandler(
 *     serve({
 *       client: inngest,
 *       functions: [fnA],
 *     })
 *   )
 * );
 *
 * createServer(toNodeListener(app)).listen(process.env.PORT || 3000);
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const h3_1 = require("h3");
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
const env_js_1 = require("./helpers/env.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "h3";
/**
 * In h3, serve and register any declared functions with Inngest, making
 * them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { createApp, eventHandler, toNodeListener } from "h3";
 * import { serve } from "inngest/h3";
 * import { createServer } from "node:http";
 * import { inngest } from "./inngest/client";
 * import fnA from "./inngest/fnA";
 *
 * const app = createApp();
 * app.use(
 *   "/api/inngest",
 *   eventHandler(
 *     serve({
 *       client: inngest,
 *       functions: [fnA],
 *     })
 *   )
 * );
 *
 * createServer(toNodeListener(app)).listen(process.env.PORT || 3000);
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (event) => {
            return {
                body: () => (0, h3_1.readBody)(event),
                headers: (key) => (0, h3_1.getHeader)(event, key),
                method: () => event.method,
                url: () => {
                    var _a;
                    let scheme = "https";
                    if (((_a = (0, env_js_1.processEnv)("NODE_ENV")) !== null && _a !== void 0 ? _a : "dev").startsWith("dev")) {
                        scheme = "http";
                    }
                    return new URL(String(event.path), `${scheme}://${String((0, h3_1.getHeader)(event, "host"))}`);
                },
                queryString: (key) => {
                    const param = (0, h3_1.getQuery)(event)[key];
                    if (param) {
                        return String(param);
                    }
                },
                transformResponse: (actionRes) => {
                    const { res } = event.node;
                    res.statusCode = actionRes.status;
                    (0, h3_1.setHeaders)(event, actionRes.headers);
                    return (0, h3_1.send)(event, actionRes.body);
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=h3.js.map