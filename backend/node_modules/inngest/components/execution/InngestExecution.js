"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InngestExecution = exports.PREFERRED_EXECUTION_VERSION = exports.ExecutionVersion = void 0;
const debug_1 = __importDefault(require("debug"));
const consts_js_1 = require("../../helpers/consts.js");
/**
 * The execution models the SDK is aware of.
 *
 * This is used in a number of places to ensure all execution versions are
 * accounted for for a given operation.
 */
var ExecutionVersion;
(function (ExecutionVersion) {
    ExecutionVersion[ExecutionVersion["V0"] = 0] = "V0";
    ExecutionVersion[ExecutionVersion["V1"] = 1] = "V1";
    ExecutionVersion[ExecutionVersion["V2"] = 2] = "V2";
})(ExecutionVersion || (exports.ExecutionVersion = ExecutionVersion = {}));
/**
 * The preferred execution version that will be used by the SDK when handling
 * brand new runs where the Executor is allowing us to choose.
 *
 * Changing this should not ever be a breaking change, as this will only change
 * new runs, not existing ones.
 */
exports.PREFERRED_EXECUTION_VERSION = ExecutionVersion.V1;
class InngestExecution {
    constructor(options) {
        this.options = options;
        this.debug = (0, debug_1.default)(`${consts_js_1.debugPrefix}:${this.options.runId}`);
    }
}
exports.InngestExecution = InngestExecution;
//# sourceMappingURL=InngestExecution.js.map