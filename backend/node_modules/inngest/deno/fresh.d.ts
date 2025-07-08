/**
 * An adapter for Deno's Fresh to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "https://esm.sh/inngest/deno/fresh";
 * import { inngest } from "./src/inngest/client.ts";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 * ```
 *
 * @module
 */
import { type ServeHandlerOptions } from "../components/InngestCommHandler.js";
import { type SupportedFrameworkName } from "../types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * With Deno's Fresh framework, serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "https://esm.sh/inngest/deno/fresh";
 * import { inngest } from "./src/inngest/client.ts";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 * });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((req: Request) => Promise<Response>);
//# sourceMappingURL=fresh.d.ts.map