"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryWithBackoff = exports.resolveNextTick = exports.runAsPromise = exports.createTimeoutPromise = exports.createDeferredPromiseWithStack = exports.createDeferredPromise = exports.resolveAfterPending = exports.createFrozenPromise = void 0;
/**
 * Some environments don't allow access to the global queueMicrotask(). While we
 * had assumed this was only true for those powered by earlier versions of Node
 * (<14) that we don't officially support, Vercel's Edge Functions also obscure
 * the function in dev, even though the platform it's based on (Cloudflare
 * Workers) appropriately exposes it. Even worse, production Vercel Edge
 * Functions can see the function, but it immediately blows up the function when
 * used.
 *
 * Therefore, we can fall back to a reasonable alternative of
 * `Promise.resolve().then(fn)` instead. This _may_ be slightly slower in modern
 * environments, but at least we can still work in these environments.
 */
const shimQueueMicrotask = (callback) => {
    void Promise.resolve().then(callback);
};
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
const createFrozenPromise = () => {
    return new Promise(() => undefined);
};
exports.createFrozenPromise = createFrozenPromise;
/**
 * Returns a Promise that resolves after the current event loop's microtasks
 * have finished, but before the next event loop tick.
 */
const resolveAfterPending = (count = 100) => {
    /**
     * This uses a brute force implementation that will continue to enqueue
     * microtasks 10 times before resolving. This is to ensure that the microtask
     * queue is drained, even if the microtask queue is being manipulated by other
     * code.
     *
     * While this still doesn't guarantee that the microtask queue is drained,
     * it's our best bet for giving other non-controlled promises a chance to
     * resolve before we continue without resorting to falling in to the next
     * tick.
     */
    return new Promise((resolve) => {
        let i = 0;
        const iterate = () => {
            shimQueueMicrotask(() => {
                if (i++ > count) {
                    return resolve();
                }
                iterate();
            });
        };
        iterate();
    });
};
exports.resolveAfterPending = resolveAfterPending;
/**
 * Creates and returns Promise that can be resolved or rejected with the
 * returned `resolve` and `reject` functions.
 *
 * Resolving or rejecting the function will return a new set of Promise control
 * functions. These can be ignored if the original Promise is all that's needed.
 */
const createDeferredPromise = () => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = (value) => {
            _resolve(value);
            return (0, exports.createDeferredPromise)();
        };
        reject = (reason) => {
            _reject(reason);
            return (0, exports.createDeferredPromise)();
        };
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { promise, resolve: resolve, reject: reject };
};
exports.createDeferredPromise = createDeferredPromise;
/**
 * Creates and returns a deferred Promise that can be resolved or rejected with
 * the returned `resolve` and `reject` functions.
 *
 * For each Promise resolved or rejected this way, this will also keep a stack
 * of all unhandled Promises, resolved or rejected.
 *
 * Once a Promise is read, it is removed from the stack.
 */
const createDeferredPromiseWithStack = () => {
    const settledPromises = [];
    let rotateQueue = () => { };
    const results = (function () {
        return __asyncGenerator(this, arguments, function* () {
            while (true) {
                const next = settledPromises.shift();
                if (next) {
                    yield yield __await(next);
                }
                else {
                    yield __await(new Promise((resolve) => {
                        rotateQueue = resolve;
                    }));
                }
            }
        });
    })();
    const shimDeferredPromise = (deferred) => {
        const originalResolve = deferred.resolve;
        const originalReject = deferred.reject;
        deferred.resolve = (value) => {
            settledPromises.push(deferred.promise);
            rotateQueue();
            return shimDeferredPromise(originalResolve(value));
        };
        deferred.reject = (reason) => {
            settledPromises.push(deferred.promise);
            rotateQueue();
            return shimDeferredPromise(originalReject(reason));
        };
        return deferred;
    };
    const deferred = shimDeferredPromise((0, exports.createDeferredPromise)());
    return { deferred, results };
};
exports.createDeferredPromiseWithStack = createDeferredPromiseWithStack;
/**
 * Creates a Promise that will resolve after the given duration, along with
 * methods to start, clear, and reset the timeout.
 */
const createTimeoutPromise = (duration) => {
    const { promise, resolve } = (0, exports.createDeferredPromise)();
    let timeout;
    // eslint-disable-next-line prefer-const
    let ret;
    const start = () => {
        if (timeout)
            return ret;
        timeout = setTimeout(() => {
            resolve();
        }, duration);
        return ret;
    };
    const clear = () => {
        clearTimeout(timeout);
        timeout = undefined;
    };
    const reset = () => {
        clear();
        return start();
    };
    ret = Object.assign(promise, { start, clear, reset });
    return ret;
};
exports.createTimeoutPromise = createTimeoutPromise;
/**
 * Take any function and safely promisify such that both synchronous and
 * asynchronous errors are caught and returned as a rejected Promise.
 *
 * The passed `fn` can be undefined to support functions that may conditionally
 * be defined.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runAsPromise = (fn
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Promise.resolve().then(fn);
};
exports.runAsPromise = runAsPromise;
/**
 * Returns a Promise that resolve after the current event loop tick.
 */
const resolveNextTick = () => {
    return new Promise((resolve) => setTimeout(resolve));
};
exports.resolveNextTick = resolveNextTick;
const retryWithBackoff = async (fn, opts) => {
    var _a;
    const maxAttempts = (opts === null || opts === void 0 ? void 0 : opts.maxAttempts) || 5;
    const baseDelay = (_a = opts === null || opts === void 0 ? void 0 : opts.baseDelay) !== null && _a !== void 0 ? _a : 100;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            if (attempt >= maxAttempts) {
                throw err;
            }
            const jitter = Math.random() * baseDelay;
            const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error("Max retries reached; this should be unreachable.");
};
exports.retryWithBackoff = retryWithBackoff;
//# sourceMappingURL=promises.js.map