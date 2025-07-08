import { type Context, type StepOptions } from "../../types.js";
import { type Inngest } from "../Inngest.js";
export interface AsyncContext {
    /**
     * The Inngest App that is currently being used to execute the function.
     */
    app: Inngest.Like;
    /**
     * The `ctx` object that has been passed in to this function execution,
     * including values such as `step` and `event`.
     */
    ctx: Context.Any;
    /**
     * If present, this indicates we are currently executing a `step.run()` step's
     * callback. Useful to understand whether we are in the context of a step
     * execution or within the main function body.
     */
    executingStep?: StepOptions;
}
/**
 * A type that represents a partial, runtime-agnostic interface of
 * `AsyncLocalStorage`.
 */
type AsyncLocalStorageIsh = {
    getStore: () => AsyncContext | undefined;
    run: <R>(store: AsyncContext, fn: () => R) => R;
};
/**
 * Retrieve the async context for the current execution.
 */
export declare const getAsyncCtx: () => Promise<AsyncContext | undefined>;
/**
 * Get a singleton instance of `AsyncLocalStorage` used to store and retrieve
 * async context for the current execution.
 */
export declare const getAsyncLocalStorage: () => Promise<AsyncLocalStorageIsh>;
export {};
//# sourceMappingURL=als.d.ts.map