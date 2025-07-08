/**
 * An adapter for Express to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/express";
 * import { inngest } from "./src/inngest/client";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * // Important:  ensure you add JSON middleware to process incoming JSON POST payloads.
 * app.use(express.json());
 * app.use(
 *   // Expose the middleware on our recommended path at `/api/inngest`.
 *   "/api/inngest",
 *   serve({ client: inngest, functions: [fnA] })
 * );
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
 * Serve and register any declared functions with Inngest, making them available
 * to be triggered by events.
 *
 * The return type is currently `any` to ensure there's no required type matches
 * between the `express` and `vercel` packages. This may change in the future to
 * appropriately infer.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/express";
 * import { inngest } from "./src/inngest/client";
 * import fnA from "./src/inngest/fnA"; // Your own function
 *
 * // Important:  ensure you add JSON middleware to process incoming JSON POST payloads.
 * app.use(express.json());
 * app.use(
 *   // Expose the middleware on our recommended path at `/api/inngest`.
 *   "/api/inngest",
 *   serve({ client: inngest, functions: [fnA] })
 * );
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => any;
//# sourceMappingURL=express.d.ts.map