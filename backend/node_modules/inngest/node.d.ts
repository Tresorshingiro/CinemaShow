import http from "node:http";
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
 * @example Serve Inngest functions on all paths
 * ```ts
 * import { serve } from "inngest/node";
 * import { inngest } from "./src/inngest/client";
 * import myFn from "./src/inngest/myFn"; // Your own function
 *
 * const server = http.createServer(serve({
 *   client: inngest, functions: [myFn]
 * }));
 * server.listen(3000);
 * ```
 *
 * @example Serve Inngest on a specific path
 * ```ts
 * import { serve } from "inngest/node";
 * import { inngest } from "./src/inngest/client";
 * import myFn from "./src/inngest/myFn"; // Your own function
 *
 * const server = http.createServer((req, res) => {
 *   if (req.url.start === '/api/inngest') {
 *     return serve({
 *       client: inngest, functions: [myFn]
 *     })(req, res);
 *   }
 *   // ...
 * });
 * server.listen(3000);
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => http.RequestListener;
/**
 * EXPERIMENTAL - Create an http server to serve Inngest functions.
 *
 * @example
 * ```ts
 * import { createServer } from "inngest/node";
 * import { inngest } from "./src/inngest/client";
 * import myFn from "./src/inngest/myFn"; // Your own function
 *
 * const server = createServer({
 *   client: inngest, functions: [myFn]
 * });
 * server.listen(3000);
 * ```
 *
 * @public
 */
export declare const createServer: (options: ServeHandlerOptions) => http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
//# sourceMappingURL=node.d.ts.map