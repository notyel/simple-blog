import { ɵConsole as _Console, InjectionToken, makeEnvironmentProviders, ɵENABLE_ROOT_COMPONENT_BOOTSTRAP as _ENABLE_ROOT_COMPONENT_BOOTSTRAP, ApplicationRef, Compiler, runInInjectionContext, ɵresetCompiledComponents as _resetCompiledComponents, REQUEST, REQUEST_CONTEXT, RESPONSE_INIT, LOCALE_ID } from '@angular/core';
import { ROUTES, Router, ɵloadChildren as _loadChildren } from '@angular/router';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { renderModule, renderApplication, ɵSERVER_CONTEXT as _SERVER_CONTEXT, platformServer, INITIAL_CONFIG } from '@angular/platform-server';
import Beasties from '../third_party/beasties/index.js';

/**
 * Manages server-side assets.
 */
class ServerAssets {
    manifest;
    /**
     * Creates an instance of ServerAsset.
     *
     * @param manifest - The manifest containing the server assets.
     */
    constructor(manifest) {
        this.manifest = manifest;
    }
    /**
     * Retrieves the content of a server-side asset using its path.
     *
     * @param path - The path to the server asset within the manifest.
     * @returns The server asset associated with the provided path, as a `ServerAsset` object.
     * @throws Error - Throws an error if the asset does not exist.
     */
    getServerAsset(path) {
        const asset = this.manifest.assets[path];
        if (!asset) {
            throw new Error(`Server asset '${path}' does not exist.`);
        }
        return asset;
    }
    /**
     * Checks if a specific server-side asset exists.
     *
     * @param path - The path to the server asset.
     * @returns A boolean indicating whether the asset exists.
     */
    hasServerAsset(path) {
        return !!this.manifest.assets[path];
    }
    /**
     * Retrieves the asset for 'index.server.html'.
     *
     * @returns The `ServerAsset` object for 'index.server.html'.
     * @throws Error - Throws an error if 'index.server.html' does not exist.
     */
    getIndexServerHtml() {
        return this.getServerAsset('index.server.html');
    }
}

/**
 * A set of log messages that should be ignored and not printed to the console.
 */
const IGNORED_LOGS = new Set(['Angular is running in development mode.']);
/**
 * Custom implementation of the Angular Console service that filters out specific log messages.
 *
 * This class extends the internal Angular `ɵConsole` class to provide customized logging behavior.
 * It overrides the `log` method to suppress logs that match certain predefined messages.
 */
class Console extends _Console {
    /**
     * Logs a message to the console if it is not in the set of ignored messages.
     *
     * @param message - The message to log to the console.
     *
     * This method overrides the `log` method of the `ɵConsole` class. It checks if the
     * message is in the `IGNORED_LOGS` set. If it is not, it delegates the logging to
     * the parent class's `log` method. Otherwise, the message is suppressed.
     */
    log(message) {
        if (!IGNORED_LOGS.has(message)) {
            super.log(message);
        }
    }
}

/**
 * The Angular app manifest object.
 * This is used internally to store the current Angular app manifest.
 */
let angularAppManifest;
/**
 * Sets the Angular app manifest.
 *
 * @param manifest - The manifest object to set for the Angular application.
 */
function setAngularAppManifest(manifest) {
    angularAppManifest = manifest;
}
/**
 * Gets the Angular app manifest.
 *
 * @returns The Angular app manifest.
 * @throws Will throw an error if the Angular app manifest is not set.
 */
function getAngularAppManifest() {
    if (!angularAppManifest) {
        throw new Error('Angular app manifest is not set. ' +
            `Please ensure you are using the '@angular/build:application' builder to build your server application.`);
    }
    return angularAppManifest;
}
/**
 * The Angular app engine manifest object.
 * This is used internally to store the current Angular app engine manifest.
 */
let angularAppEngineManifest;
/**
 * Sets the Angular app engine manifest.
 *
 * @param manifest - The engine manifest object to set.
 */
function setAngularAppEngineManifest(manifest) {
    angularAppEngineManifest = manifest;
}
/**
 * Gets the Angular app engine manifest.
 *
 * @returns The Angular app engine manifest.
 * @throws Will throw an error if the Angular app engine manifest is not set.
 */
function getAngularAppEngineManifest() {
    if (!angularAppEngineManifest) {
        throw new Error('Angular app engine manifest is not set. ' +
            `Please ensure you are using the '@angular/build:application' builder to build your server application.`);
    }
    return angularAppEngineManifest;
}

/**
 * Removes the trailing slash from a URL if it exists.
 *
 * @param url - The URL string from which to remove the trailing slash.
 * @returns The URL string without a trailing slash.
 *
 * @example
 * ```js
 * stripTrailingSlash('path/'); // 'path'
 * stripTrailingSlash('/path');  // '/path'
 * stripTrailingSlash('/'); // '/'
 * stripTrailingSlash(''); // ''
 * ```
 */
/**
 * Removes the leading slash from a URL if it exists.
 *
 * @param url - The URL string from which to remove the leading slash.
 * @returns The URL string without a leading slash.
 *
 * @example
 * ```js
 * stripLeadingSlash('/path'); // 'path'
 * stripLeadingSlash('/path/');  // 'path/'
 * stripLeadingSlash('/'); // '/'
 * stripLeadingSlash(''); // ''
 * ```
 */
function stripLeadingSlash(url) {
    // Check if the first character of the URL is a slash
    return url.length > 1 && url[0] === '/' ? url.slice(1) : url;
}
/**
 * Adds a leading slash to a URL if it does not already have one.
 *
 * @param url - The URL string to which the leading slash will be added.
 * @returns The URL string with a leading slash.
 *
 * @example
 * ```js
 * addLeadingSlash('path'); // '/path'
 * addLeadingSlash('/path'); // '/path'
 * ```
 */
function addLeadingSlash(url) {
    // Check if the URL already starts with a slash
    return url[0] === '/' ? url : `/${url}`;
}
/**
 * Adds a trailing slash to a URL if it does not already have one.
 *
 * @param url - The URL string to which the trailing slash will be added.
 * @returns The URL string with a trailing slash.
 *
 * @example
 * ```js
 * addTrailingSlash('path'); // 'path/'
 * addTrailingSlash('path/'); // 'path/'
 * ```
 */
function addTrailingSlash(url) {
    // Check if the URL already end with a slash
    return url[url.length - 1] === '/' ? url : `${url}/`;
}
/**
 * Joins URL parts into a single URL string.
 *
 * This function takes multiple URL segments, normalizes them by removing leading
 * and trailing slashes where appropriate, and then joins them into a single URL.
 *
 * @param parts - The parts of the URL to join. Each part can be a string with or without slashes.
 * @returns The joined URL string, with normalized slashes.
 *
 * @example
 * ```js
 * joinUrlParts('path/', '/to/resource'); // '/path/to/resource'
 * joinUrlParts('/path/', 'to/resource'); // '/path/to/resource'
 * joinUrlParts('', ''); // '/'
 * ```
 */
function joinUrlParts(...parts) {
    const normalizeParts = [];
    for (const part of parts) {
        if (part === '') {
            // Skip any empty parts
            continue;
        }
        let normalizedPart = part;
        if (part[0] === '/') {
            normalizedPart = normalizedPart.slice(1);
        }
        if (part[part.length - 1] === '/') {
            normalizedPart = normalizedPart.slice(0, -1);
        }
        if (normalizedPart !== '') {
            normalizeParts.push(normalizedPart);
        }
    }
    return addLeadingSlash(normalizeParts.join('/'));
}
/**
 * Strips `/index.html` from the end of a URL's path, if present.
 *
 * This function is used to convert URLs pointing to an `index.html` file into their directory
 * equivalents. For example, it transforms a URL like `http://www.example.com/page/index.html`
 * into `http://www.example.com/page`.
 *
 * @param url - The URL object to process.
 * @returns A new URL object with `/index.html` removed from the path, if it was present.
 *
 * @example
 * ```typescript
 * const originalUrl = new URL('http://www.example.com/page/index.html');
 * const cleanedUrl = stripIndexHtmlFromURL(originalUrl);
 * console.log(cleanedUrl.href); // Output: 'http://www.example.com/page'
 * ```
 */
function stripIndexHtmlFromURL(url) {
    if (url.pathname.endsWith('/index.html')) {
        const modifiedURL = new URL(url);
        // Remove '/index.html' from the pathname
        modifiedURL.pathname = modifiedURL.pathname.slice(0, /** '/index.html'.length */ -11);
        return modifiedURL;
    }
    return url;
}
/**
 * Resolves `*` placeholders in a path template by mapping them to corresponding segments
 * from a base path. This is useful for constructing paths dynamically based on a given base path.
 *
 * The function processes the `toPath` string, replacing each `*` placeholder with
 * the corresponding segment from the `fromPath`. If the `toPath` contains no placeholders,
 * it is returned as-is. Invalid `toPath` formats (not starting with `/`) will throw an error.
 *
 * @param toPath - A path template string that may contain `*` placeholders. Each `*` is replaced
 * by the corresponding segment from the `fromPath`. Static paths (e.g., `/static/path`) are returned
 * directly without placeholder replacement.
 * @param fromPath - A base path string, split into segments, that provides values for
 * replacing `*` placeholders in the `toPath`.
 * @returns A resolved path string with `*` placeholders replaced by segments from the `fromPath`,
 * or the `toPath` returned unchanged if it contains no placeholders.
 *
 * @throws If the `toPath` does not start with a `/`, indicating an invalid path format.
 *
 * @example
 * ```typescript
 * // Example with placeholders resolved
 * const resolvedPath = buildPathWithParams('/*\/details', '/123/abc');
 * console.log(resolvedPath); // Outputs: '/123/details'
 *
 * // Example with a static path
 * const staticPath = buildPathWithParams('/static/path', '/base/unused');
 * console.log(staticPath); // Outputs: '/static/path'
 * ```
 */
function buildPathWithParams(toPath, fromPath) {
    if (toPath[0] !== '/') {
        throw new Error(`Invalid toPath: The string must start with a '/'. Received: '${toPath}'`);
    }
    if (fromPath[0] !== '/') {
        throw new Error(`Invalid fromPath: The string must start with a '/'. Received: '${fromPath}'`);
    }
    if (!toPath.includes('/*')) {
        return toPath;
    }
    const fromPathParts = fromPath.split('/');
    const toPathParts = toPath.split('/');
    const resolvedParts = toPathParts.map((part, index) => toPathParts[index] === '*' ? fromPathParts[index] : part);
    return joinUrlParts(...resolvedParts);
}

/**
 * Renders an Angular application or module to an HTML string.
 *
 * This function determines whether the provided `bootstrap` value is an Angular module
 * or a bootstrap function and calls the appropriate rendering method (`renderModule` or
 * `renderApplication`) based on that determination.
 *
 * @param html - The HTML string to be used as the initial document content.
 * @param bootstrap - Either an Angular module type or a function that returns a promise
 *                    resolving to an `ApplicationRef`.
 * @param url - The URL of the application. This is used for server-side rendering to
 *              correctly handle route-based rendering.
 * @param platformProviders - An array of platform providers to be used during the
 *                             rendering process.
 * @param serverContext - A string representing the server context, used to provide additional
 *                        context or metadata during server-side rendering.
 * @returns A promise that resolves to a string containing the rendered HTML.
 */
