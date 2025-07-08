/**
 * An adapter for Nitro to serve and register any declared functions with
 * Inngest, making them available to be triggered by events.
 *
 * @module
 */
import { type ServeHandlerOptions } from "./components/InngestCommHandler.js";
import { serve as serveH3 } from "./h3.js";
import { type SupportedFrameworkName } from "./types.js";
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
export declare const frameworkName: SupportedFrameworkName;
/**
 * In Nitro, serve and register any declared functions with Inngest, making them
 * available to be triggered by events.
 *
 * @public
 */
export declare const serve: (options: ServeHandlerOptions) => ReturnType<typeof serveH3>;
//# sourceMappingURL=nitro.d.ts.map