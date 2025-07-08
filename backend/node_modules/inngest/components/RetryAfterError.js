"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryAfterError = void 0;
const ms_1 = __importDefault(require("ms"));
/**
 * An error that, when thrown, indicates to Inngest that the function should be
 * retried after a given amount of time.
 *
 * A `message` must be provided, as well as a `retryAfter` parameter, which can
 * be a `number` of milliseconds, an `ms`-compatible time string, or a `Date`.
 *
 * An optional `cause` can be provided to provide more context to the error.
 *
 * @public
 */
class RetryAfterError extends Error {
    constructor(message, 
    /**
     * The time after which the function should be retried. Represents either a
     * number of milliseconds or a RFC3339 date.
     */
    retryAfter, options) {
        super(message);
        if (retryAfter instanceof Date) {
            this.retryAfter = retryAfter.toISOString();
        }
        else {
            const seconds = `${Math.ceil((typeof retryAfter === "string" ? (0, ms_1.default)(retryAfter) : retryAfter) / 1000)}`;
            if (!isFinite(Number(seconds))) {
                throw new Error("retryAfter must be a number of milliseconds, a ms-compatible string, or a Date");
            }
            this.retryAfter = seconds;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.cause = options === null || options === void 0 ? void 0 : options.cause;
    }
}
exports.RetryAfterError = RetryAfterError;
//# sourceMappingURL=RetryAfterError.js.map