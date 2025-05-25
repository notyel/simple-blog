---
title: "Cómo solucionar el error ReferenceError: window is not defined"
date: "2022-07-10"
description: "¿Estás programando con JavaScript en el servidor y estás encontrando este error? ¡Es normal! Te cuento cómo solucionarlo"
toc: true
tags:
  - javascript
---

# Cómo solucionar el error ReferenceError: window is not defined

Cuando estás desarrollando aplicaciones JavaScript que se ejecutan tanto en el navegador como en el servidor (por ejemplo, con Node.js), es común encontrarse con el error `ReferenceError: window is not defined`. Este error ocurre porque el objeto `window` solo existe en entornos de navegador, no en Node.js.

## ¿Por qué ocurre este error?

El objeto `window` es parte del DOM (Document Object Model) y representa la ventana del navegador. En entornos de servidor como Node.js, no hay ventana ni DOM, por lo que intentar acceder a `window` resultará en un error.

## Soluciones

### 1. Verificar el entorno

```javascript
if (typeof window !== "undefined") {
  // Código que usa window
  const scrollPosition = window.scrollY;
} else {
  // Código alternativo para entorno de servidor
  console.log("Ejecutando en el servidor, window no está disponible");
}
```

### 2. Usar isomorphic-fetch para peticiones HTTP

Si estás intentando usar `fetch` (que normalmente depende de `window`), puedes usar una biblioteca como `isomorphic-fetch`:

```javascript
import "isomorphic-fetch";

// Ahora fetch funciona tanto en el navegador como en Node.js
fetch("https://api.ejemplo.com/datos")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### 3. Para Angular Universal (SSR)

En aplicaciones Angular con Server-Side Rendering, puedes usar el patrón de inyección de plataforma:

```typescript
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  if (isPlatformBrowser(this.platformId)) {
    // Código que usa window
    console.log('Altura de la ventana:', window.innerHeight);
  }
  if (isPlatformServer(this.platformId)) {
    // Código específico del servidor
    console.log('Ejecutando en el servidor');
  }
}
```

Recuerda que la mejor práctica es diseñar tu aplicación teniendo en cuenta desde el principio que ciertos objetos como `window`, `document`, `navigator` o `localStorage` no estarán disponibles en el servidor.
