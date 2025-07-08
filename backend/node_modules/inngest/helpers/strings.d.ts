/**
 * Safely `JSON.stringify()` an `input`, handling circular refernences and
 * removing `BigInt` values.
 */
export declare const stringify: (input: any) => string;
/**
 * Returns a slugified string used to generate consistent IDs.
 *
 * This can be used to generate a consistent ID for a function when migrating
 * from v2 to v3 of the SDK.
 *
 * @public
 */
export declare const slugify: (str: string) => string;
/**
 * Convert a given `Date`, `number`, or `ms`-compatible `string` to a
 * Inngest sleep-compatible time string (e.g. `"1d"` or `"2h3010s"`).
 *
 * Can optionally provide a `now` date to use as the base for the calculation,
 * otherwise a new date will be created on invocation.
 */
export declare const timeStr: (
/**
 * The future date to use to convert to a time string.
 */
input: string | number | Date) => string;
/**
 * Given an unknown input, stringify it if it's a boolean, a number, or a
 * string, else return `undefined`.
 */
export declare const stringifyUnknown: (input: unknown) => string | undefined;
export declare const hashEventKey: (eventKey: string) => string;
export declare const hashSigningKey: (signingKey: string | undefined) => string;
//# sourceMappingURL=strings.d.ts.map