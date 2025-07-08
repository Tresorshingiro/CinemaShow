"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBuffer = void 0;
const debug_1 = __importDefault(require("debug"));
const consts_js_1 = require("../../helpers/consts.js");
const connect_js_1 = require("../../proto/src/components/connect/protobuf/connect.js");
const util_js_1 = require("./util.js");
class MessageBuffer {
    constructor(inngest) {
        this.buffered = {};
        this.pending = {};
        this.inngest = inngest;
        this.debug = (0, debug_1.default)("inngest:connect:message-buffer");
    }
    append(response) {
        this.buffered[response.requestId] = response;
        delete this.pending[response.requestId];
    }
    addPending(response, deadline) {
        this.pending[response.requestId] = response;
        setTimeout(() => {
            if (this.pending[response.requestId]) {
                this.debug("Message not acknowledged in time", response.requestId);
                this.append(response);
            }
        }, deadline);
    }
    acknowledgePending(requestId) {
        delete this.pending[requestId];
    }
    async sendFlushRequest(hashedSigningKey, msg) {
        const headers = Object.assign({ "Content-Type": "application/protobuf" }, (hashedSigningKey
            ? { Authorization: `Bearer ${hashedSigningKey}` }
            : {}));
        if (this.inngest.env) {
            headers[consts_js_1.headerKeys.Environment] = this.inngest.env;
        }
        const resp = await fetch(
        // refactor this to a more universal spot
        await this.inngest["inngestApi"]["getTargetUrl"]("/v0/connect/flush"), {
            method: "POST",
            body: connect_js_1.SDKResponse.encode(msg).finish(),
            headers: headers,
        });
        if (!resp.ok) {
            this.debug("Failed to flush messages", await resp.text());
            throw new Error("Failed to flush messages");
        }
        const flushResp = connect_js_1.FlushResponse.decode(new Uint8Array(await resp.arrayBuffer()));
        return flushResp;
    }
    async flush(hashedSigningKey) {
        if (Object.keys(this.buffered).length === 0) {
            return;
        }
        this.debug(`Flushing ${Object.keys(this.buffered).length} messages`);
        for (let attempt = 0; attempt < 5; attempt++) {
            for (const [k, v] of Object.entries(this.buffered)) {
                try {
                    await this.sendFlushRequest(hashedSigningKey, v);
                    delete this.buffered[k];
                }
                catch (err) {
                    this.debug("Failed to flush message", k, err);
                    break;
                }
            }
            if (Object.keys(this.buffered).length === 0) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, (0, util_js_1.expBackoff)(attempt)));
        }
        throw new Error("Failed to flush messages");
    }
}
exports.MessageBuffer = MessageBuffer;
//# sourceMappingURL=buffer.js.map