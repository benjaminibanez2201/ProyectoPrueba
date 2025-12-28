# 📚 Sistema de Gestión de Prácticas Profesionales

Sistema web para la gestión de prácticas profesionales de la carrera de Ingeniería Civil en Informática en la Universidad del Bío-Bío.

## 📝 Descripción

Esta aplicación permite la gestión del proceso de prácticas profesionales, incluyendo:

### Funcionalidades para Estudiantes
- 📋 Registro y gestión de perfil
- 📄 Subida y gestión de documentos
- 📝 Respuesta de formularios y bitácoras

### Funcionalidades para Coordinadores
- 👥 Gestión de usuarios (estudiantes)
- ✅ Aprobación de prácticas
- 📊 Creación y edición de formularios dinámicos
- 📁 Gestión de recursos y documentos
- 💬 Sistema de comunicación con empresas

### Funcionalidades para Empresas
- 🔐 Acceso mediante token único
- 📝 Visualización y respuesta de formularios de evaluación y postulación
- 👀 Vista de información del alumno asignado

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Descripción |
|------------|-------------|
| Node.js | Entorno de ejecución |
| Express | Framework web |
| TypeORM | ORM para base de datos |
| PostgreSQL | Base de datos relacional |
| JWT | Autenticación y autorización |
| Bcrypt | Encriptación de contraseñas |
| Yup | Validación de datos |
| Multer | Manejo de archivos |
| Nodemailer | Envío de correos electrónicos |

### Frontend
| Tecnología | Descripción |
|------------|-------------|
| React 18 | Biblioteca de UI |
| Vite | Build tool y dev server |
| React Router DOM | Enrutamiento |
| Tailwind CSS | Framework de estilos |
| Axios | Cliente HTTP |
| SweetAlert2 | Alertas y modales |
| Lucide React | Iconos |
| React Signature Canvas | Firma digital |
| html2pdf.js | Generación de PDFs |

---

## 🚀 Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm 

### 1. Clonar el repositorio

```bash
git clone https://github.com/benjaminibanez2201/ProyectoPrueba.git
cd ProyectoPrueba
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend/`:

```env
PORT=3000
JWT_SECRET=tu_secreto_jwt_seguro

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=proyecto_prueba

# Configuración de Correo (Gmail)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

### 4. Iniciar la aplicación

**Backend** (desde carpeta `backend/`):
```bash
npm run dev
```

**Frontend** (desde carpeta `frontend/`):
```bash
npm run dev
```

---

## 📡 API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registro de usuarios |
| POST | `/login` | Inicio de sesión |

### Usuarios (`/api/users`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/alumnos` | Listar alumnos (Coordinador) |
| GET | `/alumnos/detalles` | Ver detalles de todos los alumnos (Coordinador) |
| GET | `/alumnos/:id/detalles` | Ver detalles de un alumno específico (Coordinador) |

### Prácticas (`/api/practicas`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar todas las prácticas (Coordinador) |
| GET | `/me` | Obtener mi práctica (Alumno) |
| GET | `/:id` | Obtener práctica por ID |
| POST | `/` | Crear práctica (Coordinador) |
| POST | `/postular` | Postular a práctica (Alumno) |
| PUT | `/:id` | Actualizar práctica |
| DELETE | `/:id` | Eliminar práctica (Coordinador) |
| PUT | `/estado/:id` | Actualizar estado de práctica (Coordinador) |
| PATCH | `/:id/cerrar` | Cerrar práctica definitivamente (Coordinador) |
| PATCH | `/:id/aprobar` | Aprobar inicio de práctica (Coordinador) |
| PATCH | `/:id/observar` | Observar práctica (Coordinador) |
| POST | `/:id/finalizar` | Finalizar práctica (Alumno) |

