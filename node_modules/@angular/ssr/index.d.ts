import { EnvironmentProviders, Type, Provider, ApplicationRef } from '@angular/core';
import { DefaultExport } from '@angular/router';
import Beasties from './third_party/beasties';

/**
 * Identifies a particular kind of `ServerRoutesFeatureKind`.
 * @see {@link ServerRoutesFeature}
 * @developerPreview
 */
declare enum ServerRoutesFeatureKind {
    AppShell = 0
}
/**
 * Helper type to represent a server routes feature.
 * @see {@link ServerRoutesFeatureKind}
 * @developerPreview
 */
interface ServerRoutesFeature<FeatureKind extends ServerRoutesFeatureKind> {
    ɵkind: FeatureKind;
    ɵproviders: Provider[];
}
/**
 * Different rendering modes for server routes.
 * @see {@link provideServerRouting}
 * @see {@link ServerRoute}
 * @developerPreview
 */
declare enum RenderMode {
    /** Server-Side Rendering (SSR) mode, where content is rendered on the server for each request. */
    Server = 0,
    /** Client-Side Rendering (CSR) mode, where content is rendered on the client side in the browser. */
    Client = 1,
    /** Static Site Generation (SSG) mode, where content is pre-rendered at build time and served as static files. */
    Prerender = 2
}
/**
 * Defines the fallback strategies for Static Site Generation (SSG) routes when a pre-rendered path is not available.
 * This is particularly relevant for routes with parameterized URLs where some paths might not be pre-rendered at build time.
 * @see {@link ServerRoutePrerenderWithParams}
 * @developerPreview
 */
declare enum PrerenderFallback {
    /**
     * Fallback to Server-Side Rendering (SSR) if the pre-rendered path is not available.
     * This strategy dynamically generates the page on the server at request time.
     */
    Server = 0,
    /**
     * Fallback to Client-Side Rendering (CSR) if the pre-rendered path is not available.
     * This strategy allows the page to be rendered on the client side.
     */
    Client = 1,
    /**
     * No fallback; if the path is not pre-rendered, the server will not handle the request.
     * This means the application will not provide any response for paths that are not pre-rendered.
     */
    None = 2
}
/**
 * Common interface for server routes, providing shared properties.
 * @developerPreview
 */
interface ServerRouteCommon {
    /** The path associated with this route. */
    path: string;
    /** Optional additional headers to include in the response for this route. */
    headers?: Record<string, string>;
    /** Optional status code to return for this route. */
    status?: number;
}
/**
 * A server route that uses Client-Side Rendering (CSR) mode.
 * @see {@link RenderMode}
 * @developerPreview
 */
interface ServerRouteClient extends ServerRouteCommon {
    /** Specifies that the route uses Client-Side Rendering (CSR) mode. */
    renderMode: RenderMode.Client;
}
/**
 * A server route that uses Static Site Generation (SSG) mode.
 * @see {@link RenderMode}
 * @developerPreview
 */
interface ServerRoutePrerender extends Omit<ServerRouteCommon, 'status'> {
    /** Specifies that the route uses Static Site Generation (SSG) mode. */
    renderMode: RenderMode.Prerender;
    /** Fallback cannot be specified unless `getPrerenderParams` is used. */
    fallback?: never;
}
/**
 * A server route configuration that uses Static Site Generation (SSG) mode, including support for routes with parameters.
 * @see {@link RenderMode}
 * @see {@link ServerRoutePrerender}
 * @see {@link PrerenderFallback}
 * @developerPreview
 */
