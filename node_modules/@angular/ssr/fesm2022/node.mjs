import { renderApplication, renderModule, ɵSERVER_CONTEXT as _SERVER_CONTEXT } from '@angular/platform-server';
import * as fs from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { URL as URL$1, fileURLToPath } from 'node:url';
import { ɵInlineCriticalCssProcessor as _InlineCriticalCssProcessor, AngularAppEngine } from '@angular/ssr';
import { readFile } from 'node:fs/promises';
import { argv } from 'node:process';

class CommonEngineInlineCriticalCssProcessor {
    resourceCache = new Map();
    async process(html, outputPath) {
        const beasties = new _InlineCriticalCssProcessor(async (path) => {
            let resourceContent = this.resourceCache.get(path);
            if (resourceContent === undefined) {
                resourceContent = await readFile(path, 'utf-8');
                this.resourceCache.set(path, resourceContent);
            }
            return resourceContent;
        }, outputPath);
        return beasties.process(html);
    }
}

const PERFORMANCE_MARK_PREFIX = '🅰️';
function printPerformanceLogs() {
    let maxWordLength = 0;
    const benchmarks = [];
    for (const { name, duration } of performance.getEntriesByType('measure')) {
        if (!name.startsWith(PERFORMANCE_MARK_PREFIX)) {
            continue;
        }
        // `🅰️:Retrieve SSG Page` -> `Retrieve SSG Page:`
        const step = name.slice(PERFORMANCE_MARK_PREFIX.length + 1) + ':';
        if (step.length > maxWordLength) {
            maxWordLength = step.length;
        }
        benchmarks.push([step, `${duration.toFixed(1)}ms`]);
        performance.clearMeasures(name);
    }
    /* eslint-disable no-console */
    console.log('********** Performance results **********');
    for (const [step, value] of benchmarks) {
        const spaces = maxWordLength - step.length + 5;
        console.log(step + ' '.repeat(spaces) + value);
    }
    console.log('*****************************************');
    /* eslint-enable no-console */
}
async function runMethodAndMeasurePerf(label, asyncMethod) {
    const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
    const startLabel = `start:${labelName}`;
    const endLabel = `end:${labelName}`;
    try {
        performance.mark(startLabel);
        return await asyncMethod();
    }
    finally {
        performance.mark(endLabel);
        performance.measure(labelName, startLabel, endLabel);
        performance.clearMarks(startLabel);
        performance.clearMarks(endLabel);
    }
}
function noopRunMethodAndMeasurePerf(label, asyncMethod) {
    return asyncMethod();
}

