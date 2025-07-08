import { ConnectMessage, GatewayExecutorRequestData, StartResponse, WorkerReplyAckData } from "../../proto/src/components/connect/protobuf/connect.js";
export declare function createStartRequest(excludeGateways: string[]): Uint8Array<ArrayBufferLike>;
export declare function parseStartResponse(r: Response): Promise<StartResponse>;
export declare function parseConnectMessage(r: Uint8Array): ConnectMessage;
export declare function parseGatewayExecutorRequest(r: Uint8Array): GatewayExecutorRequestData;
export declare function parseWorkerReplyAck(r: Uint8Array): WorkerReplyAckData;
//# sourceMappingURL=messages.d.ts.map