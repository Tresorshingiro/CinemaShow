"use strict";
/**
 * A file used to access client processors safely without also importing any
 * otel-specific libraries. Useful for ensuring that the otel libraries can be
 * tree-shaken if they're not used directly by the user.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientProcessorMap = void 0;
/**
 * A map of Inngest clients to their OTel span processors. This is used to
 * ensure that we only create one span processor per client, and that we can
 * access the span processor from the client without exposing the OTel
 * libraries to the user.
 */
exports.clientProcessorMap = new WeakMap();
//# sourceMappingURL=access.js.map