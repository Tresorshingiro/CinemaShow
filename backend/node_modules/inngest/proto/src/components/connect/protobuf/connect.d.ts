import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "connect.v1";
export declare enum GatewayMessageType {
    GATEWAY_HELLO = 0,
    WORKER_CONNECT = 1,
    GATEWAY_CONNECTION_READY = 2,
    GATEWAY_EXECUTOR_REQUEST = 3,
    WORKER_READY = 4,
    WORKER_REQUEST_ACK = 5,
    WORKER_REQUEST_EXTEND_LEASE = 12,
    WORKER_REQUEST_EXTEND_LEASE_ACK = 13,
    WORKER_REPLY = 6,
    WORKER_REPLY_ACK = 7,
    WORKER_PAUSE = 8,
    WORKER_HEARTBEAT = 9,
    GATEWAY_HEARTBEAT = 10,
    GATEWAY_CLOSING = 11,
    UNRECOGNIZED = -1
}
export declare function gatewayMessageTypeFromJSON(object: any): GatewayMessageType;
export declare function gatewayMessageTypeToJSON(object: GatewayMessageType): string;
export declare enum SDKResponseStatus {
    NOT_COMPLETED = 0,
    DONE = 1,
    ERROR = 2,
    UNRECOGNIZED = -1
}
export declare function sDKResponseStatusFromJSON(object: any): SDKResponseStatus;
export declare function sDKResponseStatusToJSON(object: SDKResponseStatus): string;
export declare enum ConnectionStatus {
    CONNECTED = 0,
    READY = 1,
    DRAINING = 2,
    DISCONNECTING = 3,
    DISCONNECTED = 4,
    UNRECOGNIZED = -1
}
export declare function connectionStatusFromJSON(object: any): ConnectionStatus;
export declare function connectionStatusToJSON(object: ConnectionStatus): string;
export declare enum WorkerDisconnectReason {
    WORKER_SHUTDOWN = 0,
    UNEXPECTED = 1,
    GATEWAY_DRAINING = 2,
    UNRECOGNIZED = -1
}
export declare function workerDisconnectReasonFromJSON(object: any): WorkerDisconnectReason;
export declare function workerDisconnectReasonToJSON(object: WorkerDisconnectReason): string;
export interface ConnectMessage {
    kind: GatewayMessageType;
    payload: Uint8Array;
}
export interface AppConfiguration {
    appName: string;
    appVersion?: string | undefined;
    functions: Uint8Array;
}
export interface AuthData {
    sessionToken: string;
    syncToken: string;
}
export interface WorkerConnectRequestData {
    connectionId: string;
    instanceId: string;
    authData: AuthData | undefined;
    capabilities: Uint8Array;
    apps: AppConfiguration[];
    workerManualReadinessAck: boolean;
    systemAttributes: SystemAttributes | undefined;
    environment?: string | undefined;
    framework: string;
    platform?: string | undefined;
    sdkVersion: string;
    sdkLanguage: string;
    startedAt: Date | undefined;
}
export interface GatewayConnectionReadyData {
    heartbeatInterval: string;
    extendLeaseInterval: string;
}
export interface GatewayExecutorRequestData {
    requestId: string;
    accountId: string;
    envId: string;
    appId: string;
    appName: string;
    functionId: string;
    functionSlug: string;
    stepId?: string | undefined;
    requestPayload: Uint8Array;
    systemTraceCtx: Uint8Array;
    userTraceCtx: Uint8Array;
    runId: string;
    leaseId: string;
}
export interface WorkerRequestAckData {
    requestId: string;
    accountId: string;
    envId: string;
    appId: string;
    functionSlug: string;
    stepId?: string | undefined;
    systemTraceCtx: Uint8Array;
    userTraceCtx: Uint8Array;
    runId: string;
}
export interface WorkerRequestExtendLeaseData {
    requestId: string;
    accountId: string;
    envId: string;
    appId: string;
    functionSlug: string;
    stepId?: string | undefined;
    systemTraceCtx: Uint8Array;
    userTraceCtx: Uint8Array;
    runId: string;
    leaseId: string;
}
export interface WorkerRequestExtendLeaseAckData {
    requestId: string;
    accountId: string;
    envId: string;
    appId: string;
    functionSlug: string;
    newLeaseId?: string | undefined;
}
export interface SDKResponse {
    requestId: string;
    accountId: string;
    envId: string;
    appId: string;
    status: SDKResponseStatus;
    body: Uint8Array;
    noRetry: boolean;
    retryAfter?: string | undefined;
    sdkVersion: string;
    requestVersion: number;
    systemTraceCtx: Uint8Array;
    userTraceCtx: Uint8Array;
    runId: string;
}
export interface WorkerReplyAckData {
    requestId: string;
}
/** Connection metadata */
export interface ConnMetadata {
    id: string;
    gatewayId: string;
    instanceId: string;
    allWorkerGroups: {
        [key: string]: string;
    };
    syncedWorkerGroups: {
        [key: string]: string;
    };
    status: ConnectionStatus;
    lastHeartbeatAt: Date | undefined;
    sdkLanguage: string;
    sdkVersion: string;
    attributes: SystemAttributes | undefined;
}
export interface ConnMetadata_AllWorkerGroupsEntry {
    key: string;
    value: string;
}
export interface ConnMetadata_SyncedWorkerGroupsEntry {
    key: string;
    value: string;
}
export interface SystemAttributes {
    cpuCores: number;
    memBytes: number;
    os: string;
}
export interface ConnGroup {
    envId: string;
    appId: string;
    appName: string;
    hash: string;
    conns: ConnMetadata[];
    syncId?: string | undefined;
    appVersion?: string | undefined;
}
export interface StartResponse {
    connectionId: string;
    gatewayEndpoint: string;
    gatewayGroup: string;
    sessionToken: string;
    syncToken: string;
}
export interface StartRequest {
    excludeGateways: string[];
}
export interface FlushResponse {
    requestId: string;
}
export interface PubSubAckMessage {
    ts: Date | undefined;
    nack?: boolean | undefined;
    nackReason?: SystemError | undefined;
}
export interface SystemError {
    code: string;
    data?: Uint8Array | undefined;
    message: string;
}
export declare const ConnectMessage: MessageFns<ConnectMessage>;
export declare const AppConfiguration: MessageFns<AppConfiguration>;
export declare const AuthData: MessageFns<AuthData>;
export declare const WorkerConnectRequestData: MessageFns<WorkerConnectRequestData>;
export declare const GatewayConnectionReadyData: MessageFns<GatewayConnectionReadyData>;
export declare const GatewayExecutorRequestData: MessageFns<GatewayExecutorRequestData>;
export declare const WorkerRequestAckData: MessageFns<WorkerRequestAckData>;
export declare const WorkerRequestExtendLeaseData: MessageFns<WorkerRequestExtendLeaseData>;
export declare const WorkerRequestExtendLeaseAckData: MessageFns<WorkerRequestExtendLeaseAckData>;
export declare const SDKResponse: MessageFns<SDKResponse>;
export declare const WorkerReplyAckData: MessageFns<WorkerReplyAckData>;
export declare const ConnMetadata: MessageFns<ConnMetadata>;
export declare const ConnMetadata_AllWorkerGroupsEntry: MessageFns<ConnMetadata_AllWorkerGroupsEntry>;
export declare const ConnMetadata_SyncedWorkerGroupsEntry: MessageFns<ConnMetadata_SyncedWorkerGroupsEntry>;
export declare const SystemAttributes: MessageFns<SystemAttributes>;
export declare const ConnGroup: MessageFns<ConnGroup>;
export declare const StartResponse: MessageFns<StartResponse>;
export declare const StartRequest: MessageFns<StartRequest>;
export declare const FlushResponse: MessageFns<FlushResponse>;
export declare const PubSubAckMessage: MessageFns<PubSubAckMessage>;
export declare const SystemError: MessageFns<SystemError>;
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
//# sourceMappingURL=connect.d.ts.map