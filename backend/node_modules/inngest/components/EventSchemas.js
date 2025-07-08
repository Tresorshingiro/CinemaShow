"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSchemas = void 0;
/**
 * Provide an `EventSchemas` class to type events, providing type safety when
 * sending events and running functions via Inngest.
 *
 * You can provide generated Inngest types, custom types, types using Zod, or
 * a combination of the above. See {@link EventSchemas} for more information.
 *
 * @example
 *
 * ```ts
 * export const inngest = new Inngest({
 *   id: "my-app",
 *   schemas: new EventSchemas().fromZod({
 *     "app/user.created": {
 *       data: z.object({
 *         id: z.string(),
 *         name: z.string(),
 *       }),
 *     },
 *   }),
 * });
 * ```
 *
 * @public
 */
class EventSchemas {
    constructor() {
        this.runtimeSchemas = {};
    }
    addRuntimeSchemas(schemas) {
        this.runtimeSchemas = Object.assign(Object.assign({}, this.runtimeSchemas), schemas);
    }
    /**
     * Use generated Inngest types to type events.
     */
    fromGenerated() {
        return this;
    }
    /**
     * Use a `Record<>` type to type events.
     *
     * @example
     *
     * ```ts
     * export const inngest = new Inngest({
     *   id: "my-app",
     *   schemas: new EventSchemas().fromRecord<{
     *     "app/user.created": {
     *       data: {
     *         id: string;
     *         name: string;
     *       };
     *     };
     *   }>(),
     * });
     * ```
     */
    fromRecord(..._args) {
        return this;
    }
    /**
     * Use a union type to type events.
     *
     * @example
     *
     * ```ts
     * type AccountCreated = {
     *   name: "app/account.created";
     *   data: { org: string };
     *   user: { id: string };
     * };
     *
     * type AccountDeleted = {
     *   name: "app/account.deleted";
     *   data: { org: string };
     *   user: { id: string };
     * };
     *
     * type Events = AccountCreated | AccountDeleted;
     *
     * export const inngest = new Inngest({
     *   id: "my-app",
     *   schemas: new EventSchemas().fromUnion<Events>(),
     * });
     * ```
     */
    fromUnion() {
        return this;
    }
    /**
     * Use Zod to type events.
     *
     * @example
     *
     * ```ts
     * export const inngest = new Inngest({
     *   id: "my-app",
     *   schemas: new EventSchemas().fromZod({
     *     "app/user.created": {
     *       data: z.object({
     *         id: z.string(),
     *         name: z.string(),
     *       }),
     *     },
     *   }),
     * });
     * ```
     */
    fromZod(schemas) {
        let runtimeSchemas;
        if (Array.isArray(schemas)) {
            runtimeSchemas = schemas.reduce((acc, schema) => {
                const _a = schema.shape, { name: { value: name } } = _a, rest = __rest(_a, ["name"]);
                return Object.assign(Object.assign({}, acc), { [name]: rest });
            }, {});
        }
        else {
            runtimeSchemas = schemas;
        }
        this.addRuntimeSchemas(runtimeSchemas);
        return this;
    }
}
exports.EventSchemas = EventSchemas;
//# sourceMappingURL=EventSchemas.js.map