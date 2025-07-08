"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionStoppedRunningErr = exports.rethrowError = exports.OutgoingResultError = exports.fixEventKeyMissingSteps = exports.prettyError = exports.getErrorMessage = exports.minifyPrettyError = exports.prettyErrorSplitter = exports.ErrCode = exports.deserializeError = exports.isSerializedError = exports.serializeError = void 0;
const chalk_1 = __importDefault(require("chalk"));
const json_stringify_safe_1 = __importDefault(require("json-stringify-safe"));
const serialize_error_cjs_1 = require("serialize-error-cjs");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const zod_1 = require("zod");
const NonRetriableError_js_1 = require("../components/NonRetriableError.js");
const SERIALIZED_KEY = "__serialized";
const SERIALIZED_VALUE = true;
/**
 * Add first-class support for certain errors that we control, in addition to
 * built-in errors such as `TypeError`.
 *
 * Adding these allows these non-standard errors to be correctly serialized,
 * sent to Inngest, then deserialized back into the correct error type for users
 * to react to correctly.
 *
 * Note that these errors only support `message?: string | undefined` as the
 * input; more custom errors are not supported with this current strategy.
 */
serialize_error_cjs_1.errorConstructors.set("NonRetriableError", NonRetriableError_js_1.NonRetriableError);
/**
 * Serialise an error to a serialized JSON string.
 *
 * Errors do not serialise nicely to JSON, so we use this function to convert
 * them to a serialized JSON string. Doing this is also non-trivial for some
 * errors, so we use the `serialize-error` package to do it for us.
 *
 * See {@link https://www.npmjs.com/package/serialize-error}
 *
 * This function is a small wrapper around that package to also add a `type`
 * property to the serialised error, so that we can distinguish between
 * serialised errors and other objects.
 *
 * Will not reserialise existing serialised errors.
 */
const serializeError = (
/**
 * The suspected error to serialize.
 */
subject, 
/**
 * If `true` and the error is not serializable, will return the original value
 * as `unknown` instead of coercing it to a serialized error.
 */
allowUnknown = false) => {
    try {
        // Try to understand if this is already done.
        // Will handle stringified errors.
        const existingSerializedError = (0, exports.isSerializedError)(subject);
        if (existingSerializedError) {
            return existingSerializedError;
        }
        if (typeof subject === "object" && subject !== null) {
            // Is an object, so let's try and serialize it.
            const serializedErr = (0, serialize_error_cjs_1.serializeError)(subject);
            // Not a proper error was caught, so give us a chance to return `unknown`.
            if (!serializedErr.name && allowUnknown) {
                return subject;
            }
            // Serialization can succeed but assign no name or message, so we'll
            // map over the result here to ensure we have everything.
            // We'll just stringify the entire subject for the message, as this at
            // least provides some context for the user.
            const ret = Object.assign(Object.assign({}, serializedErr), { name: serializedErr.name || "Error", message: serializedErr.message ||
                    (0, json_stringify_safe_1.default)(subject) ||
                    "Unknown error; error serialization could not find a message.", stack: serializedErr.stack || "", [SERIALIZED_KEY]: SERIALIZED_VALUE });
            // If we have a cause, make sure we recursively serialize them too. We are
            // lighter with causes though; attempt to recursively serialize them, but
            // stop if we find something that doesn't work and just return `unknown`.
            let target = ret;
            const maxDepth = 5;
            for (let i = 0; i < maxDepth; i++) {
                if (typeof target === "object" &&
                    target !== null &&
                    "cause" in target &&
                    target.cause) {
                    target = target.cause = (0, exports.serializeError)(target.cause, true);
                    continue;
                }
                break;
            }
            return ret;
        }
        // If it's not an object, it's hard to parse this as an Error. In this case,
        // we'll throw an error to start attempting backup strategies.
        throw new Error("Error is not an object; strange throw value.");
    }
    catch (err) {
        if (allowUnknown) {
            // If we are allowed to return unknown, we'll just return the original
            // value.
            return subject;
        }
        try {
            // If serialization fails, fall back to a regular Error and use the
            // original object as the message for an Error. We don't know what this
            // object looks like, so we can't do anything else with it.
            return Object.assign(Object.assign({}, (0, exports.serializeError)(new Error(typeof subject === "string" ? subject : (0, json_stringify_safe_1.default)(subject)), false)), { 
                // Remove the stack; it's not relevant here
                stack: "", [SERIALIZED_KEY]: SERIALIZED_VALUE });
        }
        catch (err) {
            // If this failed, then stringifying the object also failed, so we'll just
            // return a completely generic error.
            // Failing to stringify the object is very unlikely.
            return {
                name: "Could not serialize source error",
                message: "Serializing the source error failed.",
                stack: "",
                [SERIALIZED_KEY]: SERIALIZED_VALUE,
            };
        }
    }
};
exports.serializeError = serializeError;
/**
 * Check if an object or a string is a serialised error created by
 * {@link serializeError}.
 */
