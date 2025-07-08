"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionState = exports.DEFAULT_SHUTDOWN_SIGNALS = void 0;
exports.DEFAULT_SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"];
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["CONNECTING"] = "CONNECTING";
    ConnectionState["ACTIVE"] = "ACTIVE";
    ConnectionState["PAUSED"] = "PAUSED";
    ConnectionState["RECONNECTING"] = "RECONNECTING";
    ConnectionState["CLOSING"] = "CLOSING";
    ConnectionState["CLOSED"] = "CLOSED";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
//# sourceMappingURL=types.js.map