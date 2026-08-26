# Ankh-Morpork City Watch Backend

Backend REST creado para un proyecto de Máster. Implementa una API con autenticación JWT, roles, gestión de contraseñas, subida de imágenes y relaciones entre colecciones en MongoDB.

El foco del proyecto es backend. Se incluye un frontend básico de apoyo para facilitar pruebas desde navegador.

## Qué hace el proyecto

- Gestiona usuarios, agentes, casos y libros.
- Aplica autenticación JWT y permisos por rol.
- Permite cambiar y recuperar contraseñas.
- Envía correos de recuperación mediante Nodemailer.
- Gestiona imágenes con Cloudinary.
- Mantiene relaciones entre `User`, `Case`, `Agent` y `Book`.
- Incluye seeds y una colección de pruebas en Insomnia.

## Inicio rápido

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` a partir de `.env.example`:

```env
DB_URL=mongodb+srv://...
PORT=3000
APP_URL=http://localhost:3000

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Ejecutar en desarrollo:

```bash
npm run dev
```

4. Abrir:

```text
http://localhost:3000
```

API base:

```text
/api/v1
```

## Stack técnico

- Node.js
- Express
- MongoDB / MongoAtlas
- Mongoose
- JWT
- bcrypt
- Cloudinary
- Multer
- Nodemailer
- Insomnia

## Paquetes y herramientas usadas

### Dependencias de aplicación

- [express]() — Servidor HTTP y rutas de la API.
- [mongoose]() — Modelado y consultas de MongoDB.
- [jsonwebtoken]() — Generación y validación de JWT.
- [bcrypt]() — Hash y comparación de contraseñas.
- [dotenv]() — Carga variables desde `.env`.
- [cloudinary]() — Almacenamiento y gestión de imágenes.
- [multer]() — Procesamiento de archivos `multipart/form-data`.
- [multer-storage-cloudinary]() — Integración entre Multer y Cloudinary.
- [nodemailer]() — Envío del correo de recuperación de contraseña.

### Dependencia de desarrollo

- [nodemon]() — Reinicia el servidor automáticamente durante el desarrollo.

### Herramientas

- [Insomnia]() — Pruebas de la API.
- Frontend estático en `public/` — Apoyo para pruebas desde navegador.

## Autenticación y contraseñas

La API incluye:

```text
POST  /api/v1/users/login
GET   /api/v1/users/me
PATCH /api/v1/users/me/password
POST  /api/v1/users/forgot-password
PATCH /api/v1/users/reset-password/:token
```

El login devuelve un JWT para acceder a las rutas protegidas.

Un usuario autenticado puede cambiar su contraseña indicando la contraseña actual.

Si la olvida, puede solicitar un enlace temporal de recuperación enviado mediante Nodemailer y establecer una nueva contraseña desde el navegador.

El flujo completo se explica en:

[docs/autenticacion-y-passwords.md](docs/autenticacion-y-passwords.md)

## Documentación

- [docs/justificacion-requisitos.md](docs/justificacion-requisitos.md) — Cumplimiento de requisitos del proyecto.
- [docs/dev-notes.md](docs/dev-notes.md) — Decisiones técnicas y reglas de negocio.
- [docs/autenticacion-y-passwords.md](docs/autenticacion-y-passwords.md) — Login, cambio y recuperación de contraseña.
- [docs/pruebas-manuales-insomnia.md](docs/pruebas-manuales-insomnia.md) — Ejecución de pruebas con Insomnia.
- [docs/README.md](docs/README.md) — Índice de la documentación.

## Pruebas

La API se prueba principalmente con una colección de Insomnia. Los scripts de la colección guardan y reutilizan automáticamente IDs y tokens durante los flujos.

Algunas comprobaciones siguen siendo manuales, especialmente Cloudinary y la recuperación de contraseña por correo.

Consulta:

[docs/pruebas-manuales-insomnia.md](docs/pruebas-manuales-insomnia.md)

**[PENDIENTE]** Ejecutar nuevamente la colección completa después de terminar los últimos cambios de código.

## Screenshots

### API Tester - Cases

![API Tester Cases](docs/shots/scsh-API-Tester%20Cases.png)

### API Tester - Users

![API Tester Users](docs/shots/scsh-API-Tester%20Users.png)

**[PENDIENTE]** Añadir las capturas del flujo de recuperación de contraseña.

## Seed

El proyecto incluye seeds para `Agent` y `Case`.

Antes de ejecutarlas debe existir un usuario admin en MongoAtlas. El primer admin se crea registrando un usuario normal y cambiando manualmente su `role` a `"admin"`.

```bash
npm run seed
```

## Pendientes antes de entrega

- **[PENDIENTE]** Añadir `GET /api/v1/agents/:id`.
- **[PENDIENTE]** Añadir `GET /api/v1/books/:id`.
- **[PENDIENTE]** Terminar la revisión de duplicados en casos.
- **[PENDIENTE]** Revisar la validación de IDs en todas las rutas.
- **[PENDIENTE]** Revisar los permisos de la relación Book-Agent.
- **[PENDIENTE]** Eliminar logs e imports temporales.
- **[PENDIENTE]** Ejecutar las pruebas finales y actualizar la documentación.

## Notas de entrega

- `.env` se mantiene fuera del repositorio.
- `.env.example` sirve como plantilla.
- Las credenciales reales necesarias para la corrección se facilitan de forma privada.