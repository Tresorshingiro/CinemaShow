/**
 * An adapter for Astro to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * export const { GET, POST, PUT } = serve({
 *   client: inngest,
 *   functions: [fn1, fn2],
 * });
 * ```
 *
 * @module
 */
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * In Astro, serve and register any declared functions with Inngest, making them
 * available to be triggered by events.
 *
 * @example
 * ```ts
 * export const { GET, POST, PUT } = serve({
 *   client: inngest,
 *   functions: [fn1, fn2],
 * });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((ctx: {
    request: Request;
}) => Promise<Response>) & {
    GET: (ctx: {
        request: Request;
    }) => Promise<Response>;
    POST: (ctx: {
        request: Request;
    }) => Promise<Response>;
    PUT: (ctx: {
        request: Request;
    }) => Promise<Response>;
};
//# sourceMappingURL=astro.d.ts.map