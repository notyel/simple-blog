import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PostService } from "../../core/services/post.service";
import { Post } from "../../shared/models/post.model";
import { PostCardComponent } from "../../shared/components/post-card/post-card.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent],
  template: `
    <section class="py-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Blog para Desarrolladores</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Artículos, tutoriales y recursos sobre desarrollo web, programación y
          tecnología.
        </p>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"
        ></div>
      </div>

      <div
        *ngIf="error"
        class="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-8"
      >
        {{ error }}
      </div>

      <div
        *ngIf="!isLoading && !error && posts.length === 0"
        class="text-center py-12"
      >
        <p class="text-gray-600 dark:text-gray-400">
          No hay posts disponibles en este momento.
        </p>
      </div>

      <div
        *ngIf="!isLoading && posts.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <app-post-card *ngFor="let post of posts" [post]="post"></app-post-card>
      </div>

      <div *ngIf="!isLoading && posts.length > 0" class="mt-12 text-center">
        <a
          routerLink="/blog"
          class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-block"
        >
          Ver todos los artículos
        </a>
      </div>
    </section>
  `,
  styles: [],
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);

  posts: Post[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getAllPosts().subscribe({
      next: (response) => {
        this.posts = response.data.slice(0, 6); // Mostrar solo los 6 posts más recientes en la página de inicio
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar los posts:", err);
        this.error =
          "No se pudieron cargar los posts. Por favor, intenta de nuevo más tarde.";
        this.isLoading = false;
      },
    });
  }
}
