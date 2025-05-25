import { Routes } from "@angular/router";

export const BLOG_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./blog-list/blog-list.component").then(
        (m) => m.BlogListComponent
      ),
    title: "Blog - Todos los artículos",
  },
  {
    path: ":slug",
    loadComponent: () =>
      import("./blog-detail/blog-detail.component").then(
        (m) => m.BlogDetailComponent
      ),
    title: "Blog - Artículo",
  },
];
