import { type MaybePromise } from "./types.js";
/**
 * A helper function to create a `Promise` that will never settle.
 *
 * It purposefully creates no references to `resolve` or `reject` so that the
 * returned `Promise` will remain unsettled until it falls out of scope and is
 * garbage collected.
 *
 * This should be used within transient closures to fake asynchronous action, so
 * long as it's guaranteed that they will fall out of scope.
 */
export declare const createFrozenPromise: () => Promise<unknown>;
/**
 * Returns a Promise that resolves after the current event loop's microtasks
 * have finished, but before the next event loop tick.
 */
export declare const resolveAfterPending: (count?: number) => Promise<void>;
type DeferredPromiseReturn<T> = {
    promise: Promise<T>;
    resolve: (value: T) => DeferredPromiseReturn<T>;
    reject: (reason: any) => DeferredPromiseReturn<T>;
};
/**
 * Creates and returns Promise that can be resolved or rejected with the
 * returned `resolve` and `reject` functions.
 *
 * Resolving or rejecting the function will return a new set of Promise control
 * functions. These can be ignored if the original Promise is all that's needed.
 */
export declare const createDeferredPromise: <T>() => DeferredPromiseReturn<T>;
/**
 * Creates and returns a deferred Promise that can be resolved or rejected with
 * the returned `resolve` and `reject` functions.
 *
 * For each Promise resolved or rejected this way, this will also keep a stack
 * of all unhandled Promises, resolved or rejected.
 *
 * Once a Promise is read, it is removed from the stack.
 */
export declare const createDeferredPromiseWithStack: <T>() => {
    deferred: DeferredPromiseReturn<T>;
    results: AsyncGenerator<Awaited<T>, void, void>;
};
interface TimeoutPromise extends Promise<void> {
    /**
     * Starts the timeout. If the timer is already started, this does nothing.
     *
     * @returns The promise that will resolve when the timeout expires.
     */
    start: () => TimeoutPromise;
    /**
     * Clears the timeout.
     */
    clear: () => void;
    /**
     * Clears the timeout and starts it again.
     *
     * @returns The promise that will resolve when the timeout expires.
     */
    reset: () => TimeoutPromise;
}
/**
 * Creates a Promise that will resolve after the given duration, along with
 * methods to start, clear, and reset the timeout.
 */
export declare const createTimeoutPromise: (duration: number) => TimeoutPromise;
/**
 * Take any function and safely promisify such that both synchronous and
 * asynchronous errors are caught and returned as a rejected Promise.
 *
 * The passed `fn` can be undefined to support functions that may conditionally
 * be defined.
 */
export declare const runAsPromise: <T extends (() => any) | undefined>(fn: T) => Promise<T extends () => any ? Awaited<ReturnType<T>> : T>;
/**
 * Returns a Promise that resolve after the current event loop tick.
 */
export declare const resolveNextTick: () => Promise<void>;
export declare const retryWithBackoff: <T>(fn: () => MaybePromise<T>, opts?: {
    maxAttempts?: number;
    baseDelay?: number;
}) => Promise<T>;
export {};
//# sourceMappingURL=promises.d.ts.map