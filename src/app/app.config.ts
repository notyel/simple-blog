import {
  ApplicationConfig,
  provideZoneChangeDetection,
  TransferState,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
} from '@angular/router'; // Added withComponentInputBinding & withEnabledBlockingInitialNavigation
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Added for HttpClient

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(), // Enables binding route data to component inputs
      withEnabledBlockingInitialNavigation() // Recommended for SSR to ensure resolvers complete before initial render
    ),
    provideClientHydration(withEventReplay()), // Configures client-side hydration with event replay
    provideHttpClient(withFetch()), // Configures HttpClient to use fetch APIs
    TransferState,
  ],
};
