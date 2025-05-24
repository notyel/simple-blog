import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Make sure this path is correct for your project structure.
// This path should point to the compiled server-side Angular application module.
// For Angular CLI projects, this is typically 'src/main.server.ts' (source)
// which compiles to an output like 'dist/project-name/server/main.js'.
// The import path here is relative to the compiled server.ts location.
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  // Determine server and browser distribution folders.
  // serverDistFolder is the directory where this server.ts file (after compilation) is located.
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  
  // browserDistFolder points to the directory containing the client-side application bundles.
  // This path assumes server.ts (compiled) is in 'dist/frontend/server/'
  // and client assets are in 'dist/frontend/browser/'.
  // Adjust if your angular.json outputPaths are different.
  // outputPath in angular.json is "dist/blog-app".
  // So, if server.ts is in frontend/, after build it might be frontend/dist/blog-app/server/server.js
  // And browser files in frontend/dist/blog-app/browser/
  const browserDistFolder = resolve(serverDistFolder, '../browser'); 
  
  const indexHtml = existsSync(join(browserDistFolder, 'index.original.html'))
    ? join(browserDistFolder, 'index.original.html') // For projects using client hydration
    : join(browserDistFolder, 'index.html'); // Standard index.html

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints (if any).
  // server.get('/api/**', (req, res) => { /* ... */ });

  // Serve static files from /browser.
  // All requests for files with extensions (e.g., .js, .css, .png) are served from browserDistFolder.
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y' // Cache static assets for 1 year.
  }));

  // All regular routes use the Angular engine.
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap, // The bootstrap function from main.server.ts
        documentFilePath: indexHtml, // Path to the index.html file
        url: `${protocol}://${headers.host}${originalUrl}`, // Full URL of the request
        publicPath: browserDistFolder, // Base path for browser assets
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl }, // Provide APP_BASE_HREF for routing
          // Add any other request-specific providers here.
        ],
      })
      .then((html) => res.send(html)) // Send the rendered HTML to the client.
      .catch((err) => next(err)); // Pass errors to the next error handler.
  });

  return server;
}

function run(): void {
  // Use the PORT environment variable if set, otherwise default to 4200.
  const port = process.env['PORT'] || 4200;

  // Start up the Node server.
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// This check ensures that the server is started only when the script is executed directly,
// and not when imported as a module (e.g., by a test runner or a serverless function).
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}