function renderAngular(html, bootstrap, url, platformProviders, serverContext) {
    const providers = [
        {
            provide: _SERVER_CONTEXT,
            useValue: serverContext,
        },
        {
            // An Angular Console Provider that does not print a set of predefined logs.
            provide: _Console,
            // Using `useClass` would necessitate decorating `Console` with `@Injectable`,
            // which would require switching from `ts_library` to `ng_module`. This change
            // would also necessitate various patches of `@angular/bazel` to support ESM.
            useFactory: () => new Console(),
        },
        ...platformProviders,
    ];
    // A request to `http://www.example.com/page/index.html` will render the Angular route corresponding to `http://www.example.com/page`.
    const urlToRender = stripIndexHtmlFromURL(url).toString();
    return isNgModule(bootstrap)
        ? renderModule(bootstrap, {
            url: urlToRender,
            document: html,
            extraProviders: providers,
        })
        : renderApplication(bootstrap, {
            url: urlToRender,
            document: html,
            platformProviders: providers,
        });
}
/**
 * Type guard to determine if a given value is an Angular module.
 * Angular modules are identified by the presence of the `ɵmod` static property.
 * This function helps distinguish between Angular modules and bootstrap functions.
 *
 * @param value - The value to be checked.
 * @returns True if the value is an Angular module (i.e., it has the `ɵmod` property), false otherwise.
 */
function isNgModule(value) {
    return 'ɵmod' in value;
}

/**
 * Creates a promise that resolves with the result of the provided `promise` or rejects with an
 * `AbortError` if the `AbortSignal` is triggered before the promise resolves.
 *
 * @param promise - The promise to monitor for completion.
 * @param signal - An `AbortSignal` used to monitor for an abort event. If the signal is aborted,
 *                 the returned promise will reject.
 * @param errorMessagePrefix - A custom message prefix to include in the error message when the operation is aborted.
 * @returns A promise that either resolves with the value of the provided `promise` or rejects with
 *          an `AbortError` if the `AbortSignal` is triggered.
 *
 * @throws {AbortError} If the `AbortSignal` is triggered before the `promise` resolves.
 */
function promiseWithAbort(promise, signal, errorMessagePrefix) {
    return new Promise((resolve, reject) => {
        const abortHandler = () => {
            reject(new DOMException(`${errorMessagePrefix} was aborted.\n${signal.reason}`, 'AbortError'));
        };
        // Check for abort signal
        if (signal.aborted) {
            abortHandler();
            return;
        }
        signal.addEventListener('abort', abortHandler, { once: true });
        promise
            .then(resolve)
            .catch(reject)
            .finally(() => {
            signal.removeEventListener('abort', abortHandler);
        });
    });
}

/**
 * The internal path used for the app shell route.
 * @internal
 */
const APP_SHELL_ROUTE = 'ng-app-shell';
/**
 * Identifies a particular kind of `ServerRoutesFeatureKind`.
 * @see {@link ServerRoutesFeature}
 * @developerPreview
 */
var ServerRoutesFeatureKind;
(function (ServerRoutesFeatureKind) {
    ServerRoutesFeatureKind[ServerRoutesFeatureKind["AppShell"] = 0] = "AppShell";
})(ServerRoutesFeatureKind || (ServerRoutesFeatureKind = {}));
/**
 * Different rendering modes for server routes.
 * @see {@link provideServerRouting}
 * @see {@link ServerRoute}
 * @developerPreview
 */
var RenderMode;
(function (RenderMode) {
    /** Server-Side Rendering (SSR) mode, where content is rendered on the server for each request. */
    RenderMode[RenderMode["Server"] = 0] = "Server";
    /** Client-Side Rendering (CSR) mode, where content is rendered on the client side in the browser. */
    RenderMode[RenderMode["Client"] = 1] = "Client";
    /** Static Site Generation (SSG) mode, where content is pre-rendered at build time and served as static files. */
    RenderMode[RenderMode["Prerender"] = 2] = "Prerender";
})(RenderMode || (RenderMode = {}));
/**
 * Defines the fallback strategies for Static Site Generation (SSG) routes when a pre-rendered path is not available.
 * This is particularly relevant for routes with parameterized URLs where some paths might not be pre-rendered at build time.
 * @see {@link ServerRoutePrerenderWithParams}
 * @developerPreview
 */
var PrerenderFallback;
(function (PrerenderFallback) {
    /**
     * Fallback to Server-Side Rendering (SSR) if the pre-rendered path is not available.
     * This strategy dynamically generates the page on the server at request time.
     */
    PrerenderFallback[PrerenderFallback["Server"] = 0] = "Server";
    /**
     * Fallback to Client-Side Rendering (CSR) if the pre-rendered path is not available.
     * This strategy allows the page to be rendered on the client side.
     */
    PrerenderFallback[PrerenderFallback["Client"] = 1] = "Client";
    /**
     * No fallback; if the path is not pre-rendered, the server will not handle the request.
     * This means the application will not provide any response for paths that are not pre-rendered.
     */
    PrerenderFallback[PrerenderFallback["None"] = 2] = "None";
})(PrerenderFallback || (PrerenderFallback = {}));
/**
 * Token for providing the server routes configuration.
 * @internal
 */
const SERVER_ROUTES_CONFIG = new InjectionToken('SERVER_ROUTES_CONFIG');
/**
 * Sets up the necessary providers for configuring server routes.
 * This function accepts an array of server routes and optional configuration
 * options, returning an `EnvironmentProviders` object that encapsulates
 * the server routes and configuration settings.
 *
 * @param routes - An array of server routes to be provided.
 * @param options - (Optional) An object containing additional configuration options for server routes.
 * @returns An `EnvironmentProviders` instance with the server routes configuration.
 *
 * @see {@link ServerRoute}
 * @see {@link ServerRoutesConfigOptions}
 * @see {@link provideServerRouting}
 * @deprecated use `provideServerRouting`. This will be removed in version 20.
 * @developerPreview
 */
function provideServerRoutesConfig(routes, options) {
    if (typeof ngServerMode === 'undefined' || !ngServerMode) {
        throw new Error(`The 'provideServerRoutesConfig' function should not be invoked within the browser portion of the application.`);
    }
    return makeEnvironmentProviders([
        {
            provide: SERVER_ROUTES_CONFIG,
            useValue: { routes, ...options },
        },
    ]);
}
/**
 * Sets up the necessary providers for configuring server routes.
 * This function accepts an array of server routes and optional configuration
 * options, returning an `EnvironmentProviders` object that encapsulates
 * the server routes and configuration settings.
 *
 * @param routes - An array of server routes to be provided.
 * @param features - (Optional) server routes features.
 * @returns An `EnvironmentProviders` instance with the server routes configuration.
 *
 * @see {@link ServerRoute}
 * @see {@link withAppShell}
 * @developerPreview
 */
function provideServerRouting(routes, ...features) {
    const config = { routes };
    const hasAppShell = features.some((f) => f.ɵkind === ServerRoutesFeatureKind.AppShell);
    if (hasAppShell) {
        config.appShellRoute = APP_SHELL_ROUTE;
    }
    const providers = [
        {
            provide: SERVER_ROUTES_CONFIG,
            useValue: config,
        },
    ];
    for (const feature of features) {
        providers.push(...feature.ɵproviders);
    }
    return makeEnvironmentProviders(providers);
}
/**
 * Configures the app shell route with the provided component.
 *
 * The app shell serves as the main entry point for the application and is commonly used
 * to enable server-side rendering (SSR) of the application shell. It handles requests
 * that do not match any specific server route, providing a fallback mechanism and improving
 * perceived performance during navigation.
 *
 * This configuration is particularly useful in applications leveraging Progressive Web App (PWA)
 * patterns, such as service workers, to deliver a seamless user experience.
 *
 * @param component The Angular component to render for the app shell route.
 * @returns A server routes feature configuration for the app shell.
 *
 * @see {@link provideServerRouting}
 * @see {@link https://angular.dev/ecosystem/service-workers/app-shell | App shell pattern on Angular.dev}
 */
function withAppShell(component) {
    const routeConfig = {
        path: APP_SHELL_ROUTE,
    };
    if ('ɵcmp' in component) {
        routeConfig.component = component;
    }
    else {
        routeConfig.loadComponent = component;
    }
    return {
        ɵkind: ServerRoutesFeatureKind.AppShell,
        ɵproviders: [
            {
                provide: ROUTES,
                useValue: routeConfig,
                multi: true,
            },
        ],
    };
}

/**
 * A route tree implementation that supports efficient route matching, including support for wildcard routes.
 * This structure is useful for organizing and retrieving routes in a hierarchical manner,
 * enabling complex routing scenarios with nested paths.
 *
 * @typeParam AdditionalMetadata - Type of additional metadata that can be associated with route nodes.
 */
