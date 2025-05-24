import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
// Optional: Import a PageNotFoundComponent if you have one
// import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/blog', pathMatch: 'full' },
  { path: 'blog', component: PostListComponent, title: 'My Angular Blog - Posts' },
  { path: 'blog/:slug', component: PostDetailComponent }, // Title will be set dynamically by PostDetailComponent
  // Example for a 404 page:
  // { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' }
];