const SSG_MARKER_REGEXP = /ng-server-context=["']\w*\|?ssg\|?\w*["']/;
/**
 * A common engine to use to server render an application.
 */
class CommonEngine {
    options;
    templateCache = new Map();
    inlineCriticalCssProcessor = new CommonEngineInlineCriticalCssProcessor();
    pageIsSSG = new Map();
    constructor(options) {
        this.options = options;
    }
    /**
     * Render an HTML document for a specific URL with specified
     * render options
     */
    async render(opts) {
        const enablePerformanceProfiler = this.options?.enablePerformanceProfiler;
        const runMethod = enablePerformanceProfiler
            ? runMethodAndMeasurePerf
            : noopRunMethodAndMeasurePerf;
        let html = await runMethod('Retrieve SSG Page', () => this.retrieveSSGPage(opts));
        if (html === undefined) {
            html = await runMethod('Render Page', () => this.renderApplication(opts));
            if (opts.inlineCriticalCss !== false) {
                const content = await runMethod('Inline Critical CSS', () => 
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.inlineCriticalCss(html, opts));
                html = content;
            }
        }
        if (enablePerformanceProfiler) {
            printPerformanceLogs();
        }
        return html;
    }
    inlineCriticalCss(html, opts) {
        const outputPath = opts.publicPath ?? (opts.documentFilePath ? dirname(opts.documentFilePath) : '');
        return this.inlineCriticalCssProcessor.process(html, outputPath);
    }
    async retrieveSSGPage(opts) {
        const { publicPath, documentFilePath, url } = opts;
        if (!publicPath || !documentFilePath || url === undefined) {
            return undefined;
        }
        const { pathname } = new URL$1(url, 'resolve://');
        // Do not use `resolve` here as otherwise it can lead to path traversal vulnerability.
        // See: https://portswigger.net/web-security/file-path-traversal
        const pagePath = join(publicPath, pathname, 'index.html');
        if (this.pageIsSSG.get(pagePath)) {
            // Serve pre-rendered page.
            return fs.promises.readFile(pagePath, 'utf-8');
        }
        if (!pagePath.startsWith(normalize(publicPath))) {
            // Potential path traversal detected.
            return undefined;
        }
        if (pagePath === resolve(documentFilePath) || !(await exists(pagePath))) {
            // View matches with prerender path or file does not exist.
            this.pageIsSSG.set(pagePath, false);
            return undefined;
        }
        // Static file exists.
        const content = await fs.promises.readFile(pagePath, 'utf-8');
        const isSSG = SSG_MARKER_REGEXP.test(content);
        this.pageIsSSG.set(pagePath, isSSG);
        return isSSG ? content : undefined;
    }
    async renderApplication(opts) {
        const moduleOrFactory = this.options?.bootstrap ?? opts.bootstrap;
        if (!moduleOrFactory) {
            throw new Error('A module or bootstrap option must be provided.');
        }
        const extraProviders = [
            { provide: _SERVER_CONTEXT, useValue: 'ssr' },
            ...(opts.providers ?? []),
            ...(this.options?.providers ?? []),
        ];
        let document = opts.document;
        if (!document && opts.documentFilePath) {
            document = await this.getDocument(opts.documentFilePath);
        }
        const commonRenderingOptions = {
            url: opts.url,
            document,
        };
        return isBootstrapFn(moduleOrFactory)
            ? renderApplication(moduleOrFactory, {
                platformProviders: extraProviders,
                ...commonRenderingOptions,
            })
            : renderModule(moduleOrFactory, { extraProviders, ...commonRenderingOptions });
    }
    /** Retrieve the document from the cache or the filesystem */
    async getDocument(filePath) {
        let doc = this.templateCache.get(filePath);
        if (!doc) {
            doc = await fs.promises.readFile(filePath, 'utf-8');
            this.templateCache.set(filePath, doc);
        }
        return doc;
    }
}
async function exists(path) {
    try {
        await fs.promises.access(path, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
function isBootstrapFn(value) {
    // We can differentiate between a module and a bootstrap function by reading compiler-generated `ɵmod` static property:
    return typeof value === 'function' && !('ɵmod' in value);
}

/**
 * A set containing all the pseudo-headers defined in the HTTP/2 specification.
 *
 * This set can be used to filter out pseudo-headers from a list of headers,
 * as they are not allowed to be set directly using the `Node.js` Undici API or
 * the web `Headers` API.
 */
const HTTP2_PSEUDO_HEADERS = new Set([':method', ':scheme', ':authority', ':path', ':status']);
/**
 * Converts a Node.js `IncomingMessage` or `Http2ServerRequest` into a
 * Web Standard `Request` object.
 *
 * This function adapts the Node.js request objects to a format that can
 * be used by web platform APIs.
 *
 * @param nodeRequest - The Node.js request object (`IncomingMessage` or `Http2ServerRequest`) to convert.
 * @returns A Web Standard `Request` object.
 * @developerPreview
 */
function createWebRequestFromNodeRequest(nodeRequest) {
    const { headers, method = 'GET' } = nodeRequest;
    const withBody = method !== 'GET' && method !== 'HEAD';
    return new Request(createRequestUrl(nodeRequest), {
        method,
        headers: createRequestHeaders(headers),
        body: withBody ? nodeRequest : undefined,
        duplex: withBody ? 'half' : undefined,
    });
}
/**
 * Creates a `Headers` object from Node.js `IncomingHttpHeaders`.
 *
 * @param nodeHeaders - The Node.js `IncomingHttpHeaders` object to convert.
 * @returns A `Headers` object containing the converted headers.
 */
function createRequestHeaders(nodeHeaders) {
    const headers = new Headers();
    for (const [name, value] of Object.entries(nodeHeaders)) {
        if (HTTP2_PSEUDO_HEADERS.has(name)) {
            continue;
        }
        if (typeof value === 'string') {
            headers.append(name, value);
        }
        else if (Array.isArray(value)) {
            for (const item of value) {
                headers.append(name, item);
            }
        }
    }
    return headers;
}
/**
 * Creates a `URL` object from a Node.js `IncomingMessage`, taking into account the protocol, host, and port.
 *
 * @param nodeRequest - The Node.js `IncomingMessage` or `Http2ServerRequest` object to extract URL information from.
 * @returns A `URL` object representing the request URL.
 */
function createRequestUrl(nodeRequest) {
    const { headers, socket, url = '', originalUrl, } = nodeRequest;
    const protocol = getFirstHeaderValue(headers['x-forwarded-proto']) ??
        ('encrypted' in socket && socket.encrypted ? 'https' : 'http');
    const hostname = getFirstHeaderValue(headers['x-forwarded-host']) ?? headers.host ?? headers[':authority'];
    if (Array.isArray(hostname)) {
        throw new Error('host value cannot be an array.');
    }
    let hostnameWithPort = hostname;
    if (!hostname?.includes(':')) {
        const port = getFirstHeaderValue(headers['x-forwarded-port']);
        if (port) {
            hostnameWithPort += `:${port}`;
        }
    }
    return new URL(originalUrl ?? url, `${protocol}://${hostnameWithPort}`);
}
/**
 * Extracts the first value from a multi-value header string.
 *
 * @param value - A string or an array of strings representing the header values.
 *                           If it's a string, values are expected to be comma-separated.
 * @returns The first trimmed value from the multi-value header, or `undefined` if the input is invalid or empty.
 *
 * @example
 * ```typescript
 * getFirstHeaderValue("value1, value2, value3"); // "value1"
 * getFirstHeaderValue(["value1", "value2"]); // "value1"
 * getFirstHeaderValue(undefined); // undefined
 * ```
 */
function getFirstHeaderValue(value) {
    return value?.toString().split(',', 1)[0]?.trim();
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
class AngularNodeAppEngine {
    angularAppEngine = new AngularAppEngine();
    /**
     * Handles an incoming HTTP request by serving prerendered content, performing server-side rendering,
     * or delivering a static file for client-side rendered routes based on the `RenderMode` setting.
     *
     * This method adapts Node.js's `IncomingMessage` or `Http2ServerRequest`
     * to a format compatible with the `AngularAppEngine` and delegates the handling logic to it.
     *
     * @param request - The incoming HTTP request (`IncomingMessage` or `Http2ServerRequest`).
     * @param requestContext - Optional context for rendering, such as metadata associated with the request.
     * @returns A promise that resolves to the resulting HTTP response object, or `null` if no matching Angular route is found.
     *
     * @remarks A request to `https://www.example.com/page/index.html` will serve or render the Angular route
     * corresponding to `https://www.example.com/page`.
     */
    async handle(request, requestContext) {
        const webRequest = createWebRequestFromNodeRequest(request);
        return this.angularAppEngine.handle(webRequest, requestContext);
    }
}

/**
 * Attaches metadata to the handler function to mark it as a special handler for Node.js environments.
 *
 * @typeParam T - The type of the handler function.
 * @param handler - The handler function to be defined and annotated.
 * @returns The same handler function passed as an argument, with metadata attached.
 *
 * @example
 * Usage in an Express application:
 * ```ts
 * const app = express();
 * export default createNodeRequestHandler(app);
 * ```
 *
 * @example
 * Usage in a Hono application:
 * ```ts
 * const app = new Hono();
 * export default createNodeRequestHandler(async (req, res, next) => {
 *   try {
 *     const webRes = await app.fetch(createWebRequestFromNodeRequest(req));
 *     if (webRes) {
 *       await writeResponseToNodeResponse(webRes, res);
 *     } else {
 *       next();
 *     }
 *   } catch (error) {
 *     next(error);
 *   }
 * }));
 * ```
 *
 * @example
 * Usage in a Fastify application:
 * ```ts
 * const app = Fastify();
 * export default createNodeRequestHandler(async (req, res) => {
 *   await app.ready();
 *   app.server.emit('request', req, res);
 *   res.send('Hello from Fastify with Node Next Handler!');
 * }));
 * ```
 * @developerPreview
 */
function createNodeRequestHandler(handler) {
    handler['__ng_node_request_handler__'] = true;
    return handler;
}

/**
 * Streams a web-standard `Response` into a Node.js `ServerResponse`
 * or `Http2ServerResponse`.
 *
 * This function adapts the web `Response` object to write its content
 * to a Node.js response object, handling both HTTP/1.1 and HTTP/2.
 *
 * @param source - The web-standard `Response` object to stream from.
 * @param destination - The Node.js response object (`ServerResponse` or `Http2ServerResponse`) to stream into.
 * @returns A promise that resolves once the streaming operation is complete.
 * @developerPreview
 */
async function writeResponseToNodeResponse(source, destination) {
    const { status, headers, body } = source;
    destination.statusCode = status;
    let cookieHeaderSet = false;
    for (const [name, value] of headers.entries()) {
        if (name === 'set-cookie') {
            if (cookieHeaderSet) {
                continue;
            }
            // Sets the 'set-cookie' header only once to ensure it is correctly applied.
            // Concatenating 'set-cookie' values can lead to incorrect behavior, so we use a single value from `headers.getSetCookie()`.
            destination.setHeader(name, headers.getSetCookie());
            cookieHeaderSet = true;
        }
        else {
            destination.setHeader(name, value);
        }
    }
    if (!body) {
        destination.end();
        return;
    }
    try {
        const reader = body.getReader();
        destination.on('close', () => {
            reader.cancel().catch((error) => {
                // eslint-disable-next-line no-console
                console.error(`An error occurred while writing the response body for: ${destination.req.url}.`, error);
            });
        });
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                destination.end();
                break;
            }
            const canContinue = destination.write(value);
            if (canContinue === false) {
                // Explicitly check for `false`, as AWS may return `undefined` even though this is not valid.
                // See: https://github.com/CodeGenieApp/serverless-express/issues/683
                await new Promise((resolve) => destination.once('drain', resolve));
            }
        }
    }
    catch {
        destination.end('Internal server error.');
    }
}

/**
 * Determines whether the provided URL represents the main entry point module.
 *
 * This function checks if the provided URL corresponds to the main ESM module being executed directly.
 * It's useful for conditionally executing code that should only run when a module is the entry point,
 * such as starting a server or initializing an application.
 *
 * It performs two key checks:
 * 1. Verifies if the URL starts with 'file:', ensuring it is a local file.
 * 2. Compares the URL's resolved file path with the first command-line argument (`process.argv[1]`),
 *    which points to the file being executed.
 *
 * @param url The URL of the module to check. This should typically be `import.meta.url`.
 * @returns `true` if the provided URL represents the main entry point, otherwise `false`.
 * @developerPreview
 */
function isMainModule(url) {
    return url.startsWith('file:') && argv[1] === fileURLToPath(url);
}

export { AngularNodeAppEngine, CommonEngine, createNodeRequestHandler, createWebRequestFromNodeRequest, isMainModule, writeResponseToNodeResponse };
//# sourceMappingURL=node.mjs.map
