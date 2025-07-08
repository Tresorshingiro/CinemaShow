/**
 * An adapter for Fastify to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @example Plugin (recommended)
 * ```ts
 * import Fastify from "fastify";
 * import inngestFastify from "inngest/fastify";
 * import { inngest, fnA } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.register(inngestFastify, {
 *   client: inngest,
 *   functions: [fnA],
 *   options: {},
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @example Route
 * ```ts
 * import Fastify from "fastify";
 * import { serve } from "inngest/fastify";
 * import { fnA, inngest } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.route({
 *   method: ["GET", "POST", "PUT"],
 *   handler: serve({ client: inngest, functions: [fnA] }),
 *   url: "/api/inngest",
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @module
 */
import { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import { type Inngest } from "./components/Inngest.js";
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { type InngestFunction } from "./components/InngestFunction.js";
import { type RegisterOptions, type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
type InngestPluginOptions = {
    client: Inngest.Like;
    functions: InngestFunction.Any[];
    options?: RegisterOptions;
};
/**
 * Serve and register any declared functions with Inngest, making them available
 * to be triggered by events.
 *
 * It's recommended to use the Fastify plugin to serve your functions with
 * Inngest instead of using this `serve()` function directly.
 *
 * @example
 * ```ts
 * import Fastify from "fastify";
 * import { serve } from "inngest/fastify";
 * import { fnA, inngest } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.route({
 *   method: ["GET", "POST", "PUT"],
 *   handler: serve({ client: inngest, functions: [fnA] }),
 *   url: "/api/inngest",
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ((req: FastifyRequest<{
    Querystring: Record<string, string | undefined>;
}>, reply: FastifyReply) => Promise<unknown>);
/**
 * Serve and register any declared functions with Inngest, making them available
 * to be triggered by events.
 *
 * @example
 * ```ts
 * import Fastify from "fastify";
 * import inngestFastify from "inngest/fastify";
 * import { inngest, fnA } from "./inngest";
 *
 * const fastify = Fastify();
 *
 * fastify.register(inngestFastify, {
 *   client: inngest,
 *   functions: [fnA],
 *   options: {},
 * });
 *
 * fastify.listen({ port: 3000 }, function (err, address) {
 *   if (err) {
 *     fastify.log.error(err);
 *     process.exit(1);
 *   }
 * });
 * ```
 *
 * @public
 */
export declare const fastifyPlugin: (fastify: FastifyInstance, options: InngestPluginOptions, done: (err?: Error | undefined) => void) => void;
export default fastifyPlugin;
//# sourceMappingURL=fastify.d.ts.map