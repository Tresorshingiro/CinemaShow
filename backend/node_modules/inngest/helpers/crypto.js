"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntropy = createEntropy;
/**
 * Create a cryptographically secure random value.
 *
 * @throws {Error} If the crypto module is not available.
 */
function createEntropy(byteLength) {
    const bytes = new Uint8Array(byteLength);
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto#browser_compatibility
    const { crypto } = globalThis;
    if (!crypto) {
        // This should only happen in Node <19.
        throw new Error("missing crypto module");
    }
    if (!crypto.getRandomValues) {
        throw new Error("missing crypto.getRandomValues");
    }
    crypto.getRandomValues(bytes);
    return bytes;
}
//# sourceMappingURL=crypto.js.map