class RouteTree {
    /**
     * The root node of the route tree.
     * All routes are stored and accessed relative to this root node.
     */
    root = this.createEmptyRouteTreeNode();
    /**
     * Inserts a new route into the route tree.
     * The route is broken down into segments, and each segment is added to the tree.
     * Parameterized segments (e.g., :id) are normalized to wildcards (*) for matching purposes.
     *
     * @param route - The route path to insert into the tree.
     * @param metadata - Metadata associated with the route, excluding the route path itself.
     */
    insert(route, metadata) {
        let node = this.root;
        const segments = this.getPathSegments(route);
        const normalizedSegments = [];
        for (const segment of segments) {
            // Replace parameterized segments (e.g., :id) with a wildcard (*) for matching
            const normalizedSegment = segment[0] === ':' ? '*' : segment;
            let childNode = node.children.get(normalizedSegment);
            if (!childNode) {
                childNode = this.createEmptyRouteTreeNode();
                node.children.set(normalizedSegment, childNode);
            }
            node = childNode;
            normalizedSegments.push(normalizedSegment);
        }
        // At the leaf node, store the full route and its associated metadata
        node.metadata = {
            ...metadata,
            route: addLeadingSlash(normalizedSegments.join('/')),
        };
    }
    /**
     * Matches a given route against the route tree and returns the best matching route's metadata.
     * The best match is determined by the lowest insertion index, meaning the earliest defined route
     * takes precedence.
     *
     * @param route - The route path to match against the route tree.
     * @returns The metadata of the best matching route or `undefined` if no match is found.
     */
    match(route) {
        const segments = this.getPathSegments(route);
        return this.traverseBySegments(segments)?.metadata;
    }
    /**
     * Converts the route tree into a serialized format representation.
     * This method converts the route tree into an array of metadata objects that describe the structure of the tree.
     * The array represents the routes in a nested manner where each entry includes the route and its associated metadata.
     *
     * @returns An array of `RouteTreeNodeMetadata` objects representing the route tree structure.
     *          Each object includes the `route` and associated metadata of a route.
     */
    toObject() {
        return Array.from(this.traverse());
    }
    /**
     * Constructs a `RouteTree` from an object representation.
     * This method is used to recreate a `RouteTree` instance from an array of metadata objects.
     * The array should be in the format produced by `toObject`, allowing for the reconstruction of the route tree
     * with the same routes and metadata.
     *
     * @param value - An array of `RouteTreeNodeMetadata` objects that represent the serialized format of the route tree.
     *                Each object should include a `route` and its associated metadata.
     * @returns A new `RouteTree` instance constructed from the provided metadata objects.
     */
    static fromObject(value) {
        const tree = new RouteTree();
        for (const { route, ...metadata } of value) {
            tree.insert(route, metadata);
        }
        return tree;
    }
    /**
     * A generator function that recursively traverses the route tree and yields the metadata of each node.
     * This allows for easy and efficient iteration over all nodes in the tree.
     *
     * @param node - The current node to start the traversal from. Defaults to the root node of the tree.
     */
    *traverse(node = this.root) {
        if (node.metadata) {
            yield node.metadata;
        }
        for (const childNode of node.children.values()) {
            yield* this.traverse(childNode);
        }
    }
    /**
     * Extracts the path segments from a given route string.
     *
     * @param route - The route string from which to extract segments.
     * @returns An array of path segments.
     */
    getPathSegments(route) {
        return route.split('/').filter(Boolean);
    }
    /**
     * Recursively traverses the route tree from a given node, attempting to match the remaining route segments.
     * If the node is a leaf node (no more segments to match) and contains metadata, the node is yielded.
     *
     * This function prioritizes exact segment matches first, followed by wildcard matches (`*`),
     * and finally deep wildcard matches (`**`) that consume all segments.
     *
     * @param segments - The array of route path segments to match against the route tree.
     * @param node - The current node in the route tree to start traversal from. Defaults to the root node.
     * @param currentIndex - The index of the segment in `remainingSegments` currently being matched.
     * Defaults to `0` (the first segment).
     *
     * @returns The node that best matches the remaining segments or `undefined` if no match is found.
     */
    traverseBySegments(segments, node = this.root, currentIndex = 0) {
        if (currentIndex >= segments.length) {
            return node.metadata ? node : node.children.get('**');
        }
        if (!node.children.size) {
            return undefined;
        }
        const segment = segments[currentIndex];
        // 1. Attempt exact match with the current segment.
        const exactMatch = node.children.get(segment);
        if (exactMatch) {
            const match = this.traverseBySegments(segments, exactMatch, currentIndex + 1);
            if (match) {
                return match;
            }
        }
        // 2. Attempt wildcard match ('*').
        const wildcardMatch = node.children.get('*');
        if (wildcardMatch) {
            const match = this.traverseBySegments(segments, wildcardMatch, currentIndex + 1);
            if (match) {
                return match;
            }
        }
        // 3. Attempt double wildcard match ('**').
        return node.children.get('**');
    }
    /**
     * Creates an empty route tree node.
     * This helper function is used during the tree construction.
     *
     * @returns A new, empty route tree node.
     */
    createEmptyRouteTreeNode() {
        return {
            children: new Map(),
        };
    }
}

/**
 * The maximum number of module preload link elements that should be added for
 * initial scripts.
 */
const MODULE_PRELOAD_MAX = 10;
/**
 * Regular expression to match a catch-all route pattern in a URL path,
 * specifically one that ends with '/**'.
 */
const CATCH_ALL_REGEXP = /\/(\*\*)$/;
/**
 * Regular expression to match segments preceded by a colon in a string.
 */
const URL_PARAMETER_REGEXP = /(?<!\\):([^/]+)/g;
/**
 * An set of HTTP status codes that are considered valid for redirect responses.
 */
const VALID_REDIRECT_RESPONSE_CODES = new Set([301, 302, 303, 307, 308]);
/**
 * Handles a single route within the route tree and yields metadata or errors.
 *
 * @param options - Configuration options for handling the route.
 * @returns An async iterable iterator yielding `RouteTreeNodeMetadata` or an error object.
 */
async function* handleRoute(options) {
    try {
        const { metadata, currentRoutePath, route, compiler, parentInjector, serverConfigRouteTree, entryPointToBrowserMapping, invokeGetPrerenderParams, includePrerenderFallbackRoutes, } = options;
        const { redirectTo, loadChildren, loadComponent, children, ɵentryName } = route;
        if (ɵentryName && loadComponent) {
            appendPreloadToMetadata(ɵentryName, entryPointToBrowserMapping, metadata, true);
        }
        if (metadata.renderMode === RenderMode.Prerender) {
            yield* handleSSGRoute(serverConfigRouteTree, typeof redirectTo === 'string' ? redirectTo : undefined, metadata, parentInjector, invokeGetPrerenderParams, includePrerenderFallbackRoutes);
        }
        else if (typeof redirectTo === 'string') {
            if (metadata.status && !VALID_REDIRECT_RESPONSE_CODES.has(metadata.status)) {
                yield {
                    error: `The '${metadata.status}' status code is not a valid redirect response code. ` +
                        `Please use one of the following redirect response codes: ${[...VALID_REDIRECT_RESPONSE_CODES.values()].join(', ')}.`,
                };
            }
            else {
                yield { ...metadata, redirectTo: resolveRedirectTo(metadata.route, redirectTo) };
            }
        }
        else {
            yield metadata;
        }
        // Recursively process child routes
        if (children?.length) {
            yield* traverseRoutesConfig({
                ...options,
                routes: children,
                parentRoute: currentRoutePath,
                parentPreloads: metadata.preload,
            });
        }
        // Load and process lazy-loaded child routes
        if (loadChildren) {
            if (ɵentryName) {
                // When using `loadChildren`, the entire feature area (including multiple routes) is loaded.
                // As a result, we do not want all dynamic-import dependencies to be preload, because it involves multiple dependencies
                // across different child routes. In contrast, `loadComponent` only loads a single component, which allows
                // for precise control over preloading, ensuring that the files preloaded are exactly those required for that specific route.
                appendPreloadToMetadata(ɵentryName, entryPointToBrowserMapping, metadata, false);
            }
            const loadedChildRoutes = await _loadChildren(route, compiler, parentInjector).toPromise();
            if (loadedChildRoutes) {
                const { routes: childRoutes, injector = parentInjector } = loadedChildRoutes;
                yield* traverseRoutesConfig({
                    ...options,
                    routes: childRoutes,
                    parentInjector: injector,
                    parentRoute: currentRoutePath,
                    parentPreloads: metadata.preload,
                });
            }
        }
    }
    catch (error) {
        yield {
            error: `Error in handleRoute for '${options.currentRoutePath}': ${error.message}`,
        };
    }
}
/**
 * Traverses an array of route configurations to generate route tree node metadata.
 *
 * This function processes each route and its children, handling redirects, SSG (Static Site Generation) settings,
 * and lazy-loaded routes. It yields route metadata for each route and its potential variants.
 *
 * @param options - The configuration options for traversing routes.
 * @returns An async iterable iterator yielding either route tree node metadata or an error object with an error message.
 */
async function* traverseRoutesConfig(options) {
    const { routes: routeConfigs, parentPreloads, parentRoute, serverConfigRouteTree } = options;
    for (const route of routeConfigs) {
        const { matcher, path = matcher ? '**' : '' } = route;
        const currentRoutePath = joinUrlParts(parentRoute, path);
        if (matcher && serverConfigRouteTree) {
            let foundMatch = false;
            for (const matchedMetaData of serverConfigRouteTree.traverse()) {
                if (!matchedMetaData.route.startsWith(currentRoutePath)) {
                    continue;
                }
                foundMatch = true;
                matchedMetaData.presentInClientRouter = true;
                if (matchedMetaData.renderMode === RenderMode.Prerender) {
                    yield {
                        error: `The route '${stripLeadingSlash(currentRoutePath)}' is set for prerendering but has a defined matcher. ` +
                            `Routes with matchers cannot use prerendering. Please specify a different 'renderMode'.`,
                    };
                    continue;
                }
                yield* handleRoute({
                    ...options,
                    currentRoutePath,
                    route,
                    metadata: {
                        ...matchedMetaData,
                        preload: parentPreloads,
                        route: matchedMetaData.route,
                        presentInClientRouter: undefined,
                    },
                });
            }
            if (!foundMatch) {
                yield {
                    error: `The route '${stripLeadingSlash(currentRoutePath)}' has a defined matcher but does not ` +
                        'match any route in the server routing configuration. Please ensure this route is added to the server routing configuration.',
                };
            }
            continue;
        }
        let matchedMetaData;
        if (serverConfigRouteTree) {
            matchedMetaData = serverConfigRouteTree.match(currentRoutePath);
            if (!matchedMetaData) {
                yield {
                    error: `The '${stripLeadingSlash(currentRoutePath)}' route does not match any route defined in the server routing configuration. ` +
                        'Please ensure this route is added to the server routing configuration.',
                };
                continue;
            }
            matchedMetaData.presentInClientRouter = true;
        }
        yield* handleRoute({
            ...options,
            metadata: {
                renderMode: RenderMode.Prerender,
                ...matchedMetaData,
                preload: parentPreloads,
                // Match Angular router behavior
                // ['one', 'two', ''] -> 'one/two/'
                // ['one', 'two', 'three'] -> 'one/two/three'
                route: path === '' ? addTrailingSlash(currentRoutePath) : currentRoutePath,
                presentInClientRouter: undefined,
            },
            currentRoutePath,
            route,
        });
    }
}
/**
 * Appends preload information to the metadata object based on the specified entry-point and chunk mappings.
 *
 * This function extracts preload data for a given entry-point from the provided chunk mappings. It adds the
 * corresponding browser bundles to the metadata's preload list, ensuring no duplicates and limiting the total
 * preloads to a predefined maximum.
 */
function appendPreloadToMetadata(entryName, entryPointToBrowserMapping, metadata, includeDynamicImports) {
    const existingPreloads = metadata.preload ?? [];
    if (!entryPointToBrowserMapping || existingPreloads.length >= MODULE_PRELOAD_MAX) {
        return;
    }
    const preload = entryPointToBrowserMapping[entryName];
    if (!preload?.length) {
        return;
    }
    // Merge existing preloads with new ones, ensuring uniqueness and limiting the total to the maximum allowed.
    const combinedPreloads = new Set(existingPreloads);
    for (const { dynamicImport, path } of preload) {
        if (dynamicImport && !includeDynamicImports) {
            continue;
        }
        combinedPreloads.add(path);
        if (combinedPreloads.size === MODULE_PRELOAD_MAX) {
            break;
        }
    }
    metadata.preload = Array.from(combinedPreloads);
}
/**
 * Handles SSG (Static Site Generation) routes by invoking `getPrerenderParams` and yielding
 * all parameterized paths, returning any errors encountered.
 *
 * @param serverConfigRouteTree - The tree representing the server's routing setup.
 * @param redirectTo - Optional path to redirect to, if specified.
 * @param metadata - The metadata associated with the route tree node.
 * @param parentInjector - The dependency injection container for the parent route.
 * @param invokeGetPrerenderParams - A flag indicating whether to invoke the `getPrerenderParams` function.
 * @param includePrerenderFallbackRoutes - A flag indicating whether to include fallback routes in the result.
 * @returns An async iterable iterator that yields route tree node metadata for each SSG path or errors.
 */