### Formularios (`/api/formularios`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/plantilla/:tipo` | Obtener estructura de plantilla por tipo |
| GET | `/` | Listar todas las plantillas |
| GET | `/plantillas` | Obtener todas las plantillas (alias) |
| POST | `/` | Crear plantilla (Coordinador) |
| PUT | `/:id` | Actualizar plantilla |
| DELETE | `/:id` | Eliminar plantilla (Coordinador) |
| POST | `/bitacora` | Enviar bitácora (Alumno) |
| GET | `/respuesta/:id` | Obtener respuesta de formulario por ID |
| PUT | `/respuesta/:id/correccion` | Corregir postulación rechazada (Alumno) |
| DELETE | `/bitacora/:id` | Eliminar bitácora (Alumno) |

### Documentos (`/api/documentos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/upload` | Subir documento |
| DELETE | `/:id` | Eliminar documento |
| GET | `/revisar/:id` | Revisar documento (Coordinador) |

### Empresa (`/api/empresa`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/generar-token` | Generar token de acceso (Coordinador) |
| GET | `/ver-formulario` | Acceder a formulario con token |
| POST | `/enviar-evaluacion` | Enviar evaluación de práctica |
| GET | `/validar-acceso/:token` | Validar token de acceso |
| POST | `/confirmar-inicio-practica` | Confirmar inicio de práctica |
| GET | `/formulario/:token` | Obtener formulario por token |

### Coordinador (`/api/coordinador`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pendientes` | Ver solicitudes pendientes |
| PUT | `/evaluar/:id` | Evaluar solicitud (Aprobar/Rechazar) |

### Comunicación (`/api/comunicacion`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/enviar` | Enviar mensaje |
| GET | `/practica/:practicaId` | Obtener conversación de una práctica |
| GET | `/bandeja` | Obtener bandeja de entrada |
| GET | `/enviados` | Obtener mensajes enviados |
| PATCH | `/:id/leido` | Marcar mensaje como leído |
| GET | `/no-leidos` | Obtener cantidad de mensajes no leídos |
| GET | `/no-leidos-empresa/:practicaId` | Obtener no leídos para empresa |

### Recursos (`/api/recursos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar recursos |
| POST | `/` | Subir recurso |
| DELETE | `/:id` | Eliminar recurso |

---

## 📁 Estructura del Proyecto

```
ProyectoPrueba/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuración de BD y entorno
│   │   ├── controllers/      # Controladores de rutas
│   │   ├── entities/         # Entidades TypeORM
│   │   ├── Handlers/         # Manejadores de respuestas
│   │   ├── helpers/          # Funciones auxiliares
│   │   ├── middleware/       # Middlewares (auth, upload, validate)
│   │   ├── routes/           # Definición de rutas
│   │   ├── services/         # Lógica de negocio
│   │   ├── validation/       # Esquemas de validación Yup
│   │   └── index.js          # Punto de entrada
│   └── uploads/              # Archivos subidos
│
├── frontend/
│   ├── public/               # Archivos estáticos
│   └── src/
│       ├── components/       # Componentes React reutilizables
│       ├── context/          # Contextos (AuthContext)
│       ├── helpers/          # Funciones auxiliares
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Páginas/vistas
│       ├── services/         # Servicios API
│       └── styles/           # Estilos CSS
│
└── README.md
```

---

## ✅ Estado del Proyecto

| Módulo | Estado |
|--------|--------|
| 🟢 Backend API | Funcionando |
| 🟢 Autenticación JWT | Funcionando |
| 🟢 Gestión de usuarios | Funcionando |
| 🟢 Gestión de prácticas | Funcionando |
| 🟢 Formularios dinámicos | Funcionando |
| 🟢 Subida de documentos | Funcionando |
| 🟢 Sistema de mensajería | Funcionando |
| 🟢 Tokens de empresa | Funcionando |
| 🟢 Frontend React | Funcionando |
| 🟢 Dashboard Alumno | Funcionando |
| 🟢 Dashboard Coordinador | Funcionando |
| 🟢 Gestión de recursos | Funcionando |

---

## 👥 Autores

- **Benjamín Ibáñez** - [GitHub](https://github.com/benjaminibanez2201)
- **Javiera Carrasco** - [GitHub](https://github.com/javimiau)
- **Catalina Muñoz** - [GitHub](https://github.com/nutss2635)

