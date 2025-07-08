"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _InngestOtelDiagLogger_logger;
Object.defineProperty(exports, "__esModule", { value: true });
exports.otelMiddleware = void 0;
const api_1 = require("@opentelemetry/api");
const debug_1 = __importDefault(require("debug"));
const version_js_1 = require("../../../version.js");
const InngestMiddleware_js_1 = require("../../InngestMiddleware.js");
const access_js_1 = require("./access.js");
const consts_js_1 = require("./consts.js");
const util_js_1 = require("./util.js");
const debug = (0, debug_1.default)(`${consts_js_1.debugPrefix}:middleware`);
class InngestOtelDiagLogger {
    constructor() {
        _InngestOtelDiagLogger_logger.set(this, (0, debug_1.default)(`${consts_js_1.debugPrefix}:diag`));
        this.debug = __classPrivateFieldGet(this, _InngestOtelDiagLogger_logger, "f");
        this.error = __classPrivateFieldGet(this, _InngestOtelDiagLogger_logger, "f");
        this.info = __classPrivateFieldGet(this, _InngestOtelDiagLogger_logger, "f");
        this.verbose = __classPrivateFieldGet(this, _InngestOtelDiagLogger_logger, "f");
        this.warn = __classPrivateFieldGet(this, _InngestOtelDiagLogger_logger, "f");
    }
}
_InngestOtelDiagLogger_logger = new WeakMap();
/**
 * Middleware the captures and exports spans relevant to Inngest runs using
 * OTel.
 *
 * This can be used to attach additional spans and data to the existing traces
 * in your Inngest dashboard (or Dev Server).
 */
const otelMiddleware = ({ behaviour = "auto", instrumentations, logLevel = api_1.DiagLogLevel.ERROR, } = {}) => {
    debug("behaviour:", behaviour);
    let processor;
    switch (behaviour) {
        case "auto": {
            const extended = (0, util_js_1.extendProvider)(behaviour);
            if (extended.success) {
                debug("extended existing provider");
                processor = extended.processor;
                break;
            }
            const created = (0, util_js_1.createProvider)(behaviour, instrumentations);
            if (created.success) {
                debug("created new provider");
                processor = created.processor;
                break;
            }
            console.warn("no provider found to extend and unable to create one");
            break;
        }
        case "createProvider": {
            const created = (0, util_js_1.createProvider)(behaviour, instrumentations);
            if (created.success) {
                debug("created new provider");
                processor = created.processor;
                break;
            }
            console.warn("unable to create provider, OTel middleware will not work");
            break;
        }
        case "extendProvider": {
            const extended = (0, util_js_1.extendProvider)(behaviour);
            if (extended.success) {
                debug("extended existing provider");
                processor = extended.processor;
                break;
            }
            console.warn('unable to extend provider, OTel middleware will not work. Either allow the middleware to create a provider by setting `behaviour: "createProvider"` or `behaviour: "auto"`, or make sure that the provider is created and imported before the middleware is used.');
            break;
        }
        case "off": {
            break;
        }
        default: {
            // unknown
            console.warn(`unknown behaviour ${JSON.stringify(behaviour)}, defaulting to "off"`);
        }
    }
    return new InngestMiddleware_js_1.InngestMiddleware({
        name: "Inngest: OTel",
        init({ client }) {
            // Set the logger for our otel processors and exporters.
            // If this is called multiple times (for example by the user in some other
            // custom code), then only the first call is set, so we don't have to
            // worry about overwriting it here accidentally.
            //
            debug("set otel diagLogger:", api_1.diag.setLogger(new InngestOtelDiagLogger(), logLevel));
            if (processor) {
                access_js_1.clientProcessorMap.set(client, processor);
            }
            return {
                onFunctionRun() {
                    return {
                        transformInput() {
                            return {
                                ctx: {
                                    /**
                                     * A tracer that can be used to create spans within a step
                                     * that will be displayed on the Inngest dashboard (or Dev
                                     * Server).
                                     *
                                     * Note that creating spans outside of steps when the function
                                     * contains `step.*()` calls is not currently supported.
                                     */
                                    tracer: api_1.trace.getTracer("inngest", version_js_1.version),
                                },
                            };
                        },
                        async beforeResponse() {
                            // Should this be awaited? And is it fine to flush after every
                            // execution?
                            await (processor === null || processor === void 0 ? void 0 : processor.forceFlush());
                        },
                    };
                },
            };
        },
    });
};
exports.otelMiddleware = otelMiddleware;
//# sourceMappingURL=middleware.js.map