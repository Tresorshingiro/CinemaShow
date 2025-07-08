"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InngestApi = void 0;
const zod_1 = require("zod");
const consts_js_1 = require("../helpers/consts.js");
const devserver_js_1 = require("../helpers/devserver.js");
const errors_js_1 = require("../helpers/errors.js");
const net_js_1 = require("../helpers/net.js");
const strings_js_1 = require("../helpers/strings.js");
const types_js_1 = require("../types.js");
const schema_js_1 = require("./schema.js");
const realtimeSubscriptionTokenSchema = zod_1.z.object({
    jwt: zod_1.z.string(),
});
const sendSignalSuccessResponseSchema = zod_1.z.object({
    data: zod_1.z.object({
        run_id: zod_1.z.string().min(1),
    }),
});
class InngestApi {
    constructor({ baseUrl, signingKey, signingKeyFallback, fetch, mode, }) {
        this.apiBaseUrl = baseUrl;
        this.signingKey = signingKey;
        this.signingKeyFallback = signingKeyFallback;
        this.fetch = fetch;
        this.mode = mode;
    }
    get hashedKey() {
        return (0, strings_js_1.hashSigningKey)(this.signingKey);
    }
    get hashedFallbackKey() {
        if (!this.signingKeyFallback) {
            return;
        }
        return (0, strings_js_1.hashSigningKey)(this.signingKeyFallback);
    }
    // set the signing key in case it was not instantiated previously
    setSigningKey(key) {
        if (typeof key === "string" && this.signingKey === "") {
            this.signingKey = key;
        }
    }
    setSigningKeyFallback(key) {
        if (typeof key === "string" && !this.signingKeyFallback) {
            this.signingKeyFallback = key;
        }
    }
    async getTargetUrl(path) {
        if (this.apiBaseUrl) {
            return new URL(path, this.apiBaseUrl);
        }
        let url = new URL(path, consts_js_1.defaultInngestApiBaseUrl);
        if (this.mode.isDev && this.mode.isInferred && !this.apiBaseUrl) {
            const devAvailable = await (0, devserver_js_1.devServerAvailable)(consts_js_1.defaultDevServerHost, this.fetch);
            if (devAvailable) {
                url = new URL(path, consts_js_1.defaultDevServerHost);
            }
        }
        return url;
    }
    async getRunSteps(runId, version) {
        return (0, net_js_1.fetchWithAuthFallback)({
            authToken: this.hashedKey,
            authTokenFallback: this.hashedFallbackKey,
            fetch: this.fetch,
            url: await this.getTargetUrl(`/v0/runs/${runId}/actions`),
        })
            .then(async (resp) => {
            const data = await resp.json();
            if (resp.ok) {
                return (0, types_js_1.ok)(schema_js_1.stepsSchemas[version].parse(data));
            }
            else {
                return (0, types_js_1.err)(schema_js_1.errorSchema.parse(data));
            }
        })
            .catch((error) => {
            return (0, types_js_1.err)({
                error: (0, errors_js_1.getErrorMessage)(error, "Unknown error retrieving step data"),
                status: 500,
            });
        });
    }
    async getRunBatch(runId) {
        return (0, net_js_1.fetchWithAuthFallback)({
            authToken: this.hashedKey,
            authTokenFallback: this.hashedFallbackKey,
            fetch: this.fetch,
            url: await this.getTargetUrl(`/v0/runs/${runId}/batch`),
        })
            .then(async (resp) => {
            const data = await resp.json();
            if (resp.ok) {
                return (0, types_js_1.ok)(schema_js_1.batchSchema.parse(data));
            }
            else {
                return (0, types_js_1.err)(schema_js_1.errorSchema.parse(data));
            }
        })
            .catch((error) => {
            return (0, types_js_1.err)({
                error: (0, errors_js_1.getErrorMessage)(error, "Unknown error retrieving event batch"),
                status: 500,
            });
        });
    }
    async publish(publishOptions, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data) {
        // todo it may not be a "text/stream"
        const isStream = data instanceof ReadableStream;
        const url = await this.getTargetUrl("/v1/realtime/publish");
        url.searchParams.set("channel", publishOptions.channel || "");
        if (publishOptions.runId) {
            url.searchParams.set("run_id", publishOptions.runId);
        }
        publishOptions.topics.forEach((topic) => {
            url.searchParams.append("topic", topic);
        });
        return (0, net_js_1.fetchWithAuthFallback)({
            authToken: this.hashedKey,
            authTokenFallback: this.hashedFallbackKey,
            fetch: this.fetch,
            url,
            options: Object.assign({ method: "POST", body: isStream
                    ? data
                    : typeof data === "string"
                        ? data
                        : JSON.stringify(data), headers: {
                    "Content-Type": isStream ? "text/stream" : "application/json",
                } }, (isStream ? { duplex: "half" } : {})),
        })
            .then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to publish event: ${res.status} ${res.statusText}`);
            }
            return (0, types_js_1.ok)(undefined);
        })
            .catch((error) => {
            return (0, types_js_1.err)({
                error: (0, errors_js_1.getErrorMessage)(error, "Unknown error publishing event"),
                status: 500,
            });
        });
    }
    async sendSignal(signalOptions, options) {
        const url = await this.getTargetUrl("/v1/signals");
        const body = {
            signal: signalOptions.signal,
            data: signalOptions.data,
        };
        return (0, net_js_1.fetchWithAuthFallback)({
            authToken: this.hashedKey,
            authTokenFallback: this.hashedFallbackKey,
            fetch: this.fetch,
            url,
            options: {
                method: "POST",
                body: JSON.stringify(body),
                headers: Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers),
            },
        })
            .then(async (res) => {
            // A 404 is valid if the signal was not found.
            if (res.status === 404) {
                return (0, types_js_1.ok)({
                    runId: undefined,
                });
            }
            // Save a clone of the response we can use to get the text of if we fail
            // to parse the JSON.
            const resClone = res.clone();
            // JSON!
            let json;
            try {
                json = await res.json();
            }
            catch (error) {
                // res.json() failed so not a valid JSON response
                return (0, types_js_1.err)({
                    error: `Failed to send signal: ${res.status} ${res.statusText} - ${await resClone.text()}`,
                    status: res.status,
                });
            }
            // If we're not 2xx, something went wrong.
            if (!res.ok) {
                try {
                    return (0, types_js_1.err)(schema_js_1.errorSchema.parse(json));
                }
                catch (_a) {
                    // schema parse failed
                    return (0, types_js_1.err)({
                        error: `Failed to send signal: ${res.status} ${res.statusText} - ${await res.text()}`,
                        status: res.status,
                    });
                }
            }
            // If we are 2xx, we should have a run_id.
            const parseRes = sendSignalSuccessResponseSchema.safeParse(json);
            if (!parseRes.success) {
                return (0, types_js_1.err)({
                    error: `Successfully sent signal, but response parsing failed: ${res.status} ${res.statusText} - ${await resClone.text()}`,
                    status: res.status,
                });
            }
            return (0, types_js_1.ok)({
                runId: parseRes.data.data.run_id,
            });
        })
            .catch((error) => {
            // Catch-all if various things go wrong
            return (0, types_js_1.err)({
                error: (0, errors_js_1.getErrorMessage)(error, "Unknown error sending signal"),
                status: 500,
            });
        });
    }
    async getSubscriptionToken(channel, topics) {
        const url = await this.getTargetUrl("/v1/realtime/token");
        const body = topics.map((topic) => ({
            channel,
            name: topic,
            kind: "run",
        }));
        return (0, net_js_1.fetchWithAuthFallback)({
            authToken: this.hashedKey,
            authTokenFallback: this.hashedFallbackKey,
            fetch: this.fetch,
            url,
            options: {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            },
        })
            .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to get subscription token: ${res.status} ${res.statusText} - ${await res.text()}`);
            }
            const data = realtimeSubscriptionTokenSchema.parse(await res.json());
            return data.jwt;
        })
            .catch((error) => {
            throw new Error((0, errors_js_1.getErrorMessage)(error, "Unknown error getting subscription token"));
        });
    }
}
exports.InngestApi = InngestApi;
//# sourceMappingURL=api.js.map