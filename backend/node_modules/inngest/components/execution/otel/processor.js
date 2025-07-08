"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _InngestSpanProcessor_batcher, _InngestSpanProcessor_spansToExport, _InngestSpanProcessor_traceParents, _InngestSpanProcessor_spanCleanup;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInngestSpanProcessor = exports.InngestSpanProcessor = void 0;
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const resources_1 = require("@opentelemetry/resources");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const debug_1 = __importDefault(require("debug"));
const consts_js_1 = require("../../../helpers/consts.js");
const devserver_js_1 = require("../../../helpers/devserver.js");
const env_js_1 = require("../../../helpers/env.js");
const als_js_1 = require("../als.js");
const access_js_1 = require("./access.js");
const consts_js_2 = require("./consts.js");
const processorDebug = (0, debug_1.default)(`${consts_js_2.debugPrefix}:InngestSpanProcessor`);
/**
 * A set of resource attributes that are used to identify the Inngest app and
 *  the function that is being executed. This is used to store the resource
 * attributes for the spans that are exported to the Inngest endpoint, and cache
 *  them for later use.
 */
let _resourceAttributes;
/**
 * An OTel span processor that is used to export spans to the Inngest endpoint.
 * This is used to track spans that are created within an Inngest run and export
 * them to the Inngest endpoint for tracing.
 *
 * It's careful to only pick relevant spans to export and will not send any
 * irrelevant spans to the Inngest endpoint.
 *
 * THIS IS THE INTERNAL IMPLEMENTATION OF THE SPAN PROCESSOR AND SHOULD NOT BE
 * USED BY USERS DIRECTLY. USE THE {@link PublicInngestSpanProcessor} CLASS
 * INSTEAD.
 */
