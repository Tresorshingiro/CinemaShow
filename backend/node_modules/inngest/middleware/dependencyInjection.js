"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyInjectionMiddleware = void 0;
const InngestMiddleware_js_1 = require("../components/InngestMiddleware.js");
/**
 * Adds properties to the function input for every function created using this
 * app.
 */
// We can use `const` here yet due to TS constraints.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dependencyInjectionMiddleware = (
/**
 * The context to inject into the function input.
 */
ctx) => {
    return new InngestMiddleware_js_1.InngestMiddleware({
        name: "Inngest: Dependency Injection",
        init() {
            return {
                onFunctionRun() {
                    return {
                        transformInput() {
                            return {
                                ctx,
                            };
                        },
                    };
                },
            };
        },
    });
};
exports.dependencyInjectionMiddleware = dependencyInjectionMiddleware;
//# sourceMappingURL=dependencyInjection.js.map