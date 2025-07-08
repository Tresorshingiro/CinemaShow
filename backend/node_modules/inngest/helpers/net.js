"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithAuthFallback = fetchWithAuthFallback;
exports.signDataWithKey = signDataWithKey;
const canonicalize_1 = __importDefault(require("canonicalize"));
const hash_js_1 = require("hash.js");
/**
 * Send an HTTP request with the given signing key. If the response is a 401 or
 * 403, then try again with the fallback signing key
 */
async function fetchWithAuthFallback({ authToken, authTokenFallback, fetch, options, url, }) {
    let res = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.headers), { Authorization: `Bearer ${authToken}` }) }));
    if ([401, 403].includes(res.status) && authTokenFallback) {
        res = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.headers), { Authorization: `Bearer ${authTokenFallback}` }) }));
    }
    return res;
}
function signDataWithKey(data, signingKey, ts) {
    // Calculate the HMAC of the request body ourselves.
    // We make the assumption here that a stringified body is the same as the
    // raw bytes; it may be pertinent in the future to always parse, then
    // canonicalize the body to ensure it's consistent.
    const encoded = typeof data === "string" ? data : (0, canonicalize_1.default)(data);
    // Remove the `/signkey-[test|prod]-/` prefix from our signing key to calculate the HMAC.
    const key = signingKey.replace(/signkey-\w+-/, "");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const mac = (0, hash_js_1.hmac)(hash_js_1.sha256, key)
        .update(encoded)
        .update(ts)
        .digest("hex");
    return mac;
}
//# sourceMappingURL=net.js.map