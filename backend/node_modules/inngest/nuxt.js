"use strict";
/**
 * An adapter for Nuxt to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.frameworkName = void 0;
const h3_js_1 = require("./h3.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "nuxt";
/**
 * In Nuxt 3, serve and register any declared functions with Inngest, making
 * them available to be triggered by events.
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const optsOverrides = Object.assign(Object.assign({}, options), { frameworkName: exports.frameworkName });
    return (0, h3_js_1.serve)(optsOverrides);
};
exports.serve = serve;
//# sourceMappingURL=nuxt.js.map