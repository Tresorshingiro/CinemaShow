/**
 * An adapter for AWS Lambda to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/redwood";
 * import { inngest } from "src/inngest/client";
 * import fnA from "src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 *   servePath: "/api/inngest",
 * });
 * ```
 *
 * @module
 */
import { type APIGatewayProxyEvent, type Context as LambdaContext } from "aws-lambda";
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type SupportedFrameworkName } from "./types.js";
export interface RedwoodResponse {
    statusCode: number;
    body?: string | null;
    headers?: Record<string, string>;
}
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * In Redwood.js, serve and register any declared functions with Inngest, making
 * them available to be triggered by events.
 *
 * @example
 * ```ts
 * import { serve } from "inngest/redwood";
 * import { inngest } from "src/inngest/client";
 * import fnA from "src/inngest/fnA"; // Your own function
 *
 * export const handler = serve({
 *   client: inngest,
 *   functions: [fnA],
 *   servePath: "/api/inngest",
 * });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((event: APIGatewayProxyEvent, _context: LambdaContext) => Promise<RedwoodResponse>);
//# sourceMappingURL=redwood.d.ts.map