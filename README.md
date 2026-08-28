# Ankh-Morpork City Watch Backend

Backend REST para gestionar usuarios, casos, agentes y libros del universo de la City Watch. El proyecto está orientado a practicar backend con Node.js, Express, MongoDB/MongoAtlas y autenticación JWT.

## Qué incluye

- API REST con Express.
- Base de datos MongoDB/MongoAtlas con Mongoose.
- Autenticación JWT y permisos por rol.
- Gestión de usuarios con imagen de perfil.
- Subida de imágenes a Cloudinary.
- Relaciones entre `User`, `Case`, `Agent` y `Book`.
- Seeds para generar datos iniciales.
- Documentación técnica y de requisitos separada por temas.

## Requisitos

- Node.js
- npm
- MongoDB/MongoAtlas
- Cuenta Cloudinary

## Inicio rápido

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env` a partir de `.env.example`:

```env
DB_URL=mongodb+srv://...
PORT=3000
APP_URL=http://localhost:3000

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Ejecuta el servidor en modo desarrollo:

```bash
npm run dev
```

4. La API estará disponible en:

```text
http://localhost:3000
```

Base de la API:

```text
/api/v1
```

## Stack técnico

- [Node.js](https://nodejs.org/) — entorno de ejecución del backend.
- [Express](https://expressjs.com/) — servidor HTTP y rutas de la API.
- [MongoDB / MongoAtlas](https://www.mongodb.com/atlas) — base de datos principal.
- [Mongoose](https://mongoosejs.com/) — modelado y consultas con MongoDB.
- [JWT](https://jwt.io/) — autenticación y autorización basada en tokens.
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — hash y comparación segura de contraseñas.
- [Cloudinary](https://cloudinary.com/) — almacenamiento y gestión de imágenes.
- [Multer](https://github.com/expressjs/multer) — manejo de archivos multipart/form-data.
- [Multer Storage Cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary) — integración de subida de archivos con Cloudinary.
- [Nodemailer](https://nodemailer.com/) — envío de emails para recuperación de contraseña.
- [Insomnia](https://insomnia.rest/) — pruebas manuales de la API.

### Dependencias del proyecto

- [express](https://expressjs.com/) — framework para la API REST.
- [mongoose](https://mongoosejs.com/) — ODM para MongoDB.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) — generación y validación de tokens JWT.
- [bcrypt](https://www.npmjs.com/package/bcrypt) — encriptación de contraseñas.
- [dotenv](https://github.com/motdotla/dotenv) — carga de variables de entorno.
- [cloudinary](https://cloudinary.com/) — gestión de imágenes.
- [multer](https://github.com/expressjs/multer) — subida de archivos.
- [multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary) — almacenamiento de archivos subidos en Cloudinary.
- [nodemailer](https://nodemailer.com/) — envío de correos.

### Dependencias de desarrollo

- [nodemon](https://nodemon.io/) — reinicio automático del servidor durante el desarrollo.

## Scripts útiles

```bash
npm run dev
npm run seed
```

- `npm run dev`: ejecuta el servidor en desarrollo.
- `npm run seed`: crea datos iniciales para las colecciones semilladas. El proyecto incluye seeds para `Agent` y `Case`; antes de ejecutarlas debe existir un usuario admin en MongoAtlas.

## Seeds

El proyecto incluye seeds para `Agent` y `Case`.

Antes de ejecutarlas debe existir un usuario admin en MongoAtlas. El primer administrador se crea registrando un usuario normal y cambiando manualmente su `role` a `"admin"`.

```bash
npm run seed
```

## Documentación del proyecto

- [docs/justificacion-requisitos.md](docs/justificacion-requisitos.md) — Requisitos del proyecto y cumplimiento.
- [docs/dev-notes.md](docs/dev-notes.md) — Decisiones técnicas, reglas de negocio y notas de implementación.
- [docs/autenticacion-y-passwords.md](docs/autenticacion-y-passwords.md) — Flujo de login, JWT y recuperación de contraseña.
- [docs/pruebas-manuales-insomnia.md](docs/pruebas-manuales-insomnia.md) — Guía de pruebas manuales con Insomnia.
- [docs/README.md](docs/README.md) — Índice de documentación del proyecto.

## Notas de entrega

- `.env` debe mantenerse fuera del repositorio.
- El proyecto debe publicarse en GitHub antes de la entrega.
- Las credenciales reales de base de datos, JWT y Cloudinary deben compartirse de forma privada cuando sea necesario.