class InngestSpanProcessor {
    /**
     * An OTel span processor that is used to export spans to the Inngest endpoint.
     * This is used to track spans that are created within an Inngest run and export
     * them to the Inngest endpoint for tracing.
     *
     * It's careful to only pick relevant spans to export and will not send any
     * irrelevant spans to the Inngest endpoint.
     */
    constructor(
    /**
     * The app that this span processor is associated with. This is used to
     * determine the Inngest endpoint to export spans to.
     *
     * It is optional here as this is the private constructor and only used
     * internally; we set `app` elsewhere as when we create the processor (as
     * early as possible when the process starts) we don't necessarily have the
     * app available yet.
     *
     * So, internally we can delay setting ths until later.
     */
    app) {
        /**
         * A `BatchSpanProcessor` that is used to export spans to the Inngest
         * endpoint. This is created lazily to avoid creating it until the Inngest App
         * has been initialized and has had a chance to receive environment variables,
         * which may be from an incoming request.
         */
        _InngestSpanProcessor_batcher.set(this, void 0);
        /**
         * A set of spans used to track spans that we care about, so that we can
         * export them to the OTel endpoint.
         *
         * If a span falls out of reference, it will be removed from this set as we'll
         * never get a chance to export it or remove it anyway.
         */
        _InngestSpanProcessor_spansToExport.set(this, new WeakSet());
        /**
         * A map of span IDs to their parent state, which includes a block of
         * information that can be used and pushed back to the Inngest endpoint to
         * ingest spans.
         */
        _InngestSpanProcessor_traceParents.set(this, new Map());
        /**
         * A registry used to clean up items from the `traceParents` map when spans
         * fall out of reference. This is used to avoid memory leaks in the case where
         * a span is not exported, remains unended, and is left in memory before being
         * GC'd.
         */
        _InngestSpanProcessor_spanCleanup.set(this, new FinalizationRegistry((spanId) => {
            if (spanId) {
                __classPrivateFieldGet(this, _InngestSpanProcessor_traceParents, "f").delete(spanId);
            }
        }));
        if (app) {
            access_js_1.clientProcessorMap.set(app, this);
        }
    }
    /**
     * In order to only capture a subset of spans, we need to declare the initial
     * span that we care about and then export its children.
     *
     * Call this method (ideally just before execution starts) with that initial
     * span to trigger capturing all following children as well as initialize the
     * batcher.
     */
    declareStartingSpan({ span, runId, traceparent, tracestate, }) {
        // Upsert the batcher ready for later. We do this here to bootstrap it with
        // the correct async context as soon as we can. As this method is only
        // called just before execution, we know we're all set up.
        //
        // Waiting to call this until we actually need the batcher would mean that
        // we might not have the correct async context set up, as we'd likely be in
        // some span lifecycle method that doesn't have the same chain of execution.
        void this.ensureBatcherInitialized();
        // If we don't have a traceparent, then we can't track this span. This is
        // likely a span that we don't care about, so we can ignore it.
        if (!traceparent) {
            return processorDebug("no traceparent found for span", span.spanContext().spanId, "so skipping it");
        }
        // We also attempt to use `tracestate`. The values we fetch from these
        // should be optional, as it's likely the Executor won't need us to parrot
        // them back in later versions.
        let appId;
        let functionId;
        if (tracestate) {
            try {
                const entries = Object.fromEntries(tracestate.split(",").map((kv) => kv.split("=")));
                appId = entries[consts_js_2.TraceStateKey.AppId];
                functionId = entries[consts_js_2.TraceStateKey.FunctionId];
            }
            catch (err) {
                processorDebug("failed to parse tracestate", tracestate, "so skipping it;", err);
            }
        }
        // This is a span that we care about, so let's make sure it and its
        // children are exported.
        processorDebug.extend("declareStartingSpan")("declaring:", span.spanContext().spanId, "for traceparent", traceparent);
        // Set a load of attributes on this span so that we can nicely identify
        // runtime, paths, etc. Only this span will have these attributes.
        span.setAttributes(InngestSpanProcessor.resourceAttributes.attributes);
        this.trackSpan({
            appId,
            functionId,
            runId,
            traceparent,
        }, span);
    }
    /**
     * A getter for retrieving resource attributes for the current process. This
     * is used to set the resource attributes for the spans that are exported to
     * the Inngest endpoint, and cache them for later use.
     */
    static get resourceAttributes() {
        if (!_resourceAttributes) {
            _resourceAttributes = (0, resources_1.detectResourcesSync)({
                detectors: [
                    resources_1.osDetectorSync,
                    resources_1.envDetectorSync,
                    resources_1.hostDetectorSync,
                    resources_1.processDetectorSync,
                    resources_1.serviceInstanceIdDetectorSync,
                ],
            });
        }
        return _resourceAttributes;
    }
    /**
     * The batcher is a singleton that is used to export spans to the OTel
     * endpoint. It is created lazily to avoid creating it until the Inngest App
     * has been initialized and has had a chance to receive environment variables,
     * which may be from an incoming request.
     *
     * The batcher is only referenced once we've found a span we're interested in,
     * so this should always have everything it needs on the app by then.
     */
    ensureBatcherInitialized() {
        if (!__classPrivateFieldGet(this, _InngestSpanProcessor_batcher, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
            __classPrivateFieldSet(this, _InngestSpanProcessor_batcher, new Promise(async (resolve, reject) => {
                var _a;
                try {
                    // We retrieve the app from the async context, so we must make sure
                    // that this function is called from the correct chain.
                    const store = await (0, als_js_1.getAsyncCtx)();
                    if (!store) {
                        throw new Error("No async context found; cannot create batcher to export traces");
                    }
                    const app = store.app;
                    // Fetch the URL for the Inngest endpoint using the app's config.
                    let url;
                    const path = "/v1/traces/userland";
                    if (app.apiBaseUrl) {
                        url = new URL(path, app.apiBaseUrl);
                    }
                    else {
                        url = new URL(path, consts_js_1.defaultInngestApiBaseUrl);
                        if (app["mode"] && app["mode"].isDev && app["mode"].isInferred) {
                            const devHost = (0, env_js_1.devServerHost)() || consts_js_1.defaultDevServerHost;
                            const hasDevServer = await (0, devserver_js_1.devServerAvailable)(devHost, app["fetch"]);
                            if (hasDevServer) {
                                url = new URL(path, devHost);
                            }
                        }
                        else if ((_a = app["mode"]) === null || _a === void 0 ? void 0 : _a.explicitDevUrl) {
                            url = new URL(path, app["mode"].explicitDevUrl.href);
                        }
                    }
                    processorDebug("batcher lazily accessed; creating new batcher with URL", url);
                    const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({
                        url: url.href,
                        headers: {
                            Authorization: `Bearer ${app["inngestApi"]["signingKey"]}`,
                        },
                    });
                    resolve(new sdk_trace_base_1.BatchSpanProcessor(exporter));
                }
                catch (err) {
                    reject(err);
                }
            }), "f");
        }
        return __classPrivateFieldGet(this, _InngestSpanProcessor_batcher, "f");
    }
    /**
     * Mark a span as being tracked by this processor, meaning it will be exported
     * to the Inggest endpoint when it ends.
     */
    trackSpan(parentState, span) {
        const spanId = span.spanContext().spanId;
        __classPrivateFieldGet(this, _InngestSpanProcessor_spanCleanup, "f").register(span, spanId, span);
        __classPrivateFieldGet(this, _InngestSpanProcessor_spansToExport, "f").add(span);
        __classPrivateFieldGet(this, _InngestSpanProcessor_traceParents, "f").set(spanId, parentState);
        span.setAttribute(consts_js_2.Attribute.InngestTraceparent, parentState.traceparent);
        span.setAttribute(consts_js_2.Attribute.InngestRunId, parentState.runId);
        // Setting app ID is optional; it's likely in future versions of the
        // Executor that we don't need to parrot this back.
        if (parentState.appId) {
            span.setAttribute(consts_js_2.Attribute.InngestAppId1, parentState.appId);
            span.setAttribute(consts_js_2.Attribute.InngestAppId2, parentState.appId);
        }
        // Setting function ID is optional; it's likely in future versions of the
        // Executor that we don't need to parrot this back.
        if (parentState.functionId) {
            span.setAttribute(consts_js_2.Attribute.InngestFunctionId, parentState.functionId);
        }
    }
    /**
     * Clean up any references to a span that has ended. This is used to avoid
     * memory leaks in the case where a span is not exported, remains unended, and
     * is left in memory before being GC'd.
     */
    cleanupSpan(span) {
        const spanId = span.spanContext().spanId;
        // This span is no longer in use, so we can remove it from the cleanup
        // registry.
        __classPrivateFieldGet(this, _InngestSpanProcessor_spanCleanup, "f").unregister(span);
        __classPrivateFieldGet(this, _InngestSpanProcessor_spansToExport, "f").delete(span);
        __classPrivateFieldGet(this, _InngestSpanProcessor_traceParents, "f").delete(spanId);
    }
    /**
     * An implementation of the `onStart` method from the `SpanProcessor`
     * interface. This is called when a span is started, and is used to track
     * spans that are children of spans we care about.
     */
    onStart(span) {
        const debug = processorDebug.extend("onStart");
        const spanId = span.spanContext().spanId;
        // 🤫 It seems to work
        const parentSpanId = span.parentSpanId;
        // The root span isn't captured here, but we can capture children of it
        // here.
        if (!parentSpanId) {
            // All spans that Inngest cares about will have a parent, so ignore this
            debug("no parent span ID for", spanId, "so skipping it");
            return;
        }
        const parentState = __classPrivateFieldGet(this, _InngestSpanProcessor_traceParents, "f").get(parentSpanId);
        if (parentState) {
            // This span is a child of a span we care about, so add it to the list of
            // tracked spans so that we also capture its children
            debug("found traceparent", parentState, "in span ID", parentSpanId, "so adding", spanId);
            this.trackSpan(parentState, span);
        }
    }
    /**
     * An implementation of the `onEnd` method from the `SpanProcessor` interface.
     * This is called when a span ends, and is used to export spans to the Inngest
     * endpoint.
     */
    onEnd(span) {
        const debug = processorDebug.extend("onEnd");
        const spanId = span.spanContext().spanId;
        try {
            if (__classPrivateFieldGet(this, _InngestSpanProcessor_spansToExport, "f").has(span)) {
                if (!__classPrivateFieldGet(this, _InngestSpanProcessor_batcher, "f")) {
                    return debug("batcher not initialized, so failed exporting span", spanId);
                }
                debug("exporting span", spanId);
                return void __classPrivateFieldGet(this, _InngestSpanProcessor_batcher, "f").then((batcher) => batcher.onEnd(span));
            }
            debug("not exporting span", spanId, "as we don't care about it");
        }
        finally {
            this.cleanupSpan(span);
        }
    }
    /**
     * An implementation of the `forceFlush` method from the `SpanProcessor`
     * interface. This is called to force the processor to flush any spans that
     * are currently in the batcher. This is used to ensure that spans are
     * exported to the Inngest endpoint before the process exits.
     *
     * Notably, we call this in the `beforeResponse` middleware hook to ensure
     * that spans for a run as exported as soon as possible and before the
     * serverless process is killed.
     */
    async forceFlush() {
        var _a;
        const flushDebug = processorDebug.extend("forceFlush");
        flushDebug("force flushing batcher");
        return (_a = __classPrivateFieldGet(this, _InngestSpanProcessor_batcher, "f")) === null || _a === void 0 ? void 0 : _a.then((batcher) => batcher.forceFlush()).catch((err) => {
            flushDebug("error flushing batcher", err, "ignoring");
        });
    }
    async shutdown() {
        var _a;
        processorDebug.extend("shutdown")("shutting down batcher");
        return (_a = __classPrivateFieldGet(this, _InngestSpanProcessor_batcher, "f")) === null || _a === void 0 ? void 0 : _a.then((batcher) => batcher.shutdown());
    }
}
exports.InngestSpanProcessor = InngestSpanProcessor;
_InngestSpanProcessor_batcher = new WeakMap(), _InngestSpanProcessor_spansToExport = new WeakMap(), _InngestSpanProcessor_traceParents = new WeakMap(), _InngestSpanProcessor_spanCleanup = new WeakMap();
/**
 * An OTel span processor that is used to export spans to the Inngest endpoint.
 * This is used to track spans that are created within an Inngest run and export
 * them to the Inngest endpoint for tracing.
 *
 * It's careful to only pick relevant spans to export and will not send any
 * irrelevant spans to the Inngest endpoint.
 */
class PublicInngestSpanProcessor extends InngestSpanProcessor {
    constructor(
    /**
     * The app that this span processor is associated with. This is used to
     * determine the Inngest endpoint to export spans to.
     */
    app) {
        super(app);
    }
}
exports.PublicInngestSpanProcessor = PublicInngestSpanProcessor;
//# sourceMappingURL=processor.js.map