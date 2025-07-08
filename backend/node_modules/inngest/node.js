"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.serve = exports.frameworkName = void 0;
const node_http_1 = __importDefault(require("node:http"));
const node_url_1 = require("node:url");
const InngestCommHandler_js_1 = require("./components/InngestCommHandler.js");
/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
exports.frameworkName = "nodejs";
/**
 * Parse the incoming message request as a JSON body
 */
async function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            try {
                const json = JSON.parse(body);
                resolve(json);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
function getURL(req, hostnameOption) {
    var _a;
    const protocol = req.headers["x-forwarded-proto"] ||
        (((_a = req.socket) === null || _a === void 0 ? void 0 : _a.encrypted) ? "https" : "http");
    const origin = hostnameOption || `${protocol}://${req.headers.host}`;
    return new node_url_1.URL(req.url || "", origin);
}
/**
 * Serve and register any declared functions with Inngest, making them available
 * to be triggered by events.
 *
 * @example Serve Inngest functions on all paths
 * ```ts
 * import { serve } from "inngest/node";
 * import { inngest } from "./src/inngest/client";
 * import myFn from "./src/inngest/myFn"; // Your own function
 *
 * const server = http.createServer(serve({
 *   client: inngest, functions: [myFn]
 * }));
 * server.listen(3000);
 * ```
 *
 * @example Serve Inngest on a specific path
 * ```ts
 * import { serve } from "inngest/node";
 * import { inngest } from "./src/inngest/client";
 * import myFn from "./src/inngest/myFn"; // Your own function
 *
 * const server = http.createServer((req, res) => {
 *   if (req.url.start === '/api/inngest') {
 *     return serve({
 *       client: inngest, functions: [myFn]
 *     })(req, res);
 *   }
 *   // ...
 * });
 * server.listen(3000);
 * ```
 *
 * @public
 */
// Has explicit return type to avoid JSR-defined "slow types"
const serve = (options) => {
    const handler = new InngestCommHandler_js_1.InngestCommHandler(Object.assign(Object.assign({ frameworkName: exports.frameworkName }, options), { handler: (req, res) => {
            return {
                body: async () => parseRequestBody(req),
                headers: (key) => {
                    return req.headers[key] && Array.isArray(req.headers[key])
                        ? req.headers[key][0]
                        : req.headers[key];
                },
                method: () => {
                    if (!req.method) {
                        throw new Error("Request method not defined. Potential use outside of context of Server.");
                    }
                    return req.method;
                },
                url: () => getURL(req, options.serveHost),
                transformResponse: ({ body, status, headers }) => {
                    res.writeHead(status, headers);
                    res.end(body);
                },
            };
        } }));
    return handler.createHandler();
};
exports.serve = serve;
/**
 * EXPERIMENTAL - Create an http server to serve Inngest functions.
 *
 * @example
 * ```ts
 * import { createServer } from "inngest/node";
 * import { inngest } from "./src/inngest/client";
 * import myFn from "./src/inngest/myFn"; // Your own function
 *
 * const server = createServer({
 *   client: inngest, functions: [myFn]
 * });
 * server.listen(3000);
 * ```
 *
 * @public
 */
const createServer = (options) => {
    const server = node_http_1.default.createServer((req, res) => {
        const url = getURL(req, options.serveHost);
        const pathname = options.servePath || "/api/inngest";
        if (url.pathname === pathname) {
            return (0, exports.serve)(options)(req, res);
        }
        res.writeHead(404);
        res.end();
    });
    server.on("clientError", (err, socket) => {
        socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    });
    return server;
};
exports.createServer = createServer;
//# sourceMappingURL=node.js.map