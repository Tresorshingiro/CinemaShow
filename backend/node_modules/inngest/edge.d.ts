/**
 * An adapter for any request that handles standard Web APIs such as `fetch`,
 * `Request,` and `Response` to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * This is reused by many other adapters, but can be used directly.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/edge";
 * import functions from "~/inngest";
 *
 * export const handler = serve({ id: "my-edge-app", functions });
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
 * In an edge runtime, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * The edge runtime is a generic term for any serverless runtime that supports
 * only standard Web APIs such as `fetch`, `Request`, and `Response`, such as
 * Cloudflare Workers, Vercel Edge Functions, and AWS Lambda@Edge.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/edge";
 * import functions from "~/inngest";
 *
 * export const handler = serve({ id: "my-edge-app", functions });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((req: Request) => Promise<Response>);
//# sourceMappingURL=edge.d.ts.map