import { type Instrumentation } from "@opentelemetry/instrumentation";
import { InngestSpanProcessor } from "./processor.js";
export type Behaviour = "createProvider" | "extendProvider" | "off" | "auto";
export type Instrumentations = (Instrumentation | Instrumentation[])[];
export declare const createProvider: (behaviour: Behaviour, instrumentations?: Instrumentations | undefined) => {
    success: true;
    processor: InngestSpanProcessor;
} | {
    success: false;
};
/**
 * Attempts to extend the existing OTel provider with our processor. Returns true
 * if the provider was extended, false if it was not.
 */
export declare const extendProvider: (behaviour: Behaviour) => {
    success: true;
    processor: InngestSpanProcessor;
} | {
    success: false;
};
//# sourceMappingURL=util.d.ts.map