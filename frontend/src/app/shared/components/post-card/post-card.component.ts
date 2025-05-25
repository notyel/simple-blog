import { Component, Input } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Post } from "../../models/post.model";

@Component({
  selector: "app-post-card",
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <article class="post-card h-full flex flex-col">
      <div class="p-6 flex-grow">
        <div class="flex items-center mb-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ post.date | date : "dd MMM, yyyy" }}
          </span>
          <span class="mx-2 text-gray-300 dark:text-gray-700">•</span>
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let tag of post.tags"
              class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <h2
          class="text-xl font-bold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <a [routerLink]="['/blog', post.slug]">{{ post.title }}</a>
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ post.description }}
        </p>
      </div>

      <div class="px-6 pb-6 mt-auto">
        <a
          [routerLink]="['/blog', post.slug]"
          class="text-primary-600 dark:text-primary-400 font-medium hover:underline inline-flex items-center"
        >
          Leer más
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>
    </article>
  `,
  styles: [],
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
}
