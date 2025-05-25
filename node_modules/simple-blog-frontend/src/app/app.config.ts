import { ApplicationConfig, isDevMode } from "@angular/core";
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from "@angular/router";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideClientHydration } from "@angular/platform-browser";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideClientHydration(),
  ],
};
