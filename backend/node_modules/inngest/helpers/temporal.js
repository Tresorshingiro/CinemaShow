"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getISOString = exports.isTemporalZonedDateTime = exports.isTemporalInstant = exports.isTemporalDuration = void 0;
/**
 * Asserts that the given `input` is a `Temporal.Duration` object.
 */
const isTemporalDuration = (
/**
 * The input to check.
 */
input) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        return input[Symbol.toStringTag] === "Temporal.Duration";
    }
    catch (_a) {
        return false;
    }
};
exports.isTemporalDuration = isTemporalDuration;
/**
 * Asserts that the given `input` is a `Temporal.TimeZone` object.
 */
const isTemporalInstant = (
/**
 * The input to check.
 */
input) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        return input[Symbol.toStringTag] === "Temporal.Instant";
    }
    catch (_a) {
        return false;
    }
};
exports.isTemporalInstant = isTemporalInstant;
/**
 * Asserts that the given `input` is a `Temporal.ZonedDateTime` object.
 */
const isTemporalZonedDateTime = (
/**
 * The input to check.
 */
input) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        return input[Symbol.toStringTag] === "Temporal.ZonedDateTime";
    }
    catch (_a) {
        return false;
    }
};
exports.isTemporalZonedDateTime = isTemporalZonedDateTime;
/**
 * Converts a given `Date`, `string`, `Temporal.Instant`, or
 * `Temporal.ZonedDateTime` to an ISO 8601 string.
 */
const getISOString = (time) => {
    if (typeof time === "string") {
        return new Date(time).toISOString();
    }
    if (time instanceof Date) {
        return time.toISOString();
    }
    if ((0, exports.isTemporalZonedDateTime)(time)) {
        return time.toInstant().toString();
    }
    if ((0, exports.isTemporalInstant)(time)) {
        return time.toString();
    }
    throw new TypeError("Invalid date input");
};
exports.getISOString = getISOString;
//# sourceMappingURL=temporal.js.map