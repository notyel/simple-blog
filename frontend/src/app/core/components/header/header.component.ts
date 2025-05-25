import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div
        class="container mx-auto px-4 py-4 flex justify-between items-center"
      >
        <div>
          <a
            routerLink="/"
            class="text-2xl font-bold text-primary-600 dark:text-primary-400"
            >DevBlog</a
          >
        </div>

        <nav class="flex items-center space-x-6">
          <a
            routerLink="/"
            routerLinkActive="text-primary-600 dark:text-primary-400"
            [routerLinkActiveOptions]="{ exact: true }"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Inicio
          </a>
          <a
            routerLink="/blog"
            routerLinkActive="text-primary-600 dark:text-primary-400"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Blog
          </a>

          <!-- Botón de cambio de tema -->
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Cambiar tema"
          >
            <svg
              *ngIf="isDarkTheme$ | async; else lightIcon"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <ng-template #lightIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </ng-template>
          </button>
        </nav>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  isDarkTheme$ = this.themeService.isDarkTheme$;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
