"use strict";
/**
 * An adapter for DigitalOcean Functions to serve and register any declared
 * functions with Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/digitalocean";
 * import { inngest } from "./src/inngest/client";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * const main = serve({
 *   client: inngest,
 *   functions: [fnA],
 *   // Your digitalocean hostname.  This is required otherwise your functions won't work.
 *   serveHost: "https://faas-sfo3-your-url.doserverless.co",
 *   // And your DO path, also required.
 *   servePath: "/api/v1/web/fn-your-uuid/inngest",
 * });
 *
 * // IMPORTANT: Makes the function available as a module in the project.
 * // This is required for any functions that require external dependencies.
 * module.exports.main = main;
 * ```
 *
 * @module
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "digitalocean";
/**
 * In DigitalOcean Functions, serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/digitalocean";
 * import { inngest } from "./src/inngest/client";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * const main = serve({
 *   client: inngest,
 *   functions: [fnA],
 *   // Your digitalocean hostname.  This is required otherwise your functions won't work.
 *   serveHost: "https://faas-sfo3-your-url.doserverless.co",
 *   // And your DO path, also required.
 *   servePath: "/api/v1/web/fn-your-uuid/inngest",
 * });
 *
 * // IMPORTANT: Makes the function available as a module in the project.
 * // This is required for any functions that require external dependencies.
 * module.exports.main = main;
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (main = {}) => {
            const { http = { method: "GET", headers: {}, path: "" } } = main, data = __rest(main, ["http"]);
            return {
                body: () => data || {},
                headers: (key) => { var _a; return (_a = http === null || http === void 0 ? void 0 : http.headers) === null || _a === void 0 ? void 0 : _a[key]; },
                method: () => http.method,
                url: () => new URL(`${options.serveHost}${options.servePath || "/"}`),
                queryString: (key) => main[key],
                transformResponse: (res) => res,
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
//# sourceMappingURL=digitalocean.js.map