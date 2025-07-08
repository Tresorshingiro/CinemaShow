"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceFunction = exports.InngestFunctionReference = void 0;
/**
 * A reference to an `InngestFunction` that can be used to represent both local
 * and remote functions without pulling in the full function definition (i.e.
 * dependencies).
 *
 * These references can be invoked in the same manner as a regular
 * `InngestFunction`.
 *
 * To create a reference function, use the {@link referenceFunction} helper.
 *
 * @public
 */
class InngestFunctionReference {
    constructor(opts) {
        this.opts = opts;
    }
}
exports.InngestFunctionReference = InngestFunctionReference;
/**
 * Create a reference to an `InngestFunction` that can be used to represent both
 * local and remote functions without pulling in the full function definition
 * (i.e. dependencies).
 *
 * These references can be invoked in the same manner as a regular
 * `InngestFunction`.
 *
 * @public
 */
const referenceFunction = ({ functionId, appId, }) => {
    return new InngestFunctionReference({
        functionId,
        appId,
    });
};
exports.referenceFunction = referenceFunction;
//# sourceMappingURL=InngestFunctionReference.js.map