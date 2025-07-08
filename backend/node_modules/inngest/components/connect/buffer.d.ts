import { type Inngest } from "../Inngest.js";
import { SDKResponse } from "../../proto/src/components/connect/protobuf/connect.js";
export declare class MessageBuffer {
    private buffered;
    private pending;
    private inngest;
    private debug;
    constructor(inngest: Inngest.Any);
    append(response: SDKResponse): void;
    addPending(response: SDKResponse, deadline: number): void;
    acknowledgePending(requestId: string): void;
    private sendFlushRequest;
    flush(hashedSigningKey: string | undefined): Promise<void>;
}
//# sourceMappingURL=buffer.d.ts.map