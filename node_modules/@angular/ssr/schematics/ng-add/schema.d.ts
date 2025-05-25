/**
 * Adds Server-Side Rendering (SSR) capabilities to an existing Angular application. SSR
 * allows your app to be rendered on the server, leading to faster initial load times and
 * improved SEO. This schematic modifies your project to enable SSR, sets up the necessary
 * configurations, and installs the required dependencies.
 */
export type Schema = {
    /**
     * The name of the project you want to enable SSR for. If not specified, the CLI will
     * determine the project from the current directory.
     */
    project: string;
    /**
     * Configure the server application to use the Angular Server Routing API and App Engine
     * APIs (currently in Developer Preview).
     */
    serverRouting?: boolean;
    /**
     * Skip the automatic installation of packages. You will need to manually install the
     * dependencies later.
     */
    skipInstall?: boolean;
};
