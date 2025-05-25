import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ViewEncapsulation,
} from "@angular/core";
import { CommonModule, DatePipe, isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { PostService } from "../../../core/services/post.service";
import { PostDetail } from "../../../shared/models/post-detail.model";
import { Title, Meta } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import hljs from "highlight.js";

@Component({
  selector: "app-blog-detail",
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
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

    <article *ngIf="!isLoading && post" class="max-w-3xl mx-auto">
      <!-- Botón de volver -->
      <div class="mb-8">
        <a
          routerLink="/blog"
          class="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver a todos los artículos
        </a>
      </div>

      <!-- Cabecera del post -->
      <header class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ post.title }}</h1>

        <div
          class="flex flex-wrap items-center text-gray-600 dark:text-gray-400 mb-4"
        >
          <span>{{ post.date | date : "dd MMMM, yyyy" }}</span>
          <span class="mx-2">•</span>
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let tag of post.tags"
              class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <p class="text-xl text-gray-600 dark:text-gray-400">
          {{ post.description }}
        </p>
      </header>

      <!-- Contenido del post -->
      <div class="post-content" [innerHTML]="post.content"></div>
    </article>
  `,
  styles: [],
  //  encapsulation: ViewEncapsulation.None,
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  post: PostDetail | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get("slug");
      if (slug) {
        this.loadPost(slug);
      } else {
        this.router.navigate(["/blog"]);
      }
    });
  }

  private loadPost(slug: string): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getPostBySlug(slug).subscribe({
      next: (response) => {
        this.post = response.data;
        this.isLoading = false;

        // Actualizar el título de la página y los metadatos
        this.updateMetadata();

        // Aplicar highlight.js a los bloques de código después de que el contenido se haya renderizado
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            // @ts-ignore: El objeto hljs está disponible globalmente después de importar highlight.js
            document.querySelectorAll("pre code").forEach((block) => {
              hljs.highlightElement(block as HTMLElement);
            });
          }, 0);
        }
      },
      error: (err) => {
        console.error("Error al cargar el post:", err);
        if (err.status === 404) {
          this.error = "El artículo que buscas no existe.";
        } else {
          this.error =
            "No se pudo cargar el artículo. Por favor, intenta de nuevo más tarde.";
        }
        this.isLoading = false;
      },
    });
  }

  private updateMetadata(): void {
    if (this.post) {
      // Actualizar el título de la página
      this.titleService.setTitle(
        `${this.post.title} | Blog para Desarrolladores`
      );

      // Actualizar los metadatos para SEO
      this.metaService.updateTag({
        name: "description",
        content: this.post.description,
      });

      // Metadatos para compartir en redes sociales (Open Graph)
      this.metaService.updateTag({
        property: "og:title",
        content: this.post.title,
      });
      this.metaService.updateTag({
        property: "og:description",
        content: this.post.description,
      });
      this.metaService.updateTag({ property: "og:type", content: "article" });

      // Metadatos para Twitter
      this.metaService.updateTag({ name: "twitter:card", content: "summary" });
      this.metaService.updateTag({
        name: "twitter:title",
        content: this.post.title,
      });
      this.metaService.updateTag({
        name: "twitter:description",
        content: this.post.description,
      });
    }
  }
}
