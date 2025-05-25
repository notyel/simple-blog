import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PostService } from "../../../core/services/post.service";
import { Post } from "../../../shared/models/post.model";
import { PostCardComponent } from "../../../shared/components/post-card/post-card.component";

@Component({
  selector: "app-blog-list",
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <section>
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Todos los artículos</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explora todos nuestros artículos sobre desarrollo, programación y
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
    </section>
  `,
  styles: [],
})
export class BlogListComponent implements OnInit {
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
        this.posts = response.data;
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
