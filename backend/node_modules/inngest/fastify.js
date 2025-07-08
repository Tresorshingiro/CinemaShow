"use strict";
/**
 * An adapter for Fastify to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example Plugin (recommended)
 * ```ts
 * import Fastify from "fastify";
 * import inngestFastify from "inngest/fastify";
 * import { inngest, fnA } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.register(inngestFastify, {
 *   client: inngest,
 *   functions: [fnA],
 *   options: {},
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @example Route
 * ```ts
 * import Fastify from "fastify";
 * import { serve } from "inngest/fastify";
 * import { fnA, inngest } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.route({
 *   method: ["GET", "POST", "PUT"],
 *   handler: serve({ client: inngest, functions: [fnA] }),
 *   url: "/api/inngest",
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fastifyPlugin = exports.serve = exports.frameworkName = void 0;
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "fastify";
/**
 * Serve and register any declared functions with Inngest, making them available
 * to be triggered by events.
 *
 * It's recommended to use the Fastify plugin to serve your functions with
 * Inngest instead of using this `serve()` function directly.
 *
 * @example
 * ```ts
 * import Fastify from "fastify";
 * import { serve } from "inngest/fastify";
 * import { fnA, inngest } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.route({
 *   method: ["GET", "POST", "PUT"],
 *   handler: serve({ client: inngest, functions: [fnA] }),
 *   url: "/api/inngest",
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @public
 */
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (req, reply) => {
            return {
                body: () => req.body,
                headers: (key) => {
                    const header = req.headers[key];
                    return Array.isArray(header) ? header[0] : header;
                },
                method: () => req.method,
                url: () => {
                    const hostname = req.headers["host"];
                    const protocol = (hostname === null || hostname === void 0 ? void 0 : hostname.includes("://"))
                        ? ""
                        : `${req.protocol}://`;
                    const url = new URL(req.url, `${protocol}${hostname || ""}`);
                    return url;
                },
                queryString: (key) => req.query[key],
                transformResponse: ({ body, status, headers }) => {
                    for (const [name, value] of Object.entries(headers)) {
                        void reply.header(name, value);
                    }
                    void reply.code(status);
                    return reply.send(body);
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
/**
 * Serve and register any declared functions with Inngest, making them available
 * to be triggered by events.
 *
 * @example
 * ```ts
 * import Fastify from "fastify";
 * import inngestFastify from "inngest/fastify";
 * import { inngest, fnA } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.register(inngestFastify, {
 *   client: inngest,
 *   functions: [fnA],
 *   options: {},
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @public
 */
exports.fastifyPlugin = ((fastify, options, done) => {
    var _a;
    if (!(options === null || options === void 0 ? void 0 : options.client)) {
        throw new Error("Inngest `client` is required when serving with Fastify plugin");
    }
    if (!(options === null || options === void 0 ? void 0 : options.functions)) {
        throw new Error("Inngest `functions` are required when serving with Fastify plugin");
    }
    try {
        const handler = (0, exports.serve)(Object.assign({ client: options === null || options === void 0 ? void 0 : options.client, functions: options === null || options === void 0 ? void 0 : options.functions }, options === null || options === void 0 ? void 0 : options.options));
        fastify.route({
            method: ["GET", "POST", "PUT"],
            handler,
            url: ((_a = options === null || options === void 0 ? void 0 : options.options) === null || _a === void 0 ? void 0 : _a.servePath) || "/api/inngest",
        });
        done();
    }
    catch (err) {
        done(err);
    }
});
exports.default = exports.fastifyPlugin;
//# sourceMappingURL=fastify.js.map