const isSerializedError = (value) => {
    try {
        if (typeof value === "string") {
            const parsed = zod_1.z
                .object({
                [SERIALIZED_KEY]: zod_1.z.literal(SERIALIZED_VALUE),
                name: zod_1.z.enum([...Array.from(serialize_error_cjs_1.errorConstructors.keys())]),
                message: zod_1.z.string(),
                stack: zod_1.z.string(),
            })
                .passthrough()
                .safeParse(JSON.parse(value));
            if (parsed.success) {
                return parsed.data;
            }
        }
        if (typeof value === "object" && value !== null) {
            const objIsSerializedErr = Object.prototype.hasOwnProperty.call(value, SERIALIZED_KEY) &&
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                value[SERIALIZED_KEY] ===
                    SERIALIZED_VALUE;
            if (objIsSerializedErr) {
                return value;
            }
        }
    }
    catch (_a) {
        // no-op; we'll return undefined if parsing failed, as it isn't a serialized
        // error
    }
};
exports.isSerializedError = isSerializedError;
/**
 * Deserialise an error created by {@link serializeError}.
 *
 * Ensures we only deserialise errors that meet a minimum level of
 * applicability, inclusive of error handling to ensure that badly serialized
 * errors are still handled.
 */
const deserializeError = (subject, allowUnknown = false) => {
    const requiredFields = ["name", "message"];
    try {
        const hasRequiredFields = requiredFields.every((field) => {
            return Object.prototype.hasOwnProperty.call(subject, field);
        });
        if (!hasRequiredFields) {
            throw new Error();
        }
        const deserializedErr = (0, serialize_error_cjs_1.deserializeError)(subject);
        if ("cause" in deserializedErr) {
            deserializedErr.cause = (0, exports.deserializeError)(deserializedErr.cause, true);
        }
        return deserializedErr;
    }
    catch (_a) {
        if (allowUnknown) {
            // If we are allowed to return unknown, we'll just return the original
            // value.
            return subject;
        }
        const err = new Error("Unknown error; could not reserialize");
        /**
         * Remove the stack so that it's not misleadingly shown as the Inngest
         * internals.
         */
        err.stack = undefined;
        return err;
    }
};
exports.deserializeError = deserializeError;
var ErrCode;
(function (ErrCode) {
    ErrCode["NESTING_STEPS"] = "NESTING_STEPS";
    /**
     * Legacy v0 execution error code for when a function has changed and no
     * longer matches its in-progress state.
     *
     * @deprecated Not for use in latest execution method.
     */
    ErrCode["NON_DETERMINISTIC_FUNCTION"] = "NON_DETERMINISTIC_FUNCTION";
    /**
     * Legacy v0 execution error code for when a function is found to be using
     * async actions after memoziation has occurred, which v0 doesn't support.
     *
     * @deprecated Not for use in latest execution method.
     */
    ErrCode["ASYNC_DETECTED_AFTER_MEMOIZATION"] = "ASYNC_DETECTED_AFTER_MEMOIZATION";
    /**
     * Legacy v0 execution error code for when a function is found to be using
     * steps after a non-step async action has occurred.
     *
     * @deprecated Not for use in latest execution method.
     */
    ErrCode["STEP_USED_AFTER_ASYNC"] = "STEP_USED_AFTER_ASYNC";
    ErrCode["AUTOMATIC_PARALLEL_INDEXING"] = "AUTOMATIC_PARALLEL_INDEXING";
})(ErrCode || (exports.ErrCode = ErrCode = {}));
exports.prettyErrorSplitter = "=================================================";
/**
 * Given an unknown `err`, mutate it to minify any pretty errors that it
 * contains.
 */
const minifyPrettyError = (err) => {
    var _a, _b, _c, _d;
    try {
        if (!isError(err)) {
            return err;
        }
        const isPrettyError = err.message.includes(exports.prettyErrorSplitter);
        if (!isPrettyError) {
            return err;
        }
        const sanitizedMessage = (0, strip_ansi_1.default)(err.message);
        const message = ((_b = (_a = sanitizedMessage.split("  ")[1]) === null || _a === void 0 ? void 0 : _a.split("\n")[0]) === null || _b === void 0 ? void 0 : _b.trim()) || err.message;
        const code = ((_d = (_c = sanitizedMessage.split("\n\nCode: ")[1]) === null || _c === void 0 ? void 0 : _c.split("\n\n")[0]) === null || _d === void 0 ? void 0 : _d.trim()) ||
            undefined;
        err.message = [code, message].filter(Boolean).join(" - ");
        if (err.stack) {
            const sanitizedStack = (0, strip_ansi_1.default)(err.stack);
            const stackRest = sanitizedStack
                .split(`${exports.prettyErrorSplitter}\n`)
                .slice(2)
                .join("\n");
            err.stack = `${err.name}: ${err.message}\n${stackRest}`;
        }
        return err;
    }
    catch (noopErr) {
        return err;
    }
};
exports.minifyPrettyError = minifyPrettyError;
/**
 * Given an `err`, return a boolean representing whether it is in the shape of
 * an `Error` or not.
 */
