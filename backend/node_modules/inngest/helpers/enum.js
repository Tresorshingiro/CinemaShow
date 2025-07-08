"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumFromValue = void 0;
/**
 * Returns the value of an enum from a string value.
 *
 * If the value given is not a value from the enum, `undefined` is returned.
 */
const enumFromValue = (enumType, value) => {
    if (Object.values(enumType).includes(value)) {
        return value;
    }
};
exports.enumFromValue = enumFromValue;
//# sourceMappingURL=enum.js.map