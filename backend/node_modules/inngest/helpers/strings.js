"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSigningKey = exports.hashEventKey = exports.stringifyUnknown = exports.timeStr = exports.slugify = exports.stringify = void 0;
const hash_js_1 = require("hash.js");
const json_stringify_safe_1 = __importDefault(require("json-stringify-safe"));
const ms_1 = __importDefault(require("ms"));
/**
 * Safely `JSON.stringify()` an `input`, handling circular refernences and
 * removing `BigInt` values.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringify = (input) => {
    return (0, json_stringify_safe_1.default)(input, (key, value) => {
        if (typeof value !== "bigint") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return value;
        }
    });
};
exports.stringify = stringify;
/**
 * Returns a slugified string used to generate consistent IDs.
 *
 * This can be used to generate a consistent ID for a function when migrating
 * from v2 to v3 of the SDK.
 *
 * @public
 */
const slugify = (str) => {
    const join = "-";
    return str
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, join)
        .replace(/-+/g, join)
        .split(join)
        .filter(Boolean)
        .join(join);
};
exports.slugify = slugify;
const millisecond = 1;
const second = millisecond * 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
/**
 * A collection of periods in milliseconds and their suffixes used when creating
 * time strings.
 */
const periods = [
    ["w", week],
    ["d", day],
    ["h", hour],
    ["m", minute],
    ["s", second],
];
/**
 * Convert a given `Date`, `number`, or `ms`-compatible `string` to a
 * Inngest sleep-compatible time string (e.g. `"1d"` or `"2h3010s"`).
 *
 * Can optionally provide a `now` date to use as the base for the calculation,
 * otherwise a new date will be created on invocation.
 */
const timeStr = (
/**
 * The future date to use to convert to a time string.
 */
input) => {
    if (input instanceof Date) {
        return input.toISOString();
    }
    const milliseconds = typeof input === "string" ? (0, ms_1.default)(input) : input;
    const [, timeStr] = periods.reduce(([num, str], [suffix, period]) => {
        const numPeriods = Math.floor(num / period);
        if (numPeriods > 0) {
            return [num % period, `${str}${numPeriods}${suffix}`];
        }
        return [num, str];
    }, [milliseconds, ""]);
    return timeStr;
};
exports.timeStr = timeStr;
/**
 * Given an unknown input, stringify it if it's a boolean, a number, or a
 * string, else return `undefined`.
 */
const stringifyUnknown = (input) => {
    if (typeof input === "boolean" ||
        typeof input === "number" ||
        typeof input === "string") {
        return input.toString();
    }
};
exports.stringifyUnknown = stringifyUnknown;
const hashEventKey = (eventKey) => {
    return (0, hash_js_1.sha256)().update(eventKey).digest("hex");
};
exports.hashEventKey = hashEventKey;
const hashSigningKey = (signingKey) => {
    var _a;
    if (!signingKey) {
        return "";
    }
    const prefix = ((_a = signingKey.match(/^signkey-[\w]+-/)) === null || _a === void 0 ? void 0 : _a.shift()) || "";
    const key = signingKey.replace(/^signkey-[\w]+-/, "");
    // Decode the key from its hex representation into a bytestream
    return `${prefix}${(0, hash_js_1.sha256)().update(key, "hex").digest("hex")}`;
};
exports.hashSigningKey = hashSigningKey;
//# sourceMappingURL=strings.js.map