async function* handleSSGRoute(serverConfigRouteTree, redirectTo, metadata, parentInjector, invokeGetPrerenderParams, includePrerenderFallbackRoutes) {
    if (metadata.renderMode !== RenderMode.Prerender) {
        throw new Error(`'handleSSGRoute' was called for a route which rendering mode is not prerender.`);
    }
    const { route: currentRoutePath, fallback, ...meta } = metadata;
    const getPrerenderParams = 'getPrerenderParams' in meta ? meta.getPrerenderParams : undefined;
    if ('getPrerenderParams' in meta) {
        delete meta['getPrerenderParams'];
    }
    if (redirectTo !== undefined) {
        meta.redirectTo = resolveRedirectTo(currentRoutePath, redirectTo);
    }
    const isCatchAllRoute = CATCH_ALL_REGEXP.test(currentRoutePath);
    if ((isCatchAllRoute && !getPrerenderParams) ||
        (!isCatchAllRoute && !URL_PARAMETER_REGEXP.test(currentRoutePath))) {
        // Route has no parameters
        yield {
            ...meta,
            route: currentRoutePath,
        };
        return;
    }
    if (invokeGetPrerenderParams) {
        if (!getPrerenderParams) {
            yield {
                error: `The '${stripLeadingSlash(currentRoutePath)}' route uses prerendering and includes parameters, but 'getPrerenderParams' ` +
                    `is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration ` +
                    `or specify a different 'renderMode'.`,
            };
            return;
        }
        if (serverConfigRouteTree) {
            // Automatically resolve dynamic parameters for nested routes.
            const catchAllRoutePath = isCatchAllRoute
                ? currentRoutePath
                : joinUrlParts(currentRoutePath, '**');
            const match = serverConfigRouteTree.match(catchAllRoutePath);
            if (match && match.renderMode === RenderMode.Prerender && !('getPrerenderParams' in match)) {
                serverConfigRouteTree.insert(catchAllRoutePath, {
                    ...match,
                    presentInClientRouter: true,
                    getPrerenderParams,
                });
            }
        }
        const parameters = await runInInjectionContext(parentInjector, () => getPrerenderParams());
        try {
            for (const params of parameters) {
                const replacer = handlePrerenderParamsReplacement(params, currentRoutePath);
                const routeWithResolvedParams = currentRoutePath
                    .replace(URL_PARAMETER_REGEXP, replacer)
                    .replace(CATCH_ALL_REGEXP, replacer);
                yield {
                    ...meta,
                    route: routeWithResolvedParams,
                    redirectTo: redirectTo === undefined
                        ? undefined
                        : resolveRedirectTo(routeWithResolvedParams, redirectTo),
                };
            }
        }
        catch (error) {
            yield { error: `${error.message}` };
            return;
        }
    }
    // Handle fallback render modes
    if (includePrerenderFallbackRoutes &&
        (fallback !== PrerenderFallback.None || !invokeGetPrerenderParams)) {
        yield {
            ...meta,
            route: currentRoutePath,
            renderMode: fallback === PrerenderFallback.Client ? RenderMode.Client : RenderMode.Server,
        };
    }
}
/**
 * Creates a replacer function used for substituting parameter placeholders in a route path
 * with their corresponding values provided in the `params` object.
 *
 * @param params - An object mapping parameter names to their string values.
 * @param currentRoutePath - The current route path, used for constructing error messages.
 * @returns A function that replaces a matched parameter placeholder (e.g., ':id') with its corresponding value.
 */
function handlePrerenderParamsReplacement(params, currentRoutePath) {
    return (match) => {
        const parameterName = match.slice(1);
        const value = params[parameterName];
        if (typeof value !== 'string') {
            throw new Error(`The 'getPrerenderParams' function defined for the '${stripLeadingSlash(currentRoutePath)}' route ` +
                `returned a non-string value for parameter '${parameterName}'. ` +
                `Please make sure the 'getPrerenderParams' function returns values for all parameters ` +
                'specified in this route.');
        }
        return parameterName === '**' ? `/${value}` : value;
    };
}
/**
 * Resolves the `redirectTo` property for a given route.
 *
 * This function processes the `redirectTo` property to ensure that it correctly
 * resolves relative to the current route path. If `redirectTo` is an absolute path,
 * it is returned as is. If it is a relative path, it is resolved based on the current route path.
 *
 * @param routePath - The current route path.
 * @param redirectTo - The target path for redirection.
 * @returns The resolved redirect path as a string.
 */
function resolveRedirectTo(routePath, redirectTo) {
    if (redirectTo[0] === '/') {
        // If the redirectTo path is absolute, return it as is.
        return redirectTo;
    }
    // Resolve relative redirectTo based on the current route path.
    const segments = routePath.replace(URL_PARAMETER_REGEXP, '*').split('/');
    segments.pop(); // Remove the last segment to make it relative.
    return joinUrlParts(...segments, redirectTo);
}
/**
 * Builds a server configuration route tree from the given server routes configuration.
 *
 * @param serverRoutesConfig - The server routes to be used for configuration.

 * @returns An object containing:
 * - `serverConfigRouteTree`: A populated `RouteTree` instance, which organizes the server routes
 *   along with their additional metadata.
 * - `errors`: An array of strings that list any errors encountered during the route tree construction
 *   process, such as invalid paths.
 */
function buildServerConfigRouteTree({ routes, appShellRoute }) {
    const serverRoutes = [...routes];
    if (appShellRoute !== undefined) {
        serverRoutes.unshift({
            path: appShellRoute,
            renderMode: RenderMode.Prerender,
        });
    }
    const serverConfigRouteTree = new RouteTree();
    const errors = [];
    for (const { path, ...metadata } of serverRoutes) {
        if (path[0] === '/') {
            errors.push(`Invalid '${path}' route configuration: the path cannot start with a slash.`);
            continue;
        }
        if ('getPrerenderParams' in metadata && (path.includes('/*/') || path.endsWith('/*'))) {
            errors.push(`Invalid '${path}' route configuration: 'getPrerenderParams' cannot be used with a '*' route.`);
            continue;
        }
        serverConfigRouteTree.insert(path, metadata);
    }
    return { serverConfigRouteTree, errors };
}
/**
 * Retrieves routes from the given Angular application.
 *
 * This function initializes an Angular platform, bootstraps the application or module,
 * and retrieves routes from the Angular router configuration. It handles both module-based
 * and function-based bootstrapping. It yields the resulting routes as `RouteTreeNodeMetadata` objects or errors.
 *
 * @param bootstrap - A function that returns a promise resolving to an `ApplicationRef` or an Angular module to bootstrap.
 * @param document - The initial HTML document used for server-side rendering.
 * This document is necessary to render the application on the server.
 * @param url - The URL for server-side rendering. The URL is used to configure `ServerPlatformLocation`. This configuration is crucial
 * for ensuring that API requests for relative paths succeed, which is essential for accurate route extraction.
 * @param invokeGetPrerenderParams - A boolean flag indicating whether to invoke `getPrerenderParams` for parameterized SSG routes
 * to handle prerendering paths. Defaults to `false`.
 * @param includePrerenderFallbackRoutes - A flag indicating whether to include fallback routes in the result. Defaults to `true`.
 * @param entryPointToBrowserMapping - Maps the entry-point name to the associated JavaScript browser bundles.
 *
 * @returns A promise that resolves to an object of type `AngularRouterConfigResult` or errors.
 */
async function getRoutesFromAngularRouterConfig(bootstrap, document, url, invokeGetPrerenderParams = false, includePrerenderFallbackRoutes = true, entryPointToBrowserMapping = undefined) {
    const { protocol, host } = url;
    // Create and initialize the Angular platform for server-side rendering.
    const platformRef = platformServer([
        {
            provide: INITIAL_CONFIG,
            useValue: { document, url: `${protocol}//${host}/` },
        },
        {
            // An Angular Console Provider that does not print a set of predefined logs.
            provide: _Console,
            // Using `useClass` would necessitate decorating `Console` with `@Injectable`,
            // which would require switching from `ts_library` to `ng_module`. This change
            // would also necessitate various patches of `@angular/bazel` to support ESM.
            useFactory: () => new Console(),
        },
        {
            provide: _ENABLE_ROOT_COMPONENT_BOOTSTRAP,
            useValue: false,
        },
    ]);
    try {
        let applicationRef;
        if (isNgModule(bootstrap)) {
            const moduleRef = await platformRef.bootstrapModule(bootstrap);
            applicationRef = moduleRef.injector.get(ApplicationRef);
        }
        else {
            applicationRef = await bootstrap();
        }
        const injector = applicationRef.injector;
        const router = injector.get(Router);
        // Workaround to unblock navigation when `withEnabledBlockingInitialNavigation()` is used.
        // This is necessary because route extraction disables component bootstrapping.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.navigationTransitions.afterPreactivation()?.next?.();
        // Wait until the application is stable.
        await applicationRef.whenStable();
        const errors = [];
        const rawBaseHref = injector.get(APP_BASE_HREF, null, { optional: true }) ??
            injector.get(PlatformLocation).getBaseHrefFromDOM();
        const { pathname: baseHref } = new URL(rawBaseHref, 'http://localhost');
        const compiler = injector.get(Compiler);
        const serverRoutesConfig = injector.get(SERVER_ROUTES_CONFIG, null, { optional: true });
        let serverConfigRouteTree;
        if (serverRoutesConfig) {
            const result = buildServerConfigRouteTree(serverRoutesConfig);
            serverConfigRouteTree = result.serverConfigRouteTree;
            errors.push(...result.errors);
        }
        if (errors.length) {
            return {
                baseHref,
                routes: [],
                errors,
            };
        }
        const routesResults = [];
        if (router.config.length) {
            // Retrieve all routes from the Angular router configuration.
            const traverseRoutes = traverseRoutesConfig({
                routes: router.config,
                compiler,
                parentInjector: injector,
                parentRoute: '',
                serverConfigRouteTree,
                invokeGetPrerenderParams,
                includePrerenderFallbackRoutes,
                entryPointToBrowserMapping,
            });
            const seenRoutes = new Set();
            for await (const routeMetadata of traverseRoutes) {
                if ('error' in routeMetadata) {
                    errors.push(routeMetadata.error);
                    continue;
                }
                // If a result already exists for the exact same route, subsequent matches should be ignored.
                // This aligns with Angular's app router behavior, which prioritizes the first route.
                const routePath = routeMetadata.route;
                if (!seenRoutes.has(routePath)) {
                    routesResults.push(routeMetadata);
                    seenRoutes.add(routePath);
                }
            }
            // This timeout is necessary to prevent 'adev' from hanging in production builds.
            // The exact cause is unclear, but removing it leads to the issue.
            await new Promise((resolve) => setTimeout(resolve, 0));
            if (serverConfigRouteTree) {
                for (const { route, presentInClientRouter } of serverConfigRouteTree.traverse()) {
                    if (presentInClientRouter || route.endsWith('/**')) {
                        // Skip if matched or it's the catch-all route.
                        continue;
                    }
                    errors.push(`The '${stripLeadingSlash(route)}' server route does not match any routes defined in the Angular ` +
                        `routing configuration (typically provided as a part of the 'provideRouter' call). ` +
                        'Please make sure that the mentioned server route is present in the Angular routing configuration.');
                }
            }
        }
        else {
            const rootRouteMetadata = serverConfigRouteTree?.match('') ?? {
                route: '',
                renderMode: RenderMode.Prerender,
            };
            routesResults.push({
                ...rootRouteMetadata,
                // Matched route might be `/*` or `/**`, which would make Angular serve all routes rather than just `/`.
                // So we limit to just `/` for the empty app router case.
                route: '',
            });
        }
        return {
            baseHref,
            routes: routesResults,
            errors,
            appShellRoute: serverRoutesConfig?.appShellRoute,
        };
    }
    finally {
        platformRef.destroy();
    }
}
/**
 * Asynchronously extracts routes from the Angular application configuration
 * and creates a `RouteTree` to manage server-side routing.
 *
 * @param options - An object containing the following options:
 *  - `url`: The URL for server-side rendering. The URL is used to configure `ServerPlatformLocation`. This configuration is crucial
 *     for ensuring that API requests for relative paths succeed, which is essential for accurate route extraction.
 *     See:
 *      - https://github.com/angular/angular/blob/d608b857c689d17a7ffa33bbb510301014d24a17/packages/platform-server/src/location.ts#L51
 *      - https://github.com/angular/angular/blob/6882cc7d9eed26d3caeedca027452367ba25f2b9/packages/platform-server/src/http.ts#L44
 *  - `manifest`: An optional `AngularAppManifest` that contains the application's routing and configuration details.
 *     If not provided, the default manifest is retrieved using `getAngularAppManifest()`.
 *  - `invokeGetPrerenderParams`: A boolean flag indicating whether to invoke `getPrerenderParams` for parameterized SSG routes
 *     to handle prerendering paths. Defaults to `false`.
 *  - `includePrerenderFallbackRoutes`: A flag indicating whether to include fallback routes in the result. Defaults to `true`.
 *  - `signal`: An optional `AbortSignal` that can be used to abort the operation.
 *
 * @returns A promise that resolves to an object containing:
 *  - `routeTree`: A populated `RouteTree` containing all extracted routes from the Angular application.
 *  - `appShellRoute`: The specified route for the app-shell, if configured.
 *  - `errors`: An array of strings representing any errors encountered during the route extraction process.
 */
