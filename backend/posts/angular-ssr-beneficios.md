---
title: "Beneficios de Server-Side Rendering (SSR) en Angular"
date: "2023-05-15"
description: "Descubre por qué implementar SSR en tus aplicaciones Angular puede mejorar el rendimiento y la experiencia de usuario"
toc: true
tags:
  - angular
  - ssr
  - rendimiento
---

# Beneficios de Server-Side Rendering (SSR) en Angular

El Server-Side Rendering (SSR) se ha convertido en una técnica esencial para mejorar el rendimiento y la experiencia de usuario en aplicaciones web modernas. Angular ofrece soporte para SSR a través de Angular Universal, permitiendo renderizar las aplicaciones en el servidor antes de enviarlas al cliente.

## ¿Qué es Server-Side Rendering?

SSR es una técnica que consiste en generar el HTML de una página web en el servidor en lugar de en el navegador del cliente. Esto significa que cuando un usuario solicita una página, recibe HTML completamente renderizado en lugar de un esqueleto HTML que debe ser poblado mediante JavaScript.

## Principales beneficios

### 1. Mejor SEO

Los motores de búsqueda pueden indexar mejor el contenido de tu aplicación cuando se renderiza en el servidor:

```typescript
// En tu app.config.ts
import { provideClientHydration } from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    // otros providers...
  ],
};
```

### 2. Rendimiento percibido más rápido

Los usuarios ven contenido significativo más rápidamente, mejorando la percepción de velocidad de carga:

```typescript
// Ejemplo de estrategia de precarga en rutas
import { PreloadAllModules } from "@angular/router";

const routes: Routes = [
  // definición de rutas
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      initialNavigation: "enabledBlocking",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

### 3. Mejor experiencia en dispositivos de baja potencia

Al reducir la cantidad de JavaScript que debe ejecutarse en el cliente, mejora la experiencia en dispositivos con recursos limitados.

### 4. Compartir en redes sociales

Las previsualizaciones en redes sociales funcionan correctamente al compartir enlaces, ya que los crawlers pueden ver el contenido completo de la página.

## Consideraciones al implementar SSR

### Acceso a APIs del navegador

Debes tener cuidado con el acceso a APIs específicas del navegador como `window`, `document` o `localStorage`:

```typescript
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

export class MyComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Código seguro que usa APIs del navegador
      localStorage.setItem("lastVisit", new Date().toString());
    }
  }
}
```

### Rendimiento del servidor

El renderizado en el servidor consume recursos adicionales, por lo que debes optimizar tu aplicación para evitar cuellos de botella.

## Conclusión

Implementar SSR en aplicaciones Angular ofrece beneficios significativos en términos de SEO, rendimiento y experiencia de usuario. Con Angular Universal, el proceso se ha simplificado considerablemente, permitiendo a los desarrolladores aprovechar estas ventajas sin sacrificar las características de una SPA tradicional.
