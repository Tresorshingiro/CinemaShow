"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendProvider = exports.createProvider = void 0;
const api_1 = require("@opentelemetry/api");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const context_async_hooks_1 = require("@opentelemetry/context-async-hooks");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const processor_js_1 = require("./processor.js");
const createProvider = (behaviour, instrumentations = []) => {
    // TODO Check if there's an existing provider
    const processor = new processor_js_1.InngestSpanProcessor();
    const p = new sdk_trace_base_1.BasicTracerProvider({
        spanProcessors: [processor],
    });
    const instrList = [
        ...instrumentations,
        ...(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)(),
    ];
    (0, instrumentation_1.registerInstrumentations)({
        instrumentations: instrList,
    });
    p.register({
        contextManager: new context_async_hooks_1.AsyncHooksContextManager().enable(),
    });
    return { success: true, processor };
};
exports.createProvider = createProvider;
/**
 * Attempts to extend the existing OTel provider with our processor. Returns true
 * if the provider was extended, false if it was not.
 */
const extendProvider = (behaviour) => {
    // Attempt to add our processor and export to the existing provider
    const existingProvider = api_1.trace.getTracerProvider();
    if (!existingProvider) {
        if (behaviour !== "auto") {
            console.warn('No existing OTel provider found and behaviour is "extendProvider". Inngest\'s OTel middleware will not work. Either allow the middleware to create a provider by setting `behaviour: "createProvider"` or `behaviour: "auto"`, or make sure that the provider is created and imported before the middleware is used.');
        }
        return { success: false };
    }
    if (!("addSpanProcessor" in existingProvider) ||
        typeof existingProvider.addSpanProcessor !== "function") {
        // TODO Could we also add a function the user can provide that takes the
        // processor and adds it? That way they could support many different
        // providers.
        if (behaviour !== "auto") {
            console.warn("Existing OTel provider is not a BasicTracerProvider. Inngest's OTel middleware will not work, as it can only extend an existing processor if it's a BasicTracerProvider.");
        }
        return { success: false };
    }
    const processor = new processor_js_1.InngestSpanProcessor();
    existingProvider.addSpanProcessor(processor);
    return { success: true, processor };
};
exports.extendProvider = extendProvider;
//# sourceMappingURL=util.js.map