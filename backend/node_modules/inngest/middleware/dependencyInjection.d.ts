import { InngestMiddleware } from "../components/InngestMiddleware.js";
/**
 * Adds properties to the function input for every function created using this
 * app.
 */
export declare const dependencyInjectionMiddleware: <TCtx extends Record<string, any>>(
/**
 * The context to inject into the function input.
 */
ctx: TCtx) => InngestMiddleware<{
    name: string;
    init(): {
        onFunctionRun(): {
            transformInput(): {
                ctx: TCtx;
            };
        };
    };
}>;
//# sourceMappingURL=dependencyInjection.d.ts.map