const isError = (err) => {
    try {
        if (err instanceof Error) {
            return true;
        }
        const hasName = Object.prototype.hasOwnProperty.call(err, "name");
        const hasMessage = Object.prototype.hasOwnProperty.call(err, "message");
        return hasName && hasMessage;
    }
    catch (noopErr) {
        return false;
    }
};
/**
 * Given an `unknown` object, retrieve the `message` property from it, or fall
 * back to the `fallback` string if it doesn't exist or is empty.
 */
const getErrorMessage = (err, fallback) => {
    const { message } = zod_1.z
        .object({ message: zod_1.z.string().min(1) })
        .catch({ message: fallback })
        .parse(err);
    return message;
};
exports.getErrorMessage = getErrorMessage;
/**
 * Given a {@link PrettyError}, return a nicely-formatted string ready to log
 * or throw.
 *
 * Useful for ensuring that errors are logged in a consistent, helpful format
 * across the SDK by prompting for key pieces of information.
 */
const prettyError = ({ type = "error", whatHappened, otherwise, reassurance, toFixNow, why, consequences, stack, code, }) => {
    var _a, _b;
    const { icon, colorFn } = {
        error: { icon: "❌", colorFn: chalk_1.default.red },
        warn: { icon: "⚠️", colorFn: chalk_1.default.yellow },
    }[type];
    let header = `${icon}  ${chalk_1.default.bold.underline(whatHappened.trim())}`;
    if (stack) {
        header +=
            "\n" +
                [...(((_a = new Error().stack) === null || _a === void 0 ? void 0 : _a.split("\n").slice(1).filter(Boolean)) || [])].join("\n");
    }
    let toFixNowStr = (_b = (Array.isArray(toFixNow)
        ? toFixNow
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s, i) => `\t${i + 1}. ${s}`)
            .join("\n")
        : toFixNow === null || toFixNow === void 0 ? void 0 : toFixNow.trim())) !== null && _b !== void 0 ? _b : "";
    if (Array.isArray(toFixNow) && toFixNowStr) {
        toFixNowStr = `To fix this, you can take one of the following courses of action:\n\n${toFixNowStr}`;
    }
    let body = [reassurance === null || reassurance === void 0 ? void 0 : reassurance.trim(), why === null || why === void 0 ? void 0 : why.trim(), consequences === null || consequences === void 0 ? void 0 : consequences.trim()]
        .filter(Boolean)
        .join(" ");
    body += body ? `\n\n${toFixNowStr}` : toFixNowStr;
    const trailer = [otherwise === null || otherwise === void 0 ? void 0 : otherwise.trim()].filter(Boolean).join(" ");
    const message = [
        exports.prettyErrorSplitter,
        header,
        body,
        trailer,
        code ? `Code: ${code}` : "",
        exports.prettyErrorSplitter,
    ]
        .filter(Boolean)
        .join("\n\n");
    return colorFn(message);
};
exports.prettyError = prettyError;
exports.fixEventKeyMissingSteps = [
    "Set the `INNGEST_EVENT_KEY` environment variable",
    `Pass a key to the \`new Inngest()\` constructor using the \`${"eventKey"}\` option`,
    `Use \`inngest.${"setEventKey"}()\` at runtime`,
];
/**
 * An error that, when thrown, indicates internally that an outgoing operation
 * contains an error.
 *
 * We use this because serialized `data` sent back to Inngest may differ from
 * the error instance itself due to middleware.
 *
 * @internal
 */
class OutgoingResultError extends Error {
    constructor(result) {
        super("OutgoingOpError");
        this.result = result;
    }
}
exports.OutgoingResultError = OutgoingResultError;
/**
 * Create a function that will rethrow an error with a prefix added to the
 * message.
 *
 * Useful for adding context to errors that are rethrown.
 *
 * @example
 * ```ts
 * await doSomeAction().catch(rethrowError("Failed to do some action"));
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rethrowError = (prefix) => {
    return (err) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
            err.message && (err.message = `${prefix}; ${err.message}`);
        }
        catch (noopErr) {
            // no-op
        }
        finally {
            // eslint-disable-next-line no-unsafe-finally
            throw err;
        }
    };
};
exports.rethrowError = rethrowError;
/**
 * Legacy v0 execution error for functions that don't support mixing steps and
 * regular async actions.
 */
const functionStoppedRunningErr = (code) => {
    return (0, exports.prettyError)({
        whatHappened: "Your function was stopped from running",
        why: "We detected a mix of asynchronous logic, some using step tooling and some not.",
        consequences: "This can cause unexpected behaviour when a function is paused and resumed and is therefore strongly discouraged; we stopped your function to ensure nothing unexpected happened!",
        stack: true,
        toFixNow: "Ensure that your function is either entirely step-based or entirely non-step-based, by either wrapping all asynchronous logic in `step.run()` calls or by removing all `step.*()` calls.",
        otherwise: "For more information on why step functions work in this manner, see https://www.inngest.com/docs/functions/multi-step#gotchas",
        code,
    });
};
exports.functionStoppedRunningErr = functionStoppedRunningErr;
//# sourceMappingURL=errors.js.map