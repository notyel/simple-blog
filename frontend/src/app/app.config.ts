import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Assuming you will have routes defined in app.routes.ts
// If app.routes.ts doesn't exist or is empty, provideRouter([]) is fine for now.
// import { appRoutes } from './app.routes'; // You might need to create app.routes.ts

export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter(appRoutes), // Uncomment or update if you have routes
    provideRouter([]), // Provide empty routes for now if app.routes.ts is not set up
    provideClientHydration(),
    provideHttpClient(withFetch()) // Configure HttpClient to use fetch
  ]
};
