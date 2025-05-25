import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
    title: "Blog para Desarrolladores",
  },
  {
    path: "blog",
    loadChildren: () =>
      import("./features/blog/blog.routes").then((m) => m.BLOG_ROUTES),
  },
  {
    path: "**",
    loadComponent: () =>
      import("./core/components/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
    title: "Página no encontrada",
  },
];
