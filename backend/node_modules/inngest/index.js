"use strict";
/**
 * The primary entrypoint for the Inngest SDK. This provides all the necessary
 * exports to create, run, and trigger Inngest functions.
 *
 * Typical usage involves creating a new Inngest client with `Inngest`, and then
 * using the client to create functions, middleware, and other tools.
 *
 * See {@link https://www.inngest.com/docs} for more information.
 *
 * @example Create an Inngest client
 * ```ts
 * const inngest = new Inngest({
 *   id: "my-app-id",
 * });
 * ```
 *
 * @example Create an Inngest function
 * ```ts
 * const myFn = inngest.createFunction({
 *  id: "my-function",
 * }, {
 *   event: "user/created",
 * }, async ({ event, step }) => {
 *   console.log("User created:", event.data);
 * });
 * ```
 *
 * @example Send an event
 * ```ts
 * await inngest.send({
 *   name: "user/created",
 *   data: {
 *     id: "123",
 *   },
 * });
 * ```
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.ProxyLogger = exports.dependencyInjectionMiddleware = exports.slugify = exports.queryKeys = exports.internalEvents = exports.headerKeys = exports.StepError = exports.RetryAfterError = exports.NonRetriableError = exports.InngestMiddleware = exports.referenceFunction = exports.InngestCommHandler = exports.Inngest = exports.EventSchemas = void 0;
__exportStar(require("@inngest/ai"), exports);
var EventSchemas_js_1 = require("./components/EventSchemas.js");
Object.defineProperty(exports, "EventSchemas", { enumerable: true, get: function () { return EventSchemas_js_1.EventSchemas; } });
var Fetch_js_1 = require("./components/Fetch.js");
Object.defineProperty(exports, "fetch", { enumerable: true, get: function () { return Fetch_js_1.fetch; } });
var Inngest_js_1 = require("./components/Inngest.js");
Object.defineProperty(exports, "Inngest", { enumerable: true, get: function () { return Inngest_js_1.Inngest; } });
var InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
Object.defineProperty(exports, "InngestCommHandler", { enumerable: true, get: function () { return InngestCommHandler_js_1.InngestCommHandler; } });
var InngestFunctionReference_js_1 = require("./components/InngestFunctionReference.js");
Object.defineProperty(exports, "referenceFunction", { enumerable: true, get: function () { return InngestFunctionReference_js_1.referenceFunction; } });
var InngestMiddleware_js_1 = require("./components/InngestMiddleware.js");
Object.defineProperty(exports, "InngestMiddleware", { enumerable: true, get: function () { return InngestMiddleware_js_1.InngestMiddleware; } });
var NonRetriableError_js_1 = require("./components/NonRetriableError.js");
Object.defineProperty(exports, "NonRetriableError", { enumerable: true, get: function () { return NonRetriableError_js_1.NonRetriableError; } });
var RetryAfterError_js_1 = require("./components/RetryAfterError.js");
Object.defineProperty(exports, "RetryAfterError", { enumerable: true, get: function () { return RetryAfterError_js_1.RetryAfterError; } });
var StepError_js_1 = require("./components/StepError.js");
Object.defineProperty(exports, "StepError", { enumerable: true, get: function () { return StepError_js_1.StepError; } });
var consts_js_1 = require("./helpers/consts.js");
Object.defineProperty(exports, "headerKeys", { enumerable: true, get: function () { return consts_js_1.headerKeys; } });
Object.defineProperty(exports, "internalEvents", { enumerable: true, get: function () { return consts_js_1.internalEvents; } });
Object.defineProperty(exports, "queryKeys", { enumerable: true, get: function () { return consts_js_1.queryKeys; } });
var strings_js_1 = require("./helpers/strings.js");
Object.defineProperty(exports, "slugify", { enumerable: true, get: function () { return strings_js_1.slugify; } });
var dependencyInjection_js_1 = require("./middleware/dependencyInjection.js");
Object.defineProperty(exports, "dependencyInjectionMiddleware", { enumerable: true, get: function () { return dependencyInjection_js_1.dependencyInjectionMiddleware; } });
var logger_js_1 = require("./middleware/logger.js");
Object.defineProperty(exports, "ProxyLogger", { enumerable: true, get: function () { return logger_js_1.ProxyLogger; } });
var version_js_1 = require("./version.js");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_js_1.version; } });
//# sourceMappingURL=index.js.map