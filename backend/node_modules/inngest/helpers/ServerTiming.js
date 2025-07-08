"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerTiming = void 0;
const promises_js_1 = require("./promises.js");
/**
 * A class to manage timing functions and arbitrary periods of time before
 * generating a `Server-Timing` header for use in HTTP responses.
 *
 * This is a very simple implementation that does not support nested timings or
 * fractions of a millisecond.
 */
class ServerTiming {
    constructor() {
        this.timings = {};
    }
    /**
     * Start a timing. Returns a function that, when called, will stop the timing
     * and add it to the header.
     */
    start(name, description) {
        if (!this.timings[name]) {
            this.timings[name] = {
                description: description !== null && description !== void 0 ? description : "",
                timers: [],
            };
        }
        const index = this.timings[name].timers.push({ start: Date.now() }) - 1;
        return () => {
            const target = this.timings[name];
            if (!target) {
                return console.warn(`Timing "${name}" does not exist`);
            }
            const timer = target.timers[index];
            if (!timer) {
                return console.warn(`Timer ${index} for timing "${name}" does not exist`);
            }
            timer.end = Date.now();
        };
    }
    /**
     * Add a piece of arbitrary, untimed information to the header. Common use
     * cases would be cache misses.
     *
     * @example
     * ```
     * timer.append("cache", "miss");
     * ```
     */
    append(key, value) {
        this.timings[key] = {
            description: value,
            timers: [],
        };
    }
    /**
     * Wrap a function in a timing. The timing will be stopped and added to the
     * header when the function resolves or rejects.
     *
     * The return value of the function will be returned from this function.
     */
    async wrap(name, fn, description) {
        const stop = this.start(name, description);
        try {
            return (await (0, promises_js_1.runAsPromise)(fn));
        }
        finally {
            stop();
        }
    }
    /**
     * Generate the `Server-Timing` header.
     */
    getHeader() {
        const entries = Object.entries(this.timings).reduce((acc, [name, { description, timers }]) => {
            /**
             * Ignore timers that had no end.
             */
            const hasTimersWithEnd = timers.some((timer) => timer.end);
            if (!hasTimersWithEnd) {
                return acc;
            }
            const dur = timers.reduce((acc, { start, end }) => {
                if (!start || !end)
                    return acc;
                return acc + (end - start);
            }, 0);
            const entry = [
                name,
                description ? `desc="${description}"` : "",
                dur ? `dur=${dur}` : "",
            ]
                .filter(Boolean)
                .join(";");
            return [...acc, entry];
        }, []);
        return entries.join(", ");
    }
}
exports.ServerTiming = ServerTiming;
//# sourceMappingURL=ServerTiming.js.map