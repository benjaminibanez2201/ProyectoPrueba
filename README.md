# ProyectoPrueba

Sistema web para la gestión de prácticas profesionales de la carrera de Ingeniería Civil en Informática en la Universidad del Bío-Bío.

## Descripción

Esta aplicación permite:

- Registro de **estudiantes** y **coordinadores**.
- Generación de **tokens de empresa** por parte del coordinador para que las empresas puedan acceder a formularios y evaluaciones de alumnos asignados.
- Validación de **JWT** para autenticación y autorización.
- Base lista para que las empresas accedan a los formularios y chateen con coordinadores (funcionalidad de chat en desarrollo).

El backend está desarrollado con **Node.js**, **Express**, **TypeORM** y **PostgreSQL**.

## Tecnologías

- Node.js
- Express
- TypeORM
- PostgreSQL
- JWT para autenticación
- Yup para validación de datos

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/benjaminibanez2201/ProyectoPrueba.git
Entrar al proyecto:

bash
Copiar código
cd ProyectoPrueba
Instalar dependencias:

bash
Copiar código
npm install
Configurar variables de entorno en un archivo .env:

env
Copiar código
PORT=3000
JWT_SECRET=tu_secreto
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=proyecto_prueba

# Configuración de Correo
EMAIL_USER= correo
EMAIL_PASS= contraseña de aplicacion

Iniciar la base de datos PostgreSQL y sincronizar con TypeORM.

Levantar el servidor:

bash
Copiar código
npm run dev
Uso
Registro de usuarios: POST /api/auth/register

Login: POST /api/auth/login

Generar token de empresa (solo coordinador): POST /api/empresa/generar-token

Acceso de empresa con token: GET /api/empresa/ver-formulario?token=<TOKEN>

Estructura del proyecto
bash
Copiar código
src/
├─ config/          # Configuración de la base de datos
├─ controllers/     # Lógica de rutas
├─ entities/        # Entidades TypeORM
├─ middleware/      # Middlewares (auth, empresaAuth)
├─ routes/          # Definición de rutas
├─ services/        # Servicios (si se crean)
├─ validation/      # Validaciones con Yup
index.js             # Entrada de la aplicación
Estado del proyecto
Backend: funcionando

Frontend: en desarrollo

Funcionalidad de chat para empresas: pendiente

Formularios y evaluaciones dinámicas para empresas: pendiente