function extractRoutesAndCreateRouteTree(options) {
    const { url, manifest = getAngularAppManifest(), invokeGetPrerenderParams = false, includePrerenderFallbackRoutes = true, signal, } = options;
    async function extract() {
        const routeTree = new RouteTree();
        const document = await new ServerAssets(manifest).getIndexServerHtml().text();
        const bootstrap = await manifest.bootstrap();
        const { baseHref, appShellRoute, routes, errors } = await getRoutesFromAngularRouterConfig(bootstrap, document, url, invokeGetPrerenderParams, includePrerenderFallbackRoutes, manifest.entryPointToBrowserMapping);
        for (const { route, ...metadata } of routes) {
            if (metadata.redirectTo !== undefined) {
                metadata.redirectTo = joinUrlParts(baseHref, metadata.redirectTo);
            }
            // Remove undefined fields
            // Helps avoid unnecessary test updates
            for (const [key, value] of Object.entries(metadata)) {
                if (value === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    delete metadata[key];
                }
            }
            const fullRoute = joinUrlParts(baseHref, route);
            routeTree.insert(fullRoute, metadata);
        }
        return {
            appShellRoute,
            routeTree,
            errors,
        };
    }
    return signal ? promiseWithAbort(extract(), signal, 'Routes extraction') : extract();
}

/**
 * Manages a collection of hooks and provides methods to register and execute them.
 * Hooks are functions that can be invoked with specific arguments to allow modifications or enhancements.
 */
class Hooks {
    /**
     * A map of hook names to arrays of hook functions.
     * Each hook name can have multiple associated functions, which are executed in sequence.
     */
    store = new Map();
    /**
     * Executes all hooks associated with the specified name, passing the given argument to each hook function.
     * The hooks are invoked sequentially, and the argument may be modified by each hook.
     *
     * @template Hook - The type of the hook name. It should be one of the keys of `HooksMapping`.
     * @param name - The name of the hook whose functions will be executed.
     * @param context - The input value to be passed to each hook function. The value is mutated by each hook function.
     * @returns A promise that resolves once all hook functions have been executed.
     *
     * @example
     * ```typescript
     * const hooks = new Hooks();
     * hooks.on('html:transform:pre', async (ctx) => {
     *   ctx.html = ctx.html.replace(/foo/g, 'bar');
     *   return ctx.html;
     * });
     * const result = await hooks.run('html:transform:pre', { html: '<div>foo</div>' });
     * console.log(result); // '<div>bar</div>'
     * ```
     * @internal
     */
    async run(name, context) {
        const hooks = this.store.get(name);
        switch (name) {
            case 'html:transform:pre': {
                if (!hooks) {
                    return context.html;
                }
                const ctx = { ...context };
                for (const hook of hooks) {
                    ctx.html = await hook(ctx);
                }
                return ctx.html;
            }
            default:
                throw new Error(`Running hook "${name}" is not supported.`);
        }
    }
    /**
     * Registers a new hook function under the specified hook name.
     * This function should be a function that takes an argument of type `T` and returns a `string` or `Promise<string>`.
     *
     * @template Hook - The type of the hook name. It should be one of the keys of `HooksMapping`.
     * @param name - The name of the hook under which the function will be registered.
     * @param handler - A function to be executed when the hook is triggered. The handler will be called with an argument
     *                  that may be modified by the hook functions.
     *
     * @remarks
     * - If there are existing handlers registered under the given hook name, the new handler will be added to the list.
     * - If no handlers are registered under the given hook name, a new list will be created with the handler as its first element.
     *
     * @example
     * ```typescript
     * hooks.on('html:transform:pre', async (ctx) => {
     *   return ctx.html.replace(/foo/g, 'bar');
     * });
     * ```
     */
    on(name, handler) {
        const hooks = this.store.get(name);
        if (hooks) {
            hooks.push(handler);
        }
        else {
            this.store.set(name, [handler]);
        }
    }
    /**
     * Checks if there are any hooks registered under the specified name.
     *
     * @param name - The name of the hook to check.
     * @returns `true` if there are hooks registered under the specified name, otherwise `false`.
     */
    has(name) {
        return !!this.store.get(name)?.length;
    }
}

/**
 * Manages the application's server routing logic by building and maintaining a route tree.
 *
 * This class is responsible for constructing the route tree from the Angular application
 * configuration and using it to match incoming requests to the appropriate routes.
 */
class ServerRouter {
    routeTree;
    /**
     * Creates an instance of the `ServerRouter`.
     *
     * @param routeTree - An instance of `RouteTree` that holds the routing information.
     * The `RouteTree` is used to match request URLs to the appropriate route metadata.
     */
    constructor(routeTree) {
        this.routeTree = routeTree;
    }
    /**
     * Static property to track the ongoing build promise.
     */
    static #extractionPromise;
    /**
     * Creates or retrieves a `ServerRouter` instance based on the provided manifest and URL.
     *
     * If the manifest contains pre-built routes, a new `ServerRouter` is immediately created.
     * Otherwise, it builds the router by extracting routes from the Angular configuration
     * asynchronously. This method ensures that concurrent builds are prevented by re-using
     * the same promise.
     *
     * @param manifest - An instance of `AngularAppManifest` that contains the route information.
     * @param url - The URL for server-side rendering. The URL is needed to configure `ServerPlatformLocation`.
     * This is necessary to ensure that API requests for relative paths succeed, which is crucial for correct route extraction.
     * [Reference](https://github.com/angular/angular/blob/d608b857c689d17a7ffa33bbb510301014d24a17/packages/platform-server/src/location.ts#L51)
     * @returns A promise resolving to a `ServerRouter` instance.
     */
    static from(manifest, url) {
        if (manifest.routes) {
            const routeTree = RouteTree.fromObject(manifest.routes);
            return Promise.resolve(new ServerRouter(routeTree));
        }
        // Create and store a new promise for the build process.
        // This prevents concurrent builds by re-using the same promise.
        ServerRouter.#extractionPromise ??= extractRoutesAndCreateRouteTree({ url, manifest })
            .then(({ routeTree, errors }) => {
            if (errors.length > 0) {
                throw new Error('Error(s) occurred while extracting routes:\n' +
                    errors.map((error) => `- ${error}`).join('\n'));
            }
            return new ServerRouter(routeTree);
        })
            .finally(() => {
            ServerRouter.#extractionPromise = undefined;
        });
        return ServerRouter.#extractionPromise;
    }
    /**
     * Matches a request URL against the route tree to retrieve route metadata.
     *
     * This method strips 'index.html' from the URL if it is present and then attempts
     * to find a match in the route tree. If a match is found, it returns the associated
     * route metadata; otherwise, it returns `undefined`.
     *
     * @param url - The URL to be matched against the route tree.
     * @returns The metadata for the matched route or `undefined` if no match is found.
     */
    match(url) {
        // Strip 'index.html' from URL if present.
        // A request to `http://www.example.com/page/index.html` will render the Angular route corresponding to `http://www.example.com/page`.
        const { pathname } = stripIndexHtmlFromURL(url);
        return this.routeTree.match(decodeURIComponent(pathname));
    }
}

/**
 * Generates a SHA-256 hash of the provided string.
 *
 * @param data - The input string to be hashed.
 * @returns A promise that resolves to the SHA-256 hash of the input,
 * represented as a hexadecimal string.
 */
async function sha256(data) {
    const encodedData = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    const hashParts = [];
    for (const h of new Uint8Array(hashBuffer)) {
        hashParts.push(h.toString(16).padStart(2, '0'));
    }
    return hashParts.join('');
}

/**
 * Pattern used to extract the media query set by Beasties in an `onload` handler.
 */
