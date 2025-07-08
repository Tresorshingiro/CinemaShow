/**
 * An adapter for AWS Lambda to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example
 *
 * ```ts
 * import { Inngest } from "inngest";
 * import { serve } from "inngest/lambda";
 *
 * const inngest = new Inngest({ id: "my-lambda-app" });
 *
 * const fn = inngest.createFunction(
 *   { id: "hello-world" },
 *   { event: "test/hello.world" },
 *   async ({ event }) => {
 *    return "Hello World";
 *  }
 * );
 *
 * export const handler = serve({ client: inngest, functions: [fn] });
 * ```
 *
 * @module
 */
import { type APIGatewayEvent, type APIGatewayProxyEventV2, type APIGatewayProxyResult, type Context } from "aws-lambda";
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type Either } from "./helpers/types.js";
import { type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * With AWS Lambda, serve and register any declared functions with Inngest,
 * making them available to be triggered by events.
 *
 * @example
 *
 * ```ts
 * import { Inngest } from "inngest";
 * import { serve } from "inngest/lambda";
 *
 * const inngest = new Inngest({ id: "my-lambda-app" });
 *
 * const fn = inngest.createFunction(
 *   { id: "hello-world" },
 *   { event: "test/hello.world" },
 *   async ({ event }) => {
 *    return "Hello World";
 *  }
 * );
 *
 * export const handler = serve({ client: inngest, functions: [fn] });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((event: Either<APIGatewayEvent, APIGatewayProxyEventV2>, _context: Context) => Promise<APIGatewayProxyResult>);
//# sourceMappingURL=lambda.d.ts.map