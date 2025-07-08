/**
 * An adapter for SvelteKit to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * // app/routes/api.inngest.ts
 * // (for Remix 1, use app/routes/api/inngest.ts)
 * import { serve } from "inngest/remix";
 * import { inngest } from "~/inngest/client";
 * import fnA from "~/inngest/fnA";
 *
 * const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 *
 * export { handler as action, handler as loader };
 * ```
 *
 * @module
 */
import { type RequestEvent } from "@sveltejs/kit";
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * Using SvelteKit, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 * ```ts
 * // app/routes/api.inngest.ts
 * // (for Remix 1, use app/routes/api/inngest.ts)
 * import { serve } from "inngest/remix";
 * import { inngest } from "~/inngest/client";
 * import fnA from "~/inngest/fnA";
 *
 * const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 *
 * export { handler as action, handler as loader };
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((event: RequestEvent) => Promise<Response>) & {
    GET: (event: RequestEvent) => Promise<Response>;
    POST: (event: RequestEvent) => Promise<Response>;
    PUT: (event: RequestEvent) => Promise<Response>;
};
//# sourceMappingURL=sveltekit.d.ts.map