interface ServerRoutePrerenderWithParams extends Omit<ServerRoutePrerender, 'fallback'> {
    /**
     * Optional strategy to use if the SSG path is not pre-rendered.
     * This is especially relevant for routes with parameterized URLs, where some paths may not be pre-rendered at build time.
     *
     * This property determines how to handle requests for paths that are not pre-rendered:
     * - `PrerenderFallback.Server`: Use Server-Side Rendering (SSR) to dynamically generate the page at request time.
     * - `PrerenderFallback.Client`: Use Client-Side Rendering (CSR) to fetch and render the page on the client side.
     * - `PrerenderFallback.None`: No fallback; if the path is not pre-rendered, the server will not handle the request.
     *
     * @default `PrerenderFallback.Server` if not provided.
     */
    fallback?: PrerenderFallback;
    /**
     * A function that returns a Promise resolving to an array of objects, each representing a route path with URL parameters.
     * This function runs in the injector context, allowing access to Angular services and dependencies.
     *
     * It also works for catch-all routes (e.g., `/**`), where the parameter name will be `**` and the return value will be
     * the segments of the path, such as `/foo/bar`. These routes can also be combined, e.g., `/product/:id/**`,
     * where both a parameterized segment (`:id`) and a catch-all segment (`**`) can be used together to handle more complex paths.
     *
     * @returns A Promise resolving to an array where each element is an object with string keys (representing URL parameter names)
     * and string values (representing the corresponding values for those parameters in the route path).
     *
     * @example
     * ```typescript
     * export const serverRouteConfig: ServerRoutes[] = [
     *   {
     *     path: '/product/:id',
     *     renderMode: RenderMode.Prerender,
     *     async getPrerenderParams() {
     *       const productService = inject(ProductService);
     *       const ids = await productService.getIds(); // Assuming this returns ['1', '2', '3']
     *
     *       return ids.map(id => ({ id })); // Generates paths like: ['product/1', 'product/2', 'product/3']
     *     },
     *   },
     *   {
     *     path: '/product/:id/**',
     *     renderMode: RenderMode.Prerender,
     *     async getPrerenderParams() {
     *       return [
     *         { id: '1', '**': 'laptop/3' },
     *         { id: '2', '**': 'laptop/4' }
     *       ]; // Generates paths like: ['product/1/laptop/3', 'product/2/laptop/4']
     *     },
     *   },
     * ];
     * ```
     */
    getPrerenderParams: () => Promise<Record<string, string>[]>;
}
/**
 * A server route that uses Server-Side Rendering (SSR) mode.
 * @see {@link RenderMode}
 * @developerPreview
 */
interface ServerRouteServer extends ServerRouteCommon {
    /** Specifies that the route uses Server-Side Rendering (SSR) mode. */
    renderMode: RenderMode.Server;
}
/**
 * Server route configuration.
 * @see {@link provideServerRouting}
 * @developerPreview
 */
type ServerRoute = ServerRouteClient | ServerRoutePrerender | ServerRoutePrerenderWithParams | ServerRouteServer;
/**
 * Configuration options for server routes.
 *
 * This interface defines the optional settings available for configuring server routes
 * in the server-side environment, such as specifying a path to the app shell route.
 *
 *
 * @see {@link provideServerRouting}
 * @deprecated use `provideServerRouting`. This will be removed in version 20.
 */
interface ServerRoutesConfigOptions {
    /**
     * Defines the route to be used as the app shell, which serves as the main entry
     * point for the application. This route is often used to enable server-side rendering
     * of the application shell for requests that do not match any specific server route.
     */
    appShellRoute?: string;
}
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
declare function provideServerRoutesConfig(routes: ServerRoute[], options?: ServerRoutesConfigOptions): EnvironmentProviders;
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
declare function provideServerRouting(routes: ServerRoute[], ...features: ServerRoutesFeature<ServerRoutesFeatureKind>[]): EnvironmentProviders;
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
declare function withAppShell(component: Type<unknown> | (() => Promise<Type<unknown> | DefaultExport<Type<unknown>>>)): ServerRoutesFeature<ServerRoutesFeatureKind.AppShell>;

/**
 * Represents the serialized format of a route tree as an array of node metadata objects.
 * Each entry in the array corresponds to a specific node's metadata within the route tree.
 */
type SerializableRouteTreeNode = ReadonlyArray<RouteTreeNodeMetadata>;
/**
 * Represents metadata for a route tree node, excluding the 'route' path segment.
 */
type RouteTreeNodeMetadataWithoutRoute = Omit<RouteTreeNodeMetadata, 'route'>;
/**
 * Describes metadata associated with a node in the route tree.
 * This metadata includes information such as the route path and optional redirect instructions.
 */
