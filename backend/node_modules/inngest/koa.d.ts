/**
 * An adapter for Koa to serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * const handler = serve({
 *   client: inngest,
 *   functions
 * });
 *
 * app.use((ctx) => {
 *   if (ctx.request.path === "/api/inngest") {
 *     return handler(ctx);
 *   }
 * });
 * ```
 *
 * @module
 */
import type Koa from "koa";
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * Using Koa, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * const handler = serve({
 *   client: inngest,
 *   functions
 * });
 *
 * app.use((ctx) => {
 *   if (ctx.request.path === "/api/inngest") {
 *     return handler(ctx);
 *   }
 * });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, unknown>) => Promise<void>);
//# sourceMappingURL=koa.d.ts.map