const MEDIA_SET_HANDLER_PATTERN = /^this\.media=["'](.*)["'];?$/;
/**
 * Name of the attribute used to save the Beasties media query so it can be re-assigned on load.
 */
const CSP_MEDIA_ATTR = 'ngCspMedia';
/**
 * Script that dynamically updates the `media` attribute of `<link>` tags based on a custom attribute (`CSP_MEDIA_ATTR`).
 *
 * NOTE:
 * We do not use `document.querySelectorAll('link').forEach((s) => s.addEventListener('load', ...)`
 * because load events are not always triggered reliably on Chrome.
 * See: https://github.com/angular/angular-cli/issues/26932 and https://crbug.com/1521256
 *
 * The script:
 * - Ensures the event target is a `<link>` tag with the `CSP_MEDIA_ATTR` attribute.
 * - Updates the `media` attribute with the value of `CSP_MEDIA_ATTR` and then removes the attribute.
 * - Removes the event listener when all relevant `<link>` tags have been processed.
 * - Uses event capturing (the `true` parameter) since load events do not bubble up the DOM.
 */
const LINK_LOAD_SCRIPT_CONTENT = /* @__PURE__ */ (() => `(() => {
  const CSP_MEDIA_ATTR = '${CSP_MEDIA_ATTR}';
  const documentElement = document.documentElement;

  // Listener for load events on link tags.
  const listener = (e) => {
    const target = e.target;
    if (
      !target ||
      target.tagName !== 'LINK' ||
      !target.hasAttribute(CSP_MEDIA_ATTR)
    ) {
      return;
    }

    target.media = target.getAttribute(CSP_MEDIA_ATTR);
    target.removeAttribute(CSP_MEDIA_ATTR);

    if (!document.head.querySelector(\`link[\${CSP_MEDIA_ATTR}]\`)) {
      documentElement.removeEventListener('load', listener);
    }
  };

  documentElement.addEventListener('load', listener, true);
})();`)();
class BeastiesBase extends Beasties {
}
/* eslint-enable @typescript-eslint/no-unsafe-declaration-merging */
class InlineCriticalCssProcessor extends BeastiesBase {
    readFile;
    outputPath;
    addedCspScriptsDocuments = new WeakSet();
    documentNonces = new WeakMap();
    constructor(readFile, outputPath) {
        super({
            logger: {
                // eslint-disable-next-line no-console
                warn: (s) => console.warn(s),
                // eslint-disable-next-line no-console
                error: (s) => console.error(s),
                info: () => { },
            },
            logLevel: 'warn',
            path: outputPath,
            publicPath: undefined,
            compress: false,
            pruneSource: false,
            reduceInlineStyles: false,
            mergeStylesheets: false,
            // Note: if `preload` changes to anything other than `media`, the logic in
            // `embedLinkedStylesheet` will have to be updated.
            preload: 'media',
            noscriptFallback: true,
            inlineFonts: true,
        });
        this.readFile = readFile;
        this.outputPath = outputPath;
    }
    /**
     * Override of the Beasties `embedLinkedStylesheet` method
     * that makes it work with Angular's CSP APIs.
     */
    async embedLinkedStylesheet(link, document) {
        if (link.getAttribute('media') === 'print' && link.next?.name === 'noscript') {
            // Workaround for https://github.com/GoogleChromeLabs/critters/issues/64
            // NB: this is only needed for the webpack based builders.
            const media = link.getAttribute('onload')?.match(MEDIA_SET_HANDLER_PATTERN);
            if (media) {
                link.removeAttribute('onload');
                link.setAttribute('media', media[1]);
                link?.next?.remove();
            }
        }
        const returnValue = await super.embedLinkedStylesheet(link, document);
        const cspNonce = this.findCspNonce(document);
        if (cspNonce) {
            const beastiesMedia = link.getAttribute('onload')?.match(MEDIA_SET_HANDLER_PATTERN);
            if (beastiesMedia) {
                // If there's a Beasties-generated `onload` handler and the file has an Angular CSP nonce,
                // we have to remove the handler, because it's incompatible with CSP. We save the value
                // in a different attribute and we generate a script tag with the nonce that uses
                // `addEventListener` to apply the media query instead.
                link.removeAttribute('onload');
                link.setAttribute(CSP_MEDIA_ATTR, beastiesMedia[1]);
                this.conditionallyInsertCspLoadingScript(document, cspNonce, link);
            }
            // Ideally we would hook in at the time Beasties inserts the `style` tags, but there isn't
            // a way of doing that at the moment so we fall back to doing it any time a `link` tag is
            // inserted. We mitigate it by only iterating the direct children of the `<head>` which
            // should be pretty shallow.
            document.head.children.forEach((child) => {
                if (child.tagName === 'style' && !child.hasAttribute('nonce')) {
                    child.setAttribute('nonce', cspNonce);
                }
            });
        }
        return returnValue;
    }
    /**
     * Finds the CSP nonce for a specific document.
     */
    findCspNonce(document) {
        if (this.documentNonces.has(document)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.documentNonces.get(document);
        }
        // HTML attribute are case-insensitive, but the parser used by Beasties is case-sensitive.
        const nonceElement = document.querySelector('[ngCspNonce], [ngcspnonce]');
        const cspNonce = nonceElement?.getAttribute('ngCspNonce') || nonceElement?.getAttribute('ngcspnonce') || null;
        this.documentNonces.set(document, cspNonce);
        return cspNonce;
    }
    /**
     * Inserts the `script` tag that swaps the critical CSS at runtime,
     * if one hasn't been inserted into the document already.
     */
    conditionallyInsertCspLoadingScript(document, nonce, link) {
        if (this.addedCspScriptsDocuments.has(document)) {
            return;
        }
        if (document.head.textContent.includes(LINK_LOAD_SCRIPT_CONTENT)) {
            // Script was already added during the build.
            this.addedCspScriptsDocuments.add(document);
            return;
        }
        const script = document.createElement('script');
        script.setAttribute('nonce', nonce);
        script.textContent = LINK_LOAD_SCRIPT_CONTENT;
        // Prepend the script to the head since it needs to
        // run as early as possible, before the `link` tags.
        document.head.insertBefore(script, link);
        this.addedCspScriptsDocuments.add(document);
    }
}

/**
 * A Least Recently Used (LRU) cache implementation.
 *
 * This cache stores a fixed number of key-value pairs, and when the cache exceeds its capacity,
 * the least recently accessed items are evicted.
 *
 * @template Key - The type of the cache keys.
 * @template Value - The type of the cache values.
 */
class LRUCache {
    /**
     * The maximum number of items the cache can hold.
     */
    capacity;
    /**
     * Internal storage for the cache, mapping keys to their associated nodes in the linked list.
     */
    cache = new Map();
    /**
     * Head of the doubly linked list, representing the most recently used item.
     */
    head;
    /**
     * Tail of the doubly linked list, representing the least recently used item.
     */
    tail;
    /**
     * Creates a new LRUCache instance.
     * @param capacity The maximum number of items the cache can hold.
     */
    constructor(capacity) {
        this.capacity = capacity;
    }
    /**
     * Gets the value associated with the given key.
     * @param key The key to retrieve the value for.
     * @returns The value associated with the key, or undefined if the key is not found.
     */
    get(key) {
        const node = this.cache.get(key);
        if (node) {
            this.moveToHead(node);
            return node.value;
        }
        return undefined;
    }
    /**
     * Puts a key-value pair into the cache.
     * If the key already exists, the value is updated.
     * If the cache is full, the least recently used item is evicted.
     * @param key The key to insert or update.
     * @param value The value to associate with the key.
     */
    put(key, value) {
        const cachedNode = this.cache.get(key);
        if (cachedNode) {
            // Update existing node
            cachedNode.value = value;
            this.moveToHead(cachedNode);
            return;
        }
        // Create a new node
        const newNode = { key, value, prev: undefined, next: undefined };
        this.cache.set(key, newNode);
        this.addToHead(newNode);
        if (this.cache.size > this.capacity) {
            // Evict the LRU item
            const tail = this.removeTail();
            if (tail) {
                this.cache.delete(tail.key);
            }
        }
    }
    /**
     * Adds a node to the head of the linked list.
     * @param node The node to add.
     */
    addToHead(node) {
        node.next = this.head;
        node.prev = undefined;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    /**
     * Removes a node from the linked list.
     * @param node The node to remove.
     */
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
    }
    /**
     * Moves a node to the head of the linked list.
     * @param node The node to move.
     */
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    /**
     * Removes the tail node from the linked list.
     * @returns The removed tail node, or undefined if the list is empty.
     */
    removeTail() {
        const node = this.tail;
        if (node) {
            this.removeNode(node);
        }
        return node;
    }
}

/**
 * Maximum number of critical CSS entries the cache can store.
 * This value determines the capacity of the LRU (Least Recently Used) cache, which stores critical CSS for pages.
 */
const MAX_INLINE_CSS_CACHE_ENTRIES = 50;
/**
 * A mapping of `RenderMode` enum values to corresponding string representations.
 *
 * This record is used to map each `RenderMode` to a specific string value that represents
 * the server context. The string values are used internally to differentiate
 * between various rendering strategies when processing routes.
 *
 * - `RenderMode.Prerender` maps to `'ssg'` (Static Site Generation).
 * - `RenderMode.Server` maps to `'ssr'` (Server-Side Rendering).
 * - `RenderMode.Client` maps to an empty string `''` (Client-Side Rendering, no server context needed).
 */
const SERVER_CONTEXT_VALUE = {
    [RenderMode.Prerender]: 'ssg',
    [RenderMode.Server]: 'ssr',
    [RenderMode.Client]: '',
};
/**
 * Represents a locale-specific Angular server application managed by the server application engine.
 *
 * The `AngularServerApp` class handles server-side rendering and asset management for a specific locale.
 */
class AngularServerApp {
    options;
    /**
     * Whether prerendered routes should be rendered on demand or served directly.
     *
     * @see {@link AngularServerAppOptions.allowStaticRouteRender} for more details.
     */
    allowStaticRouteRender;
    /**
     * Hooks for extending or modifying server behavior.
     *
     * @see {@link AngularServerAppOptions.hooks} for more details.
     */
    hooks;
    /**
     * Constructs an instance of `AngularServerApp`.
     *
     * @param options Optional configuration options for the server application.
     */
    constructor(options = {}) {
        this.options = options;
        this.allowStaticRouteRender = this.options.allowStaticRouteRender ?? false;
        this.hooks = options.hooks ?? new Hooks();
    }
    /**
     * The manifest associated with this server application.
     */
    manifest = getAngularAppManifest();
    /**
     * An instance of ServerAsset that handles server-side asset.
     */
    assets = new ServerAssets(this.manifest);
    /**
     * The router instance used for route matching and handling.
     */
    router;
    /**
     * The `inlineCriticalCssProcessor` is responsible for handling critical CSS inlining.
     */
    inlineCriticalCssProcessor;
    /**
     * The bootstrap mechanism for the server application.
     */
    boostrap;
    /**
     * Cache for storing critical CSS for pages.
     * Stores a maximum of MAX_INLINE_CSS_CACHE_ENTRIES entries.
     *
     * Uses an LRU (Least Recently Used) eviction policy, meaning that when the cache is full,
     * the least recently accessed page's critical CSS will be removed to make space for new entries.
     */
    criticalCssLRUCache = new LRUCache(MAX_INLINE_CSS_CACHE_ENTRIES);
    /**
     * Handles an incoming HTTP request by serving prerendered content, performing server-side rendering,
     * or delivering a static file for client-side rendered routes based on the `RenderMode` setting.
     *
     * @param request - The HTTP request to handle.
     * @param requestContext - Optional context for rendering, such as metadata associated with the request.
     * @returns A promise that resolves to the resulting HTTP response object, or `null` if no matching Angular route is found.
     *
     * @remarks A request to `https://www.example.com/page/index.html` will serve or render the Angular route
     * corresponding to `https://www.example.com/page`.
     */
    async handle(request, requestContext) {
        const url = new URL(request.url);
        this.router ??= await ServerRouter.from(this.manifest, url);
        const matchedRoute = this.router.match(url);
        if (!matchedRoute) {
            // Not a known Angular route.
            return null;
        }
        const { redirectTo, status, renderMode } = matchedRoute;
        if (redirectTo !== undefined) {
            return new Response(null, {
                // Note: The status code is validated during route extraction.
                // 302 Found is used by default for redirections
                // See: https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static#status
                status: status ?? 302,
                headers: {
                    'Location': buildPathWithParams(redirectTo, url.pathname),
                },
            });
        }
        if (renderMode === RenderMode.Prerender) {
            const response = await this.handleServe(request, matchedRoute);
            if (response) {
                return response;
            }
        }
        return promiseWithAbort(this.handleRendering(request, matchedRoute, requestContext), request.signal, `Request for: ${request.url}`);
    }
    /**
     * Handles serving a prerendered static asset if available for the matched route.
     *
     * This method only supports `GET` and `HEAD` requests.
     *
     * @param request - The incoming HTTP request for serving a static page.
     * @param matchedRoute - The metadata of the matched route for rendering.
     * If not provided, the method attempts to find a matching route based on the request URL.
     * @returns A promise that resolves to a `Response` object if the prerendered page is found, or `null`.
     */
    async handleServe(request, matchedRoute) {
        const { headers, renderMode } = matchedRoute;
        if (renderMode !== RenderMode.Prerender) {
            return null;
        }
        const { method } = request;
        if (method !== 'GET' && method !== 'HEAD') {
            return null;
        }
        const assetPath = this.buildServerAssetPathFromRequest(request);
        const { manifest: { locale }, assets, } = this;
        if (!assets.hasServerAsset(assetPath)) {
            return null;
        }
        const { text, hash, size } = assets.getServerAsset(assetPath);
        const etag = `"${hash}"`;
        return request.headers.get('if-none-match') === etag
            ? new Response(undefined, { status: 304, statusText: 'Not Modified' })
            : new Response(await text(), {
                headers: {
                    'Content-Length': size.toString(),
                    'ETag': etag,
                    'Content-Type': 'text/html;charset=UTF-8',
                    ...(locale !== undefined ? { 'Content-Language': locale } : {}),
                    ...headers,
                },
            });
    }
    /**
     * Handles the server-side rendering process for the given HTTP request.
     * This method matches the request URL to a route and performs rendering if a matching route is found.
     *
     * @param request - The incoming HTTP request to be processed.
     * @param matchedRoute - The metadata of the matched route for rendering.
     * If not provided, the method attempts to find a matching route based on the request URL.
     * @param requestContext - Optional additional context for rendering, such as request metadata.
     *
     * @returns A promise that resolves to the rendered response, or null if no matching route is found.
     */
    async handleRendering(request, matchedRoute, requestContext) {
        const { renderMode, headers, status, preload } = matchedRoute;
        if (!this.allowStaticRouteRender && renderMode === RenderMode.Prerender) {
            return null;
        }
        const url = new URL(request.url);
        const platformProviders = [];
        const { manifest: { bootstrap, inlineCriticalCss, locale }, assets, } = this;
        // Initialize the response with status and headers if available.
        const responseInit = {
            status,
            headers: new Headers({
                'Content-Type': 'text/html;charset=UTF-8',
                ...(locale !== undefined ? { 'Content-Language': locale } : {}),
                ...headers,
            }),
        };
        if (renderMode === RenderMode.Server) {
            // Configure platform providers for request and response only for SSR.
            platformProviders.push({
                provide: REQUEST,
                useValue: request,
            }, {
                provide: REQUEST_CONTEXT,
                useValue: requestContext,
            }, {
                provide: RESPONSE_INIT,
                useValue: responseInit,
            });
        }
        else if (renderMode === RenderMode.Client) {
            // Serve the client-side rendered version if the route is configured for CSR.
            let html = await this.assets.getServerAsset('index.csr.html').text();
            html = await this.runTransformsOnHtml(html, url, preload);
            return new Response(html, responseInit);
        }
        if (locale !== undefined) {
            platformProviders.push({
                provide: LOCALE_ID,
                useValue: locale,
            });
        }
        this.boostrap ??= await bootstrap();
        let html = await assets.getIndexServerHtml().text();
        html = await this.runTransformsOnHtml(html, url, preload);
        html = await renderAngular(html, this.boostrap, url, platformProviders, SERVER_CONTEXT_VALUE[renderMode]);
        if (inlineCriticalCss) {
            // Optionally inline critical CSS.
            this.inlineCriticalCssProcessor ??= new InlineCriticalCssProcessor((path) => {
                const fileName = path.split('/').pop() ?? path;
                return this.assets.getServerAsset(fileName).text();
            });
            // TODO(alanagius): remove once Node.js version 18 is no longer supported.
            if (renderMode === RenderMode.Server && typeof crypto === 'undefined') {
                // eslint-disable-next-line no-console
                console.error(`The global 'crypto' module is unavailable. ` +
                    `If you are running on Node.js, please ensure you are using version 20 or later, ` +
                    `which includes built-in support for the Web Crypto module.`);
            }
            if (renderMode === RenderMode.Server && typeof crypto !== 'undefined') {
                // Only cache if we are running in SSR Mode.
                const cacheKey = await sha256(html);
                let htmlWithCriticalCss = this.criticalCssLRUCache.get(cacheKey);
                if (htmlWithCriticalCss === undefined) {
                    htmlWithCriticalCss = await this.inlineCriticalCssProcessor.process(html);
                    this.criticalCssLRUCache.put(cacheKey, htmlWithCriticalCss);
                }
                html = htmlWithCriticalCss;
            }
            else {
                html = await this.inlineCriticalCssProcessor.process(html);
            }
        }
        return new Response(html, responseInit);
    }
    /**
     * Constructs the asset path on the server based on the provided HTTP request.
     *
     * This method processes the incoming request URL to derive a path corresponding
     * to the requested asset. It ensures the path points to the correct file (e.g.,
     * `index.html`) and removes any base href if it is not part of the asset path.
     *
     * @param request - The incoming HTTP request object.
     * @returns The server-relative asset path derived from the request.
     */
    buildServerAssetPathFromRequest(request) {
        let { pathname: assetPath } = new URL(request.url);
        if (!assetPath.endsWith('/index.html')) {
            // Append "index.html" to build the default asset path.
            assetPath = joinUrlParts(assetPath, 'index.html');
        }
        const { baseHref } = this.manifest;
        // Check if the asset path starts with the base href and the base href is not (`/` or ``).
        if (baseHref.length > 1 && assetPath.startsWith(baseHref)) {
            // Remove the base href from the start of the asset path to align with server-asset expectations.
            assetPath = assetPath.slice(baseHref.length);
        }
        return stripLeadingSlash(assetPath);
    }
    /**
     * Runs the registered transform hooks on the given HTML content.
     *
     * @param html - The raw HTML content to be transformed.
     * @param url - The URL associated with the HTML content, used for context during transformations.
     * @param preload - An array of URLs representing the JavaScript resources to preload.
     * @returns A promise that resolves to the transformed HTML string.
     */
    async runTransformsOnHtml(html, url, preload) {
        if (this.hooks.has('html:transform:pre')) {
            html = await this.hooks.run('html:transform:pre', { html, url });
        }
        if (preload?.length) {
            html = appendPreloadHintsToHtml(html, preload);
        }
        return html;
    }
}
let angularServerApp;
/**
 * Retrieves or creates an instance of `AngularServerApp`.
 * - If an instance of `AngularServerApp` already exists, it will return the existing one.
 * - If no instance exists, it will create a new one with the provided options.
 *
 * @param options Optional configuration options for the server application.
 *
 * @returns The existing or newly created instance of `AngularServerApp`.
 */
function getOrCreateAngularServerApp(options) {
    return (angularServerApp ??= new AngularServerApp(options));
}
/**
 * Destroys the existing `AngularServerApp` instance, releasing associated resources and resetting the
 * reference to `undefined`.
 *
 * This function is primarily used to enable the recreation of the `AngularServerApp` instance,
 * typically when server configuration or application state needs to be refreshed.
 */
function destroyAngularServerApp() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        // Need to clean up GENERATED_COMP_IDS map in `@angular/core`.
        // Otherwise an incorrect component ID generation collision detected warning will be displayed in development.
        // See: https://github.com/angular/angular-cli/issues/25924
        _resetCompiledComponents();
    }
    angularServerApp = undefined;
}
/**
 * Appends module preload hints to an HTML string for specified JavaScript resources.
 * This function enhances the HTML by injecting `<link rel="modulepreload">` elements
 * for each provided resource, allowing browsers to preload the specified JavaScript
 * modules for better performance.
 *
 * @param html - The original HTML string to which preload hints will be added.
 * @param preload - An array of URLs representing the JavaScript resources to preload.
 * @returns The modified HTML string with the preload hints injected before the closing `</body>` tag.
 *          If `</body>` is not found, the links are not added.
 */
function appendPreloadHintsToHtml(html, preload) {
    const bodyCloseIdx = html.lastIndexOf('</body>');
    if (bodyCloseIdx === -1) {
        return html;
    }
    // Note: Module preloads should be placed at the end before the closing body tag to avoid a performance penalty.
    // Placing them earlier can cause the browser to prioritize downloading these modules
    // over other critical page resources like images, CSS, and fonts.
    return [
        html.slice(0, bodyCloseIdx),
        ...preload.map((val) => `<link rel="modulepreload" href="${val}">`),
        html.slice(bodyCloseIdx),
    ].join('\n');
}

/**
 * Extracts a potential locale ID from a given URL based on the specified base path.
 *
 * This function parses the URL to locate a potential locale identifier that immediately
 * follows the base path segment in the URL's pathname. If the URL does not contain a valid
 * locale ID, an empty string is returned.
 *
 * @param url - The full URL from which to extract the locale ID.
 * @param basePath - The base path used as the reference point for extracting the locale ID.
 * @returns The extracted locale ID if present, or an empty string if no valid locale ID is found.
 *
 * @example
 * ```js
 * const url = new URL('https://example.com/base/en/page');
 * const basePath = '/base';
 * const localeId = getPotentialLocaleIdFromUrl(url, basePath);
 * console.log(localeId); // Output: 'en'
 * ```
 */
function getPotentialLocaleIdFromUrl(url, basePath) {
    const { pathname } = url;
    // Move forward of the base path section.
    let start = basePath.length;
    if (pathname[start] === '/') {
        start++;
    }
    // Find the next forward slash.
    let end = pathname.indexOf('/', start);
    if (end === -1) {
        end = pathname.length;
    }
    // Extract the potential locale id.
    return pathname.slice(start, end);
}
/**
 * Parses the `Accept-Language` header and returns a list of locale preferences with their respective quality values.
 *
 * The `Accept-Language` header is typically a comma-separated list of locales, with optional quality values
 * in the form of `q=<value>`. If no quality value is specified, a default quality of `1` is assumed.
 * Special case: if the header is `*`, it returns the default locale with a quality of `1`.
 *
 * @param header - The value of the `Accept-Language` header, typically a comma-separated list of locales
 *                  with optional quality values (e.g., `en-US;q=0.8,fr-FR;q=0.9`). If the header is `*`,
 *                  it represents a wildcard for any language, returning the default locale.
 *
 * @returns A `ReadonlyMap` where the key is the locale (e.g., `en-US`, `fr-FR`), and the value is
 *          the associated quality value (a number between 0 and 1). If no quality value is provided,
 *          a default of `1` is used.
 *
 * @example
 * ```js
 * parseLanguageHeader('en-US;q=0.8,fr-FR;q=0.9')
 * // returns new Map([['en-US', 0.8], ['fr-FR', 0.9]])

 * parseLanguageHeader('*')
 * // returns new Map([['*', 1]])
 * ```
 */
function parseLanguageHeader(header) {
    if (header === '*') {
        return new Map([['*', 1]]);
    }
    const parsedValues = header
        .split(',')
        .map((item) => {
        const [locale, qualityValue] = item.split(';', 2).map((v) => v.trim());
        let quality = qualityValue?.startsWith('q=') ? parseFloat(qualityValue.slice(2)) : undefined;
        if (typeof quality !== 'number' || isNaN(quality) || quality < 0 || quality > 1) {
            quality = 1; // Invalid quality value defaults to 1
        }
        return [locale, quality];
    })
        .sort(([_localeA, qualityA], [_localeB, qualityB]) => qualityB - qualityA);
    return new Map(parsedValues);
}
/**
 * Gets the preferred locale based on the highest quality value from the provided `Accept-Language` header
 * and the set of available locales.
 *
 * This function adheres to the HTTP `Accept-Language` header specification as defined in
 * [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-5.3.5), including:
 * - Case-insensitive matching of language tags.
 * - Quality value handling (e.g., `q=1`, `q=0.8`). If no quality value is provided, it defaults to `q=1`.
 * - Prefix matching (e.g., `en` matching `en-US` or `en-GB`).
 *
 * @param header - The `Accept-Language` header string to parse and evaluate. It may contain multiple
 *                 locales with optional quality values, for example: `'en-US;q=0.8,fr-FR;q=0.9'`.
 * @param supportedLocales - An array of supported locales (e.g., `['en-US', 'fr-FR']`),
 *                           representing the locales available in the application.
 * @returns The best matching locale from the supported languages, or `undefined` if no match is found.
 *
 * @example
 * ```js
 * getPreferredLocale('en-US;q=0.8,fr-FR;q=0.9', ['en-US', 'fr-FR', 'de-DE'])
 * // returns 'fr-FR'
 *
 * getPreferredLocale('en;q=0.9,fr-FR;q=0.8', ['en-US', 'fr-FR', 'de-DE'])
 * // returns 'en-US'
 *
 * getPreferredLocale('es-ES;q=0.7', ['en-US', 'fr-FR', 'de-DE'])
 * // returns undefined
 * ```
 */
function getPreferredLocale(header, supportedLocales) {
    if (supportedLocales.length < 2) {
        return supportedLocales[0];
    }
    const parsedLocales = parseLanguageHeader(header);
    // Handle edge cases:
    // - No preferred locales provided.
    // - Only one supported locale.
    // - Wildcard preference.
    if (parsedLocales.size === 0 || (parsedLocales.size === 1 && parsedLocales.has('*'))) {
        return supportedLocales[0];
    }
    // Create a map for case-insensitive lookup of supported locales.
    // Keys are normalized (lowercase) locale values, values are original casing.
    const normalizedSupportedLocales = new Map();
    for (const locale of supportedLocales) {
        normalizedSupportedLocales.set(normalizeLocale(locale), locale);
    }
    // Iterate through parsed locales in descending order of quality.
    let bestMatch;
    const qualityZeroNormalizedLocales = new Set();
    for (const [locale, quality] of parsedLocales) {
        const normalizedLocale = normalizeLocale(locale);
        if (quality === 0) {
            qualityZeroNormalizedLocales.add(normalizedLocale);
            continue; // Skip locales with quality value of 0.
        }
        // Exact match found.
        if (normalizedSupportedLocales.has(normalizedLocale)) {
            return normalizedSupportedLocales.get(normalizedLocale);
        }
        // If an exact match is not found, try prefix matching (e.g., "en" matches "en-US").
        // Store the first prefix match encountered, as it has the highest quality value.
        if (bestMatch !== undefined) {
            continue;
        }
        const [languagePrefix] = normalizedLocale.split('-', 1);
        for (const supportedLocale of normalizedSupportedLocales.keys()) {
            if (supportedLocale.startsWith(languagePrefix)) {
                bestMatch = normalizedSupportedLocales.get(supportedLocale);
                break; // No need to continue searching for this locale.
            }
        }
    }
    if (bestMatch !== undefined) {
        return bestMatch;
    }
    // Return the first locale that is not quality zero.
    for (const [normalizedLocale, locale] of normalizedSupportedLocales) {
        if (!qualityZeroNormalizedLocales.has(normalizedLocale)) {
            return locale;
        }
    }
}
/**
 * Normalizes a locale string by converting it to lowercase.
 *
 * @param locale - The locale string to normalize.
 * @returns The normalized locale string in lowercase.
 *
 * @example
 * ```ts
 * const normalized = normalizeLocale('EN-US');
 * console.log(normalized); // Output: "en-us"
 * ```
 */
function normalizeLocale(locale) {
    return locale.toLowerCase();
}

/**
 * Angular server application engine.
 * Manages Angular server applications (including localized ones), handles rendering requests,
 * and optionally transforms index HTML before rendering.
 *
 * @remarks This class should be instantiated once and used as a singleton across the server-side
 * application to ensure consistent handling of rendering requests and resource management.
 *
 * @developerPreview
 */
class AngularAppEngine {
    /**
     * A flag to enable or disable the rendering of prerendered routes.
     *
     * Typically used during development to avoid prerendering all routes ahead of time,
     * allowing them to be rendered on the fly as requested.
     *
     * @private
     */
    static ɵallowStaticRouteRender = false;
    /**
     * Hooks for extending or modifying the behavior of the server application.
     * These hooks are used by the Angular CLI when running the development server and
     * provide extensibility points for the application lifecycle.
     *
     * @private
     */
    static ɵhooks = /* #__PURE__*/ new Hooks();
    /**
     * The manifest for the server application.
     */
    manifest = getAngularAppEngineManifest();
    /**
     * A map of supported locales from the server application's manifest.
     */
    supportedLocales = Object.keys(this.manifest.supportedLocales);
    /**
     * A cache that holds entry points, keyed by their potential locale string.
     */
    entryPointsCache = new Map();
    /**
     * Handles an incoming HTTP request by serving prerendered content, performing server-side rendering,
     * or delivering a static file for client-side rendered routes based on the `RenderMode` setting.
     *
     * @param request - The HTTP request to handle.
     * @param requestContext - Optional context for rendering, such as metadata associated with the request.
     * @returns A promise that resolves to the resulting HTTP response object, or `null` if no matching Angular route is found.
     *
     * @remarks A request to `https://www.example.com/page/index.html` will serve or render the Angular route
     * corresponding to `https://www.example.com/page`.
     */
    async handle(request, requestContext) {
        const serverApp = await this.getAngularServerAppForRequest(request);
        if (serverApp) {
            return serverApp.handle(request, requestContext);
        }
        if (this.supportedLocales.length > 1) {
            // Redirect to the preferred language if i18n is enabled.
            return this.redirectBasedOnAcceptLanguage(request);
        }
        return null;
    }
    /**
     * Handles requests for the base path when i18n is enabled.
     * Redirects the user to a locale-specific path based on the `Accept-Language` header.
     *
     * @param request The incoming request.
     * @returns A `Response` object with a 302 redirect, or `null` if i18n is not enabled
     *          or the request is not for the base path.
     */
    redirectBasedOnAcceptLanguage(request) {
        const { basePath, supportedLocales } = this.manifest;
        // If the request is not for the base path, it's not our responsibility to handle it.
        const { pathname } = new URL(request.url);
        if (pathname !== basePath) {
            return null;
        }
        // For requests to the base path (typically '/'), attempt to extract the preferred locale
        // from the 'Accept-Language' header.
        const preferredLocale = getPreferredLocale(request.headers.get('Accept-Language') || '*', this.supportedLocales);
        if (preferredLocale) {
            const subPath = supportedLocales[preferredLocale];
            if (subPath !== undefined) {
                return new Response(null, {
                    status: 302, // Use a 302 redirect as language preference may change.
                    headers: {
                        'Location': joinUrlParts(pathname, subPath),
                        'Vary': 'Accept-Language',
                    },
                });
            }
        }
        return null;
    }
    /**
     * Retrieves the Angular server application instance for a given request.
     *
     * This method checks if the request URL corresponds to an Angular application entry point.
     * If so, it initializes or retrieves an instance of the Angular server application for that entry point.
     * Requests that resemble file requests (except for `/index.html`) are skipped.
     *
     * @param request - The incoming HTTP request object.
     * @returns A promise that resolves to an `AngularServerApp` instance if a valid entry point is found,
     * or `null` if no entry point matches the request URL.
     */
    async getAngularServerAppForRequest(request) {
        // Skip if the request looks like a file but not `/index.html`.
        const url = new URL(request.url);
        const entryPoint = await this.getEntryPointExportsForUrl(url);
        if (!entryPoint) {
            return null;
        }
        // Note: Using `instanceof` is not feasible here because `AngularServerApp` will
        // be located in separate bundles, making `instanceof` checks unreliable.
        const ɵgetOrCreateAngularServerApp = entryPoint.ɵgetOrCreateAngularServerApp;
        const serverApp = ɵgetOrCreateAngularServerApp({
            allowStaticRouteRender: AngularAppEngine.ɵallowStaticRouteRender,
            hooks: AngularAppEngine.ɵhooks,
        });
        return serverApp;
    }
    /**
     * Retrieves the exports for a specific entry point, caching the result.
     *
     * @param potentialLocale - The locale string used to find the corresponding entry point.
     * @returns A promise that resolves to the entry point exports or `undefined` if not found.
     */
    getEntryPointExports(potentialLocale) {
        const cachedEntryPoint = this.entryPointsCache.get(potentialLocale);
        if (cachedEntryPoint) {
            return cachedEntryPoint;
        }
        const { entryPoints } = this.manifest;
        const entryPoint = entryPoints[potentialLocale];
        if (!entryPoint) {
            return undefined;
        }
        const entryPointExports = entryPoint();
        this.entryPointsCache.set(potentialLocale, entryPointExports);
        return entryPointExports;
    }
    /**
     * Retrieves the entry point for a given URL by determining the locale and mapping it to
     * the appropriate application bundle.
     *
     * This method determines the appropriate entry point and locale for rendering the application by examining the URL.
     * If there is only one entry point available, it is returned regardless of the URL.
     * Otherwise, the method extracts a potential locale identifier from the URL and looks up the corresponding entry point.
     *
     * @param url - The URL of the request.
     * @returns A promise that resolves to the entry point exports or `undefined` if not found.
     */
    getEntryPointExportsForUrl(url) {
        const { basePath } = this.manifest;
        if (this.supportedLocales.length === 1) {
            return this.getEntryPointExports('');
        }
        const potentialLocale = getPotentialLocaleIdFromUrl(url, basePath);
        return this.getEntryPointExports(potentialLocale) ?? this.getEntryPointExports('');
    }
}

/**
 * Annotates a request handler function with metadata, marking it as a special
 * handler.
 *
 * @param handler - The request handler function to be annotated.
 * @returns The same handler function passed in, with metadata attached.
 *
 * @example
 * Example usage in a Hono application:
 * ```ts
 * const app = new Hono();
 * export default createRequestHandler(app.fetch);
 * ```
 *
 * @example
 * Example usage in a H3 application:
 * ```ts
 * const app = createApp();
 * const handler = toWebHandler(app);
 * export default createRequestHandler(handler);
 * ```
 * @developerPreview
 */
function createRequestHandler(handler) {
    handler['__ng_request_handler__'] = true;
    return handler;
}

export { AngularAppEngine, PrerenderFallback, RenderMode, createRequestHandler, provideServerRoutesConfig, provideServerRouting, withAppShell, InlineCriticalCssProcessor as ɵInlineCriticalCssProcessor, destroyAngularServerApp as ɵdestroyAngularServerApp, extractRoutesAndCreateRouteTree as ɵextractRoutesAndCreateRouteTree, getOrCreateAngularServerApp as ɵgetOrCreateAngularServerApp, getRoutesFromAngularRouterConfig as ɵgetRoutesFromAngularRouterConfig, setAngularAppEngineManifest as ɵsetAngularAppEngineManifest, setAngularAppManifest as ɵsetAngularAppManifest };
//# sourceMappingURL=ssr.mjs.map
