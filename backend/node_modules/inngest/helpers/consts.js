"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncKind = exports.serverKind = exports.dummyEventKey = exports.debugPrefix = exports.logPrefix = exports.internalEvents = exports.defaultDevServerHost = exports.defaultInngestEventBaseUrl = exports.defaultInngestApiBaseUrl = exports.headerKeys = exports.envKeys = exports.probe = exports.queryKeys = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Keys for accessing query parameters included in requests from Inngest to run
 * functions.
 *
 * Used internally to create handlers using `InngestCommHandler`, but can be
 * imported to be used if creating a custom handler outside of the package.
 *
 * @public
 */
var queryKeys;
(function (queryKeys) {
    queryKeys["DeployId"] = "deployId";
    queryKeys["FnId"] = "fnId";
    queryKeys["Probe"] = "probe";
    queryKeys["StepId"] = "stepId";
})(queryKeys || (exports.queryKeys = queryKeys = {}));
var probe;
(function (probe) {
    probe["Trust"] = "trust";
})(probe || (exports.probe = probe = {}));
var envKeys;
(function (envKeys) {
    envKeys["InngestSigningKey"] = "INNGEST_SIGNING_KEY";
    envKeys["InngestSigningKeyFallback"] = "INNGEST_SIGNING_KEY_FALLBACK";
    envKeys["InngestEventKey"] = "INNGEST_EVENT_KEY";
    /**
     * @deprecated Removed in v3. Use {@link InngestBaseUrl} instead.
     */
    envKeys["InngestDevServerUrl"] = "INNGEST_DEVSERVER_URL";
    envKeys["InngestEnvironment"] = "INNGEST_ENV";
    envKeys["InngestBaseUrl"] = "INNGEST_BASE_URL";
    envKeys["InngestEventApiBaseUrl"] = "INNGEST_EVENT_API_BASE_URL";
    envKeys["InngestApiBaseUrl"] = "INNGEST_API_BASE_URL";
    envKeys["InngestServeHost"] = "INNGEST_SERVE_HOST";
    envKeys["InngestServePath"] = "INNGEST_SERVE_PATH";
    envKeys["InngestLogLevel"] = "INNGEST_LOG_LEVEL";
    envKeys["InngestStreaming"] = "INNGEST_STREAMING";
    envKeys["InngestDevMode"] = "INNGEST_DEV";
    envKeys["InngestAllowInBandSync"] = "INNGEST_ALLOW_IN_BAND_SYNC";
    /**
     * @deprecated It's unknown what this env var was used for, but we do not
     * provide explicit support for it. Prefer using `INNGEST_ENV` instead.
     */
    envKeys["BranchName"] = "BRANCH_NAME";
    /**
     * The git branch of the commit the deployment was triggered by. Example:
     * `improve-about-page`.
     *
     * {@link https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables#system-environment-variables}
     */
    envKeys["VercelBranch"] = "VERCEL_GIT_COMMIT_REF";
    /**
     * Expected to be `"1"` if defined.
     */
    envKeys["IsVercel"] = "VERCEL";
    /**
     * The branch name of the current deployment. May only be accessible at build
     * time, but included here just in case.
     *
     * {@link https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables}
     */
    envKeys["CloudflarePagesBranch"] = "CF_PAGES_BRANCH";
    /**
     * Expected to be `"1"` if defined.
     */
    envKeys["IsCloudflarePages"] = "CF_PAGES";
    /**
     * The branch name of the deployment from Git to Netlify, if available.
     *
     * {@link https://docs.netlify.com/configure-builds/environment-variables/#git-metadata}
     */
    envKeys["NetlifyBranch"] = "BRANCH";
    /**
     * Expected to be `"true"` if defined.
     */
    envKeys["IsNetlify"] = "NETLIFY";
    /**
     * The Git branch for a service or deploy.
     *
     * {@link https://render.com/docs/environment-variables#all-services}
     */
    envKeys["RenderBranch"] = "RENDER_GIT_BRANCH";
    /**
     * Expected to be `"true"` if defined.
     */
    envKeys["IsRender"] = "RENDER";
    /**
     * The branch that triggered the deployment. Example: `main`
     *
     * {@link https://docs.railway.app/develop/variables#railway-provided-variables}
     */
    envKeys["RailwayBranch"] = "RAILWAY_GIT_BRANCH";
    /**
     * The railway environment for the deployment. Example: `production`
     *
     * {@link https://docs.railway.app/develop/variables#railway-provided-variables}
     */
    envKeys["RailwayEnvironment"] = "RAILWAY_ENVIRONMENT";
    envKeys["VercelEnvKey"] = "VERCEL_ENV";
    envKeys["OpenAiApiKey"] = "OPENAI_API_KEY";
    envKeys["GeminiApiKey"] = "GEMINI_API_KEY";
    envKeys["AnthropicApiKey"] = "ANTHROPIC_API_KEY";
})(envKeys || (exports.envKeys = envKeys = {}));
/**
 * Keys for accessing headers included in requests from Inngest to run
 * functions.
 *
 * Used internally to create handlers using `InngestCommHandler`, but can be
 * imported to be used if creating a custom handler outside of the package.
 *
 * @public
 */
