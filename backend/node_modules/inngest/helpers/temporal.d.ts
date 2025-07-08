import { type Temporal } from "temporal-polyfill";
/**
 * A type that represents a `Temporal.Instant` object.
 *
 * `*Like` types are available for many temporal objects, but not all of them.
 * Also, the `*Like` types can sometimes be linked to particular
 * implementations, and are not stable between them.
 *
 * Therefore, we try to detect only the hopefully-stable branding.
 */
export type InstantLike = {
    readonly [Symbol.toStringTag]: "Temporal.Instant";
};
/**
 * A type that represents a `Temporal.Duration` object.
 *
 * `*Like` types are available for many temporal objects, but not all of them.
 * Also, the `*Like` types can sometimes be linked to particular
 * implementations, and are not stable between them.
 *
 * Therefore, we try to detect only the hopefully-stable branding.
 */
export type DurationLike = {
    readonly [Symbol.toStringTag]: "Temporal.Duration";
};
/**
 * A type that represents a `Temporal.ZonedDateTime` object.
 *
 * `*Like` types are available for many temporal objects, but not all of them.
 * Also, the `*Like` types can sometimes be linked to particular
 * implementations, and are not stable between them.
 *
 * Therefore, we try to detect only the hopefully-stable branding.
 */
export type ZonedDateTimeLike = {
    readonly [Symbol.toStringTag]: "Temporal.ZonedDateTime";
};
/**
 * Asserts that the given `input` is a `Temporal.Duration` object.
 */
export declare const isTemporalDuration: (
/**
 * The input to check.
 */
input: unknown) => input is Temporal.Duration;
/**
 * Asserts that the given `input` is a `Temporal.TimeZone` object.
 */
export declare const isTemporalInstant: (
/**
 * The input to check.
 */
input: unknown) => input is Temporal.Instant;
/**
 * Asserts that the given `input` is a `Temporal.ZonedDateTime` object.
 */
export declare const isTemporalZonedDateTime: (
/**
 * The input to check.
 */
input: unknown) => input is Temporal.ZonedDateTime;
/**
 * Converts a given `Date`, `string`, `Temporal.Instant`, or
 * `Temporal.ZonedDateTime` to an ISO 8601 string.
 */
export declare const getISOString: (time: Date | string | InstantLike | ZonedDateTimeLike) => string;
//# sourceMappingURL=temporal.d.ts.map