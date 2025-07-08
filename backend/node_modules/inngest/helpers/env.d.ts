import { type Inngest } from "../components/Inngest.js";
import { type SupportedFrameworkName } from "../types.js";
/**
 * @public
 */
export type Env = Record<string, EnvValue>;
/**
 * @public
 */
export type EnvValue = string | undefined;
/**
 * devServerHost returns the dev server host by searching for the INNGEST_DEVSERVER_URL
 * environment variable (plus project prefixces for eg. react, such as REACT_APP_INNGEST_DEVSERVER_URL).
 *
 * If not found this returns undefined, indicating that the env var has not been set.
 *
 * @example devServerHost()
 */
export declare const devServerHost: (env?: Env) => EnvValue;
interface IsProdOptions {
    /**
     * The optional environment variables to use instead of `process.env`.
     */
    env?: Record<string, EnvValue>;
    /**
     * The Inngest client that's being used when performing this check. This is
     * used to check if the client has an explicit mode set, and if so, to use
     * that mode instead of inferring it from the environment.
     */
    client?: Inngest.Any;
    /**
     * If specified as a `boolean`, this will be returned as the result of the
     * function. Useful for options that may or may not be set by users.
     */
    explicitMode?: Mode["type"];
}
export interface ModeOptions {
    type: "cloud" | "dev";
    /**
     * Whether the mode was explicitly set, or inferred from other sources.
     */
    isExplicit: boolean;
    /**
     * If the mode was explicitly set as a dev URL, this is the URL that was set.
     */
    explicitDevUrl?: URL;
    /**
     * Environment variables to use when determining the mode.
     */
    env?: Env;
}
export declare class Mode {
    readonly type: "cloud" | "dev";
    /**
     * Whether the mode was explicitly set, or inferred from other sources.
     */
    readonly isExplicit: boolean;
    readonly explicitDevUrl?: URL;
    private readonly env;
    constructor({ type, isExplicit, explicitDevUrl, env, }: ModeOptions);
    get isDev(): boolean;
    get isCloud(): boolean;
    get isInferred(): boolean;
    /**
     * If we are explicitly in a particular mode, retrieve the URL that we are
     * sure we should be using, not considering any environment variables or other
     * influences.
     */
    getExplicitUrl(defaultCloudUrl: string): string | undefined;
}
/**
 * Returns the mode of the current environment, based off of either passed
 * environment variables or `process.env`, or explicit settings.
 */
export declare const getMode: ({ env, client, explicitMode, }?: IsProdOptions) => Mode;
/**
 * getEnvironmentName returns the suspected branch name for this environment by
 * searching through a set of common environment variables.
 *
 * This could be used to determine if we're on a branch deploy or not, though it
 * should be noted that we don't know if this is the default branch or not.
 */
export declare const getEnvironmentName: (env?: Env) => EnvValue;
export declare const processEnv: (key: string) => EnvValue;
/**
 * allProcessEnv returns the current process environment variables, or an empty
 * object if they cannot be read, making sure we support environments other than
 * Node such as Deno, too.
 *
 * Using this ensures we don't dangerously access `process.env` in environments
 * where it may not be defined, such as Deno or the browser.
 */
export declare const allProcessEnv: () => Env;
/**
 * Generate a standardised set of headers based on input and environment
 * variables.
 *
 *
 */
export declare const inngestHeaders: (opts?: {
    /**
     * The environment variables to use instead of `process.env` or any other
     * default source. Useful for platforms where environment variables are passed
     * in alongside requests.
     */
    env?: Env;
    /**
     * The framework name to use in the `X-Inngest-Framework` header. This is not
     * always available, hence being optional.
     */
    framework?: string;
    /**
     * The environment name to use in the `X-Inngest-Env` header. This is likely
     * to be representative of the target preview environment.
     */
    inngestEnv?: string;
    /**
     * The Inngest client that's making the request. The client itself will
     * generate a set of headers; specifying it here will ensure that the client's
     * headers are included in the returned headers.
     */
    client?: Inngest;
    /**
     * The Inngest server we expect to be communicating with, used to ensure that
     * various parts of a handshake are all happening with the same type of
     * participant.
     */
    expectedServerKind?: string;
    /**
     * Any additional headers to include in the returned headers.
     */
    extras?: Record<string, string>;
}) => Record<string, string>;
export declare const getPlatformName: (env: Env) => "vercel" | "netlify" | "cloudflare-pages" | "render" | "railway" | undefined;
/**
 * Returns `true` if we believe the current environment supports streaming
 * responses back to Inngest.
 *
 * We run a check directly related to the platform we believe we're running on,
 * usually based on environment variables.
 */
export declare const platformSupportsStreaming: (framework: SupportedFrameworkName, env?: Env) => boolean;
/**
 * Given a potential fetch function, return the fetch function to use based on
 * this and the environment.
 */
export declare const getFetch: (givenFetch?: typeof fetch) => typeof fetch;
/**
 * If `Response` isn't included in this environment, it's probably an earlier
 * Node env that isn't already polyfilling. This function returns either the
 * native `Response` or a polyfilled one.
 */
export declare const getResponse: () => typeof Response;
/**
 * Given an unknown value, try to parse it as a `boolean`. Useful for parsing
 * environment variables that could be a selection of different values such as
 * `"true"`, `"1"`.
 *
 * If the value could not be confidently parsed as a `boolean` or was seen to be
 * `undefined`, this function returns `undefined`.
 */
export declare const parseAsBoolean: (value: unknown) => boolean | undefined;
export {};
//# sourceMappingURL=env.d.ts.map