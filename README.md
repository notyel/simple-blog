# Simple Blog

Blog moderno para desarrolladores con Angular 19 SSR en el frontend y Node.js/Express en el backend.

## Estructura del Proyecto

Este proyecto utiliza NPM Workspaces para gestionar tanto el frontend como el backend desde un único punto.

- **frontend/**: Aplicación Angular 19 con SSR
- **backend/**: API en Node.js/Express que lee archivos Markdown

## Requisitos

- Node.js 18.x o superior
- NPM 7.x o superior (para soporte de workspaces)

## Instalación

Gracias a NPM Workspaces, puedes instalar todas las dependencias con un solo comando desde la raíz del proyecto:

```bash
npm install
```

Esto instalará las dependencias tanto del frontend como del backend.

## Scripts Disponibles

Puedes ejecutar estos comandos desde la raíz del proyecto:

### Desarrollo

```bash
# Iniciar tanto el backend como el frontend en modo desarrollo
npm run dev

# Iniciar solo el backend en modo desarrollo
npm run dev:backend

# Iniciar solo el frontend en modo desarrollo con SSR
npm run dev:frontend
```

### Producción

```bash
# Construir el frontend para producción con SSR
npm run build

# Iniciar el backend en modo producción
npm run start:backend

# Iniciar el frontend en modo producción
npm run start:frontend

# Generar páginas pre-renderizadas
npm run prerender
```

### Pruebas

```bash
# Ejecutar pruebas del frontend
npm run test:frontend
```

## Acceso a las Aplicaciones

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:4200

## Licencia

MIT
