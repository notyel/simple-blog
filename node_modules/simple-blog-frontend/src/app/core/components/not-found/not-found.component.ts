import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <h1
        class="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4"
      >
        404
      </h1>
      <h2 class="text-2xl font-semibold mb-6">Página no encontrada</h2>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <a
        routerLink="/"
        class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        Volver al inicio
      </a>
    </div>
  `,
  styles: [],
})
export class NotFoundComponent {}
