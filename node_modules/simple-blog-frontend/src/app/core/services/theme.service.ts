import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private darkModeKey = "darkMode";
  private darkThemeClass = "dark";

  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  /**
   * Inicializa el tema basado en las preferencias guardadas o las preferencias del sistema
   */
  initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Verificar si hay una preferencia guardada
      const savedTheme = localStorage.getItem(this.darkModeKey);

      if (savedTheme !== null) {
        // Usar la preferencia guardada
        this.setTheme(savedTheme === "true");
      } else {
        // Usar la preferencia del sistema
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        this.setTheme(prefersDark);
      }
    }
  }

  /**
   * Cambia el tema actual
   */
  toggleTheme(): void {
    const isDark = !this.isDarkThemeSubject.value;
    this.setTheme(isDark);
  }

  /**
   * Establece el tema específico
   * @param isDark Si es verdadero, establece el tema oscuro; de lo contrario, establece el tema claro
   */
  private setTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      // Actualizar el estado
      this.isDarkThemeSubject.next(isDark);

      // Guardar la preferencia
      localStorage.setItem(this.darkModeKey, String(isDark));

      // Aplicar la clase al elemento HTML
      if (isDark) {
        document.documentElement.classList.add(this.darkThemeClass);
      } else {
        document.documentElement.classList.remove(this.darkThemeClass);
      }
    }
  }
}