var headerKeys;
(function (headerKeys) {
    headerKeys["ContentLength"] = "content-length";
    headerKeys["Signature"] = "x-inngest-signature";
    headerKeys["SdkVersion"] = "x-inngest-sdk";
    headerKeys["Environment"] = "x-inngest-env";
    headerKeys["Platform"] = "x-inngest-platform";
    headerKeys["Framework"] = "x-inngest-framework";
    headerKeys["NoRetry"] = "x-inngest-no-retry";
    headerKeys["RequestVersion"] = "x-inngest-req-version";
    headerKeys["RetryAfter"] = "retry-after";
    headerKeys["InngestServerKind"] = "x-inngest-server-kind";
    headerKeys["InngestExpectedServerKind"] = "x-inngest-expected-server-kind";
    headerKeys["InngestSyncKind"] = "x-inngest-sync-kind";
    headerKeys["EventIdSeed"] = "x-inngest-event-id-seed";
    headerKeys["TraceParent"] = "traceparent";
    headerKeys["TraceState"] = "tracestate";
})(headerKeys || (exports.headerKeys = headerKeys = {}));
exports.defaultInngestApiBaseUrl = "https://api.inngest.com/";
exports.defaultInngestEventBaseUrl = "https://inn.gs/";
exports.defaultDevServerHost = "http://localhost:8288/";
/**
 * Events that Inngest may send internally that can be used to trigger
 * functions.
 *
 * @public
 */
var internalEvents;
(function (internalEvents) {
    /**
     * A function has failed after exhausting all available retries. This event
     * will contain the original event and the error that caused the failure.
     */
    internalEvents["FunctionFailed"] = "inngest/function.failed";
    internalEvents["FunctionInvoked"] = "inngest/function.invoked";
    internalEvents["FunctionFinished"] = "inngest/function.finished";
    internalEvents["FunctionCancelled"] = "inngest/function.cancelled";
    internalEvents["ScheduledTimer"] = "inngest/scheduled.timer";
})(internalEvents || (exports.internalEvents = internalEvents = {}));
exports.logPrefix = chalk_1.default.magenta.bold("[Inngest]");
exports.debugPrefix = "inngest";
exports.dummyEventKey = "NO_EVENT_KEY_SET";
var serverKind;
(function (serverKind) {
    serverKind["Dev"] = "dev";
    serverKind["Cloud"] = "cloud";
})(serverKind || (exports.serverKind = serverKind = {}));
var syncKind;
(function (syncKind) {
    syncKind["InBand"] = "in_band";
    syncKind["OutOfBand"] = "out_of_band";
})(syncKind || (exports.syncKind = syncKind = {}));
//# sourceMappingURL=consts.js.map