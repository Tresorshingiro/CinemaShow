"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devServerHost = exports.devServerUrl = exports.devServerAvailable = void 0;
const consts_js_1 = require("./consts.js");
const env_js_1 = require("./env.js");
/**
 * Attempts to contact the dev server, returning a boolean indicating whether or
 * not it was successful.
 *
 * @example devServerUrl(process.env[envKeys.DevServerUrl], "/your-path")
 */
const devServerAvailable = async (
/**
 * The host of the dev server. You should pass in an environment variable as
 * this parameter.
 */
host = consts_js_1.defaultDevServerHost, 
/**
 * The fetch implementation to use to communicate with the dev server.
 */
fetch) => {
    try {
        const url = (0, exports.devServerUrl)(host, "/dev");
        const result = await fetch(url.toString());
        await result.json();
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.devServerAvailable = devServerAvailable;
/**
 * devServerUrl returns a full URL for the given path name.
 *
 * Because Cloudflare/V8 platforms don't allow process.env, you are expected
 * to pass in the host from the dev server env key:
 *
 * @example devServerUrl(processEnv(envKeys.DevServerUrl), "/your-path")
 * @example devServerUrl("http://localhost:8288/", "/your-path")
 */
const devServerUrl = (host = (0, exports.devServerHost)(), pathname = "") => {
    return new URL(pathname, host.includes("://") ? host : `http://${host}`);
};
exports.devServerUrl = devServerUrl;
/**
 * devServerHost exports the development server's domain by inspecting env
 * variables, or returns the default development server URL.
 *
 * This guarantees a specific URL as a string, as opposed to the env export
 * which only returns a value of the env var is set.
 */
const devServerHost = () => (0, env_js_1.devServerHost)() || consts_js_1.defaultDevServerHost;
exports.devServerHost = devServerHost;
//# sourceMappingURL=devserver.js.map