interface RouteTreeNodeMetadata {
    /**
     * Optional redirect path associated with this node.
     * This defines where to redirect if this route is matched.
     */
    redirectTo?: string;
    /**
     * The route path for this node.
     *
     * A "route" is a URL path or pattern that is used to navigate to different parts of a web application.
     * It is made up of one or more segments separated by slashes `/`. For instance, in the URL `/products/details/42`,
     * the full route is `/products/details/42`, with segments `products`, `details`, and `42`.
     *
     * Routes define how URLs map to views or components in an application. Each route segment contributes to
     * the overall path that determines which view or component is displayed.
     *
     * - **Static Routes**: These routes have fixed segments. For example, `/about` or `/contact`.
     * - **Parameterized Routes**: These include dynamic segments that act as placeholders, such as `/users/:id`,
     *   where `:id` could be any user ID.
     *
     * In the context of `RouteTreeNodeMetadata`, the `route` property represents the complete path that this node
     * in the route tree corresponds to. This path is used to determine how a specific URL in the browser maps to the
     * structure and content of the application.
     */
    route: string;
    /**
     * Optional status code to return for this route.
     */
    status?: number;
    /**
     * Optional additional headers to include in the response for this route.
     */
    headers?: Record<string, string>;
    /**
     * Specifies the rendering mode used for this route.
     */
    renderMode: RenderMode;
    /**
     * A list of resource that should be preloaded by the browser.
     */
    preload?: readonly string[];
}
/**
 * Represents a node within the route tree structure.
 * Each node corresponds to a route segment and may have associated metadata and child nodes.
 * The `AdditionalMetadata` type parameter allows for extending the node metadata with custom data.
 */
interface RouteTreeNode<AdditionalMetadata extends Record<string, unknown>> {
    /**
     * A map of child nodes, keyed by their corresponding route segment or wildcard.
     */
    children: Map<string, RouteTreeNode<AdditionalMetadata>>;
    /**
     * Optional metadata associated with this node, providing additional information such as redirects.
     */
    metadata?: RouteTreeNodeMetadata & AdditionalMetadata;
}
/**
 * A route tree implementation that supports efficient route matching, including support for wildcard routes.
 * This structure is useful for organizing and retrieving routes in a hierarchical manner,
 * enabling complex routing scenarios with nested paths.
 *
 * @typeParam AdditionalMetadata - Type of additional metadata that can be associated with route nodes.
 */
declare class RouteTree<AdditionalMetadata extends Record<string, unknown> = {}> {
    /**
     * The root node of the route tree.
     * All routes are stored and accessed relative to this root node.
     */
    private readonly root;
    /**
     * Inserts a new route into the route tree.
     * The route is broken down into segments, and each segment is added to the tree.
     * Parameterized segments (e.g., :id) are normalized to wildcards (*) for matching purposes.
     *
     * @param route - The route path to insert into the tree.
     * @param metadata - Metadata associated with the route, excluding the route path itself.
     */
    insert(route: string, metadata: RouteTreeNodeMetadataWithoutRoute & AdditionalMetadata): void;
    /**
     * Matches a given route against the route tree and returns the best matching route's metadata.
     * The best match is determined by the lowest insertion index, meaning the earliest defined route
     * takes precedence.
     *
     * @param route - The route path to match against the route tree.
     * @returns The metadata of the best matching route or `undefined` if no match is found.
     */
    match(route: string): (RouteTreeNodeMetadata & AdditionalMetadata) | undefined;
    /**
     * Converts the route tree into a serialized format representation.
     * This method converts the route tree into an array of metadata objects that describe the structure of the tree.
     * The array represents the routes in a nested manner where each entry includes the route and its associated metadata.
     *
     * @returns An array of `RouteTreeNodeMetadata` objects representing the route tree structure.
     *          Each object includes the `route` and associated metadata of a route.
     */
    toObject(): SerializableRouteTreeNode;
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
    static fromObject(value: SerializableRouteTreeNode): RouteTree;
    /**
     * A generator function that recursively traverses the route tree and yields the metadata of each node.
     * This allows for easy and efficient iteration over all nodes in the tree.
     *
     * @param node - The current node to start the traversal from. Defaults to the root node of the tree.
     */
    traverse(node?: RouteTreeNode<AdditionalMetadata>): Generator<RouteTreeNodeMetadata & AdditionalMetadata>;
    /**
     * Extracts the path segments from a given route string.
     *
     * @param route - The route string from which to extract segments.
     * @returns An array of path segments.
     */
    private getPathSegments;
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
    private traverseBySegments;
    /**
     * Creates an empty route tree node.
     * This helper function is used during the tree construction.
     *
     * @returns A new, empty route tree node.
     */
    private createEmptyRouteTreeNode;
}

