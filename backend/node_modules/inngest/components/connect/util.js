"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionLimitError = exports.AuthError = exports.ReconnectError = void 0;
exports.expBackoff = expBackoff;
exports.waitWithCancel = waitWithCancel;
exports.parseTraceCtx = parseTraceCtx;
const consts_1 = require("inngest/helpers/consts");
class ReconnectError extends Error {
    constructor(message, attempt) {
        super(message);
        this.attempt = attempt;
        this.name = "ReconnectError";
    }
}
exports.ReconnectError = ReconnectError;
class AuthError extends ReconnectError {
    constructor(message, attempt) {
        super(message, attempt);
        this.name = "AuthError";
    }
}
exports.AuthError = AuthError;
class ConnectionLimitError extends ReconnectError {
    constructor(attempt) {
        super("Connection limit exceeded", attempt);
        this.name = "ConnectionLimitError";
    }
}
exports.ConnectionLimitError = ConnectionLimitError;
function expBackoff(attempt) {
    var _a;
    const backoffTimes = [
        1000, 2000, 5000, 10000, 20000, 30000, 60000, 120000, 300000,
    ];
    // If attempt exceeds array length, use the last (maximum) value
    return (_a = backoffTimes[Math.min(attempt, backoffTimes.length - 1)]) !== null && _a !== void 0 ? _a : 60000;
}
/**
 * Wait for a given amount of time, but cancel if the given condition is true.
 *
 * Returns `true` if the condition was met, `false` if the timeout was reached.
 */
function waitWithCancel(ms, cancelIf) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (cancelIf()) {
                clearInterval(interval);
                resolve(true);
                return;
            }
            if (Date.now() - startTime >= ms) {
                clearInterval(interval);
                resolve(false);
                return;
            }
        }, 100);
    });
}
function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isString(value) {
    return typeof value === "string";
}
function parseTraceCtx(serializedTraceCtx) {
    const parsedTraceCtx = serializedTraceCtx.length > 0
        ? JSON.parse(new TextDecoder().decode(serializedTraceCtx))
        : null;
    if (!isObject(parsedTraceCtx)) {
        return null;
    }
    const traceParent = parsedTraceCtx[consts_1.headerKeys.TraceParent];
    if (!isString(traceParent)) {
        return null;
    }
    const traceState = parsedTraceCtx[consts_1.headerKeys.TraceState];
    if (!isString(traceState)) {
        return null;
    }
    return {
        traceParent,
        traceState,
    };
}
//# sourceMappingURL=util.js.map