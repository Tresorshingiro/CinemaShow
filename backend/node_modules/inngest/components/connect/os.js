"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveSystemAttributes = retrieveSystemAttributes;
exports.onShutdown = onShutdown;
exports.getHostname = getHostname;
async function retrieveSystemAttributes() {
    return {
        cpuCores: await retrieveCpuCores(),
        memBytes: await retrieveMemBytes(),
        os: await retrieveOs(),
    };
}
async function retrieveCpuCores() {
    // Works for Deno, Node, Bun
    try {
        const os = await Promise.resolve().then(() => __importStar(require("node:os")));
        return os.cpus().length;
    }
    catch (err) {
        // no-op
    }
    // Browser
    try {
        if (navigator && navigator.hardwareConcurrency) {
            return navigator.hardwareConcurrency;
        }
    }
    catch (err) {
        // no-op
    }
    return 0;
}
async function retrieveMemBytes() {
    // Deno
    try {
        if (Deno) {
            return Deno.systemMemoryInfo().total;
        }
    }
    catch (err) {
        // no-op
    }
    // Node, Bun
    try {
        const os = await Promise.resolve().then(() => __importStar(require("node:os")));
        return os.totalmem();
    }
    catch (err) {
        // no-op
    }
    return 0;
}
async function retrieveOs() {
    // Deno, Node, Bun
    try {
        const os = await Promise.resolve().then(() => __importStar(require("node:os")));
        return os.platform();
    }
    catch (err) {
        // no-op
    }
    // Browser
    try {
        if (navigator && navigator.platform) {
            return navigator.platform;
        }
    }
    catch (err) {
        // no-op
    }
    return "unknown";
}
function onShutdown(signals, fn) {
    // Deno
    try {
        if (Deno) {
            signals.forEach((signal) => {
                Deno.addSignalListener(signal, fn);
            });
            return () => {
                signals.forEach((signal) => {
                    Deno.removeSignalListener(signal, fn);
                });
            };
        }
    }
    catch (err) {
        // no-op
    }
    // Node, Bun
    try {
        if (process) {
            signals.forEach((signal) => {
                // eslint-disable-next-line @inngest/internal/process-warn
                process.on(signal, fn);
            });
            return () => {
                signals.forEach((signal) => {
                    // eslint-disable-next-line @inngest/internal/process-warn
                    process.removeListener(signal, fn);
                });
            };
        }
    }
    catch (err) {
        // no-op
    }
    return () => { };
}
async function getHostname() {
    // Deno
    try {
        if (Deno) {
            return Deno.hostname();
        }
    }
    catch (err) {
        // no-op
    }
    // Node, Bun
    try {
        const os = await Promise.resolve().then(() => __importStar(require("node:os")));
        return os.hostname();
    }
    catch (err) {
        // no-op
    }
    return "unknown";
}
//# sourceMappingURL=os.js.map