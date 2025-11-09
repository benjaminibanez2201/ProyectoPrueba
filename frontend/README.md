# Frontend - Plantilla para Ayudantía ISW

Plantilla de frontend desarrollada para las clases de Ingeniería de Software.

## Tecnologías

- React 18
- Vite
- React Router DOM
- Axios
- SweetAlert2
- JWT Authentication

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
.env
```

3. Editar el archivo `.env` con la URL 
```
VITE_BASE_URL=http://localhost:5173/api
```

## Ejecución

Modo desarrollo:
```bash
npm run dev
```

Compilar para producción:
```bash
npm run build
```

Vista previa de producción:
```bash
npm run preview
```

## Estructura del Proyecto

```
src/
├── assets/         # Imágenes, iconos, etc.
├── components/     # Componentes reutilizables
├── context/        # Contextos de React
├── helpers/        # Funciones auxiliares
├── hooks/          # Hooks personalizados
├── pages/          # Páginas de la aplicación
├── services/       # Servicios de API
└── styles/         # Archivos CSS
```

## Funcionalidades

- Sistema de autenticación con JWT
- Rutas protegidas
- Manejo de sesión con cookies
- Alertas con SweetAlert2
- Formularios validados

## Backend Compatible

Este frontend está diseñado para trabajar con el backend:
https://github.com/Marco-0107/CLASE-2-AYUDANTIA-ISW-ALUMNOS

## Autores

- Marco Cerda
- Sebastian Espinoza

Universidad del Bio Bio - 2025
