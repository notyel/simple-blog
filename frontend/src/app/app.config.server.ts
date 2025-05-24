import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config'; // Assumes app.config.ts is in the same directory

// The server-specific application configuration.
// It merges the base application configuration (appConfig) with server-specific providers.
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(), // Sets up basic server-side rendering.
    // If provideServerTransferState() was here for posts, it would be removed.
    // If it was here for other critical reasons, it would remain.
    // For this task, since we are ensuring no post-related TransferState,
    // we will not add provideServerTransferState() here.
  ]
};

// Merge the base appConfig with the serverConfig.
export const config = mergeApplicationConfig(appConfig, serverConfig);
