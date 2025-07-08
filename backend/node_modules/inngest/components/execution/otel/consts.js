"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = exports.TraceStateKey = exports.debugPrefix = void 0;
exports.debugPrefix = "inngest:otel";
var TraceStateKey;
(function (TraceStateKey) {
    TraceStateKey["AppId"] = "inngest@app";
    TraceStateKey["FunctionId"] = "inngest@fn";
})(TraceStateKey || (exports.TraceStateKey = TraceStateKey = {}));
var Attribute;
(function (Attribute) {
    Attribute["InngestTraceparent"] = "inngest.traceparent";
    Attribute["InngestRunId"] = "sdk.run.id";
    Attribute["InngestAppId1"] = "sdk.app.id";
    Attribute["InngestAppId2"] = "sys.app.id";
    Attribute["InngestFunctionId"] = "sys.function.id";
})(Attribute || (exports.Attribute = Attribute = {}));
//# sourceMappingURL=consts.js.map