/**
 * Represents the bootstrap mechanism for an Angular application.
 *
 * This type can either be:
 * - A reference to an Angular component or module (`Type<unknown>`) that serves as the root of the application.
 * - A function that returns a `Promise<ApplicationRef>`, which resolves with the root application reference.
 */
type AngularBootstrap = Type<unknown> | (() => Promise<ApplicationRef>);

/**
 * Represents a server asset stored in the manifest.
 */
interface ServerAsset {
    /**
     * Retrieves the text content of the asset.
     *
     * @returns A promise that resolves to the asset's content as a string.
     */
    text: () => Promise<string>;
    /**
     * A hash string representing the asset's content.
     */
    hash: string;
    /**
     * The size of the asset's content in bytes.
     */
    size: number;
}
/**
 * Represents the exports of an Angular server application entry point.
 */
interface EntryPointExports {
    /**
     * A reference to the function that creates an Angular server application instance.
     *
     * @remarks The return type is `unknown` to prevent circular dependency issues.
     */
    ɵgetOrCreateAngularServerApp: () => unknown;
    /**
     * A reference to the function that destroys the `AngularServerApp` instance.
     */
    ɵdestroyAngularServerApp: () => void;
}
/**
 * Manifest for the Angular server application engine, defining entry points.
 */
interface AngularAppEngineManifest {
    /**
     * A readonly record of entry points for the server application.
     * Each entry consists of:
     * - `key`: The url segment for the entry point.
     * - `value`: A function that returns a promise resolving to an object of type `EntryPointExports`.
     */
    readonly entryPoints: Readonly<Record<string, (() => Promise<EntryPointExports>) | undefined>>;
    /**
     * The base path for the server application.
     * This is used to determine the root path of the application.
     */
    readonly basePath: string;
    /**
     * A readonly record mapping supported locales to their respective entry-point paths.
     * Each entry consists of:
     * - `key`: The locale identifier (e.g., 'en', 'fr').
     * - `value`: The url segment associated with that locale.
     */
    readonly supportedLocales: Readonly<Record<string, string | undefined>>;
}
/**
 * Manifest for a specific Angular server application, defining assets and bootstrap logic.
 */
interface AngularAppManifest {
    /**
     * The base href for the application.
     * This is used to determine the root path of the application.
     */
    readonly baseHref: string;
    /**
     * A readonly record of assets required by the server application.
     * Each entry consists of:
     * - `key`: The path of the asset.
     * - `value`: An object of type `ServerAsset`.
     */
    readonly assets: Readonly<Record<string, ServerAsset | undefined>>;
    /**
     * The bootstrap mechanism for the server application.
     * A function that returns a promise that resolves to an `NgModule` or a function
     * returning a promise that resolves to an `ApplicationRef`.
     */
    readonly bootstrap: () => Promise<AngularBootstrap>;
    /**
     * Indicates whether critical CSS should be inlined into the HTML.
     * If set to `true`, critical CSS will be inlined for faster page rendering.
     */
    readonly inlineCriticalCss?: boolean;
    /**
     * The route tree representation for the routing configuration of the application.
     * This represents the routing information of the application, mapping route paths to their corresponding metadata.
     * It is used for route matching and navigation within the server application.
     */
    readonly routes?: SerializableRouteTreeNode;
    /**
     * An optional string representing the locale or language code to be used for
     * the application, aiding with localization and rendering content specific to the locale.
     */
    readonly locale?: string;
    /**
     * Maps entry-point names to their corresponding browser bundles and loading strategies.
     *
     * - **Key**: The entry-point name, typically the value of `ɵentryName`.
     * - **Value**: An array of objects, each representing a browser bundle with:
     *   - `path`: The filename or URL of the associated JavaScript bundle to preload.
     *   - `dynamicImport`: A boolean indicating whether the bundle is loaded via a dynamic `import()`.
     *     If `true`, the bundle is lazily loaded, impacting its preloading behavior.
     *
     * ### Example
     * ```ts
     * {
     *   'src/app/lazy/lazy.ts': [{ path: 'src/app/lazy/lazy.js', dynamicImport: true }]
     * }
     * ```
     */
    readonly entryPointToBrowserMapping?: Readonly<Record<string, ReadonlyArray<{
        path: string;
        dynamicImport: boolean;
    }> | undefined>>;
}
/**
 * Sets the Angular app manifest.
 *
 * @param manifest - The manifest object to set for the Angular application.
 */
declare function setAngularAppManifest(manifest: AngularAppManifest): void;
/**
 * Sets the Angular app engine manifest.
 *
 * @param manifest - The engine manifest object to set.
 */
declare function setAngularAppEngineManifest(manifest: AngularAppEngineManifest): void;

/**
 * Result of extracting routes from an Angular application.
 */
interface AngularRouterConfigResult {
    /**
     * The base URL for the application.
     * This is the base href that is used for resolving relative paths within the application.
     */
    baseHref: string;
    /**
     * An array of `RouteTreeNodeMetadata` objects representing the application's routes.
     *
     * Each `RouteTreeNodeMetadata` contains details about a specific route, such as its path and any
     * associated redirection targets. This array is asynchronously generated and
     * provides information on how routes are structured and resolved.
     */
    routes: RouteTreeNodeMetadata[];
    /**
     * Optional configuration for server routes.
     *
     * This property allows you to specify an array of server routes for configuration.
     * If not provided, the default configuration or behavior will be used.
     */
    serverRoutesConfig?: ServerRoute[] | null;
    /**
     * A list of errors encountered during the route extraction process.
     */
    errors: string[];
    /**
     * The specified route for the app-shell, if configured.
     */
    appShellRoute?: string;
}
type EntryPointToBrowserMapping = AngularAppManifest['entryPointToBrowserMapping'];
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
declare function getRoutesFromAngularRouterConfig(bootstrap: AngularBootstrap, document: string, url: URL, invokeGetPrerenderParams?: boolean, includePrerenderFallbackRoutes?: boolean, entryPointToBrowserMapping?: EntryPointToBrowserMapping | undefined): Promise<AngularRouterConfigResult>;
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
declare function extractRoutesAndCreateRouteTree(options: {
    url: URL;
    manifest?: AngularAppManifest;
    invokeGetPrerenderParams?: boolean;
    includePrerenderFallbackRoutes?: boolean;
    signal?: AbortSignal;
}): Promise<{
    routeTree: RouteTree;
    appShellRoute?: string;
    errors: string[];
}>;

/**
 * Defines a handler function type for transforming HTML content.
 * This function receives an object with the HTML to be processed.
 *
 * @param ctx - An object containing the URL and HTML content to be transformed.
 * @returns The transformed HTML as a string or a promise that resolves to the transformed HTML.
 */
type HtmlTransformHandler = (ctx: {
    url: URL;
    html: string;
}) => string | Promise<string>;
/**
 * Defines the names of available hooks for registering and triggering custom logic within the application.
 */
type HookName = keyof HooksMapping;
/**
 * Mapping of hook names to their corresponding handler types.
 */
interface HooksMapping {
    'html:transform:pre': HtmlTransformHandler;
}
/**
 * Manages a collection of hooks and provides methods to register and execute them.
 * Hooks are functions that can be invoked with specific arguments to allow modifications or enhancements.
 */
declare class Hooks {
    /**
     * A map of hook names to arrays of hook functions.
     * Each hook name can have multiple associated functions, which are executed in sequence.
     */
    private readonly store;
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
    on<Hook extends HookName>(name: Hook, handler: HooksMapping[Hook]): void;
    /**
     * Checks if there are any hooks registered under the specified name.
     *
     * @param name - The name of the hook to check.
     * @returns `true` if there are hooks registered under the specified name, otherwise `false`.
     */
    has(name: HookName): boolean;
}

/**
 * Options for configuring an `AngularServerApp`.
 */
interface AngularServerAppOptions {
    /**
     * Whether to allow rendering of prerendered routes.
     *
     * When enabled, prerendered routes will be served directly. When disabled, they will be
     * rendered on demand.
     *
     * Defaults to `false`.
     */
    allowStaticRouteRender?: boolean;
    /**
     *  Hooks for extending or modifying server behavior.
     *
     * This allows customization of the server's rendering process and other lifecycle events.
     *
     * If not provided, a new `Hooks` instance is created.
     */
    hooks?: Hooks;
}
/**
 * Represents a locale-specific Angular server application managed by the server application engine.
 *
 * The `AngularServerApp` class handles server-side rendering and asset management for a specific locale.
 */
declare class AngularServerApp {
    private readonly options;
    /**
     * Whether prerendered routes should be rendered on demand or served directly.
     *
     * @see {@link AngularServerAppOptions.allowStaticRouteRender} for more details.
     */
    private readonly allowStaticRouteRender;
    /**
     * Hooks for extending or modifying server behavior.
     *
     * @see {@link AngularServerAppOptions.hooks} for more details.
     */
    readonly hooks: Hooks;
    /**
     * Constructs an instance of `AngularServerApp`.
     *
     * @param options Optional configuration options for the server application.
     */
    constructor(options?: Readonly<AngularServerAppOptions>);
    /**
     * The manifest associated with this server application.
     */
    private readonly manifest;
    /**
     * An instance of ServerAsset that handles server-side asset.
     */
    private readonly assets;
    /**
     * The router instance used for route matching and handling.
     */
    private router;
    /**
     * The `inlineCriticalCssProcessor` is responsible for handling critical CSS inlining.
     */
    private inlineCriticalCssProcessor;
    /**
     * The bootstrap mechanism for the server application.
     */
    private boostrap;
    /**
     * Cache for storing critical CSS for pages.
     * Stores a maximum of MAX_INLINE_CSS_CACHE_ENTRIES entries.
     *
     * Uses an LRU (Least Recently Used) eviction policy, meaning that when the cache is full,
     * the least recently accessed page's critical CSS will be removed to make space for new entries.
     */
    private readonly criticalCssLRUCache;
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
    handle(request: Request, requestContext?: unknown): Promise<Response | null>;
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
    private handleServe;
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
    private handleRendering;
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
    private buildServerAssetPathFromRequest;
    /**
     * Runs the registered transform hooks on the given HTML content.
     *
     * @param html - The raw HTML content to be transformed.
     * @param url - The URL associated with the HTML content, used for context during transformations.
     * @param preload - An array of URLs representing the JavaScript resources to preload.
     * @returns A promise that resolves to the transformed HTML string.
     */
    private runTransformsOnHtml;
}
/**
 * Retrieves or creates an instance of `AngularServerApp`.
 * - If an instance of `AngularServerApp` already exists, it will return the existing one.
 * - If no instance exists, it will create a new one with the provided options.
 *
 * @param options Optional configuration options for the server application.
 *
 * @returns The existing or newly created instance of `AngularServerApp`.
 */
declare function getOrCreateAngularServerApp(options?: Readonly<AngularServerAppOptions>): AngularServerApp;
/**
 * Destroys the existing `AngularServerApp` instance, releasing associated resources and resetting the
 * reference to `undefined`.
 *
 * This function is primarily used to enable the recreation of the `AngularServerApp` instance,
 * typically when server configuration or application state needs to be refreshed.
 */
declare function destroyAngularServerApp(): void;

/** Partial representation of an `HTMLElement`. */
interface PartialHTMLElement {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    hasAttribute(name: string): boolean;
    removeAttribute(name: string): void;
    appendChild(child: PartialHTMLElement): void;
    insertBefore(newNode: PartialHTMLElement, referenceNode?: PartialHTMLElement): void;
    remove(): void;
    name: string;
    textContent: string;
    tagName: string | null;
    children: PartialHTMLElement[];
    next: PartialHTMLElement | null;
    prev: PartialHTMLElement | null;
}
/** Partial representation of an HTML `Document`. */
interface PartialDocument {
    head: PartialHTMLElement;
    createElement(tagName: string): PartialHTMLElement;
    querySelector(selector: string): PartialHTMLElement | null;
}
interface BeastiesBase {
    embedLinkedStylesheet(link: PartialHTMLElement, document: PartialDocument): Promise<unknown>;
}
declare class BeastiesBase extends Beasties {
}
declare class InlineCriticalCssProcessor extends BeastiesBase {
    readFile: (path: string) => Promise<string>;
    readonly outputPath?: string | undefined;
    private addedCspScriptsDocuments;
    private documentNonces;
    constructor(readFile: (path: string) => Promise<string>, outputPath?: string | undefined);
    /**
     * Override of the Beasties `embedLinkedStylesheet` method
     * that makes it work with Angular's CSP APIs.
     */
    embedLinkedStylesheet(link: PartialHTMLElement, document: PartialDocument): Promise<unknown>;
    /**
     * Finds the CSP nonce for a specific document.
     */
    private findCspNonce;
    /**
     * Inserts the `script` tag that swaps the critical CSS at runtime,
     * if one hasn't been inserted into the document already.
     */
    private conditionallyInsertCspLoadingScript;
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
declare class AngularAppEngine {
    /**
     * A flag to enable or disable the rendering of prerendered routes.
     *
     * Typically used during development to avoid prerendering all routes ahead of time,
     * allowing them to be rendered on the fly as requested.
     *
     * @private
     */
    static ɵallowStaticRouteRender: boolean;
    /**
     * Hooks for extending or modifying the behavior of the server application.
     * These hooks are used by the Angular CLI when running the development server and
     * provide extensibility points for the application lifecycle.
     *
     * @private
     */
    static ɵhooks: Hooks;
    /**
     * The manifest for the server application.
     */
    private readonly manifest;
    /**
     * A map of supported locales from the server application's manifest.
     */
    private readonly supportedLocales;
    /**
     * A cache that holds entry points, keyed by their potential locale string.
     */
    private readonly entryPointsCache;
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
    handle(request: Request, requestContext?: unknown): Promise<Response | null>;
    /**
     * Handles requests for the base path when i18n is enabled.
     * Redirects the user to a locale-specific path based on the `Accept-Language` header.
     *
     * @param request The incoming request.
     * @returns A `Response` object with a 302 redirect, or `null` if i18n is not enabled
     *          or the request is not for the base path.
     */
    private redirectBasedOnAcceptLanguage;
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
    private getAngularServerAppForRequest;
    /**
     * Retrieves the exports for a specific entry point, caching the result.
     *
     * @param potentialLocale - The locale string used to find the corresponding entry point.
     * @returns A promise that resolves to the entry point exports or `undefined` if not found.
     */
    private getEntryPointExports;
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
    private getEntryPointExportsForUrl;
}

/**
 * Function for handling HTTP requests in a web environment.
 *
 * @param request - The incoming HTTP request object.
 * @returns A Promise resolving to a `Response` object, `null`, or directly a `Response`,
 * supporting both synchronous and asynchronous handling.
 * @developerPreview
 */
type RequestHandlerFunction = (request: Request) => Promise<Response | null> | null | Response;
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
declare function createRequestHandler(handler: RequestHandlerFunction): RequestHandlerFunction;

export { AngularAppEngine, PrerenderFallback, RenderMode, createRequestHandler, provideServerRoutesConfig, provideServerRouting, withAppShell, InlineCriticalCssProcessor as ɵInlineCriticalCssProcessor, destroyAngularServerApp as ɵdestroyAngularServerApp, extractRoutesAndCreateRouteTree as ɵextractRoutesAndCreateRouteTree, getOrCreateAngularServerApp as ɵgetOrCreateAngularServerApp, getRoutesFromAngularRouterConfig as ɵgetRoutesFromAngularRouterConfig, setAngularAppEngineManifest as ɵsetAngularAppEngineManifest, setAngularAppManifest as ɵsetAngularAppManifest };
export type { RequestHandlerFunction, ServerRoute, ServerRouteClient, ServerRouteCommon, ServerRoutePrerender, ServerRoutePrerenderWithParams, ServerRouteServer, ServerRoutesConfigOptions };
