/**
 * An adapter for Cloudflare Workers (and Workers on Pages) to serve and
 * register any declared functions with Inngest, making them available to be
 * triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/cloudflare";
 * import { inngest } from "../../inngest/client";
 * import fnA from "../../inngest/fnA"; // Your own function
 *
 * export const onRequest = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 * ```
 *
 * @example Cloudflare Workers
 * ```ts
 * import { serve } from "inngest/cloudflare";
 * import { inngest } from "../../inngest/client";
 * import fnA from "../../inngest/fnA"; // Your own function
 *
 * export default {
 *   fetch: serve({
 *     client: inngest,
 *     functions: [fnA],
 *   }),
 * };
 * ```
 *
 * @module
 */
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type Either } from "./helpers/types.js";
import { type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * Expected arguments for a Cloudflare Pages Function.
 */
export type PagesHandlerArgs = [
    {
        request: Request;
        env: Record<string, string | undefined>;
    }
];
/**
 * Expected arguments for a Cloudflare Worker.
 */
export type WorkersHandlerArgs = [Request, Record<string, string | undefined>];
/**
 * In Cloudflare, serve and register any declared functions with Inngest, making
 * them available to be triggered by events.
 *
 * @example Cloudflare Pages
 * ```ts
 * import { serve } from "inngest/cloudflare";
 * import { inngest } from "../../inngest/client";
 * import fnA from "../../inngest/fnA"; // Your own function
 *
 * export const onRequest = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 * ```
 *
 * @example Cloudflare Workers
 * ```ts
 * import { serve } from "inngest/cloudflare";
 * import { inngest } from "../../inngest/client";
 * import fnA from "../../inngest/fnA"; // Your own function
 *
 * export default {
 *   fetch: serve({
 *     client: inngest,
 *     functions: [fnA],
 *   }),
 * };
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((...args: Either<PagesHandlerArgs, WorkersHandlerArgs>) => Promise<Response>);
//# sourceMappingURL=cloudflare.d.ts.map