"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartRequest = createStartRequest;
exports.parseStartResponse = parseStartResponse;
exports.parseConnectMessage = parseConnectMessage;
exports.parseGatewayExecutorRequest = parseGatewayExecutorRequest;
exports.parseWorkerReplyAck = parseWorkerReplyAck;
const connect_js_1 = require("../../proto/src/components/connect/protobuf/connect.js");
function createStartRequest(excludeGateways) {
    return connect_js_1.StartRequest.encode(connect_js_1.StartRequest.create({
        excludeGateways,
    })).finish();
}
async function parseStartResponse(r) {
    const startResp = connect_js_1.StartResponse.decode(new Uint8Array(await r.arrayBuffer()));
    return startResp;
}
function parseConnectMessage(r) {
    const connectMessage = connect_js_1.ConnectMessage.decode(r);
    return connectMessage;
}
function parseGatewayExecutorRequest(r) {
    const gatewayExecutorRequest = connect_js_1.GatewayExecutorRequestData.decode(r);
    return gatewayExecutorRequest;
}
function parseWorkerReplyAck(r) {
    const workerReplyAck = connect_js_1.WorkerReplyAckData.decode(r);
    return workerReplyAck;
}
//# sourceMappingURL=messages.js.map