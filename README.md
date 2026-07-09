# Ankh-Morpork City Watch Backend

Backend REST creado para un proyecto de Master. Este repositorio existe para implementar y demostrar una API con autenticacion JWT, roles, manejo de ficheros y relaciones entre colecciones en MongoDB.

El foco del proyecto es backend. Se incluye un frontend muy basico (generado con apoyo de Codex) solo para facilitar pruebas manuales desde navegador.

## Que hace el proyecto

- Gestiona usuarios, casos y agentes de una organización policial ficticia.
- Aplica autenticacion con JWT y control de permisos por rol.
- Sube y elimina imagenes con Cloudinary.
- Mantiene relaciones entre `User`, `Case` y `Agent`.

## Inicio rapido

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` a partir de `.env.example`:

```env
DB_URL=mongodb+srv://...
PORT=3000
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

```txt
http://localhost:3000
```

API base:

```txt
/api/v1
```

## Stack tecnico

- Node.js
- Express
- MongoDB / MongoAtlas
- Mongoose
- JWT
- Cloudinary

## Paquetes y herramientas usadas

Dependencias de aplicacion:

- express
- mongoose
- jsonwebtoken
- bcrypt
- dotenv
- cloudinary
- multer
- multer-storage-cloudinary

Dependencias de desarrollo:

- nodemon

Herramientas de testing manual:

- Insomnia
- Frontend estatico de apoyo en `public/`

## Documentacion

El detalle del proyecto esta separado por objetivo para evitar duplicacion y mantener este README corto.

- [docs/justificacion-requisitos.md](docs/justificacion-requisitos.md): cumplimiento de requisitos solicitados por la escuela.
- [docs/dev-notes.md](docs/dev-notes.md): decisiones tecnicas, reglas de negocio, relaciones de datos y notas de implementacion.
- [docs/pruebas-manuales-insomnia.md](docs/pruebas-manuales-insomnia.md): checklist de pruebas manuales ejecutadas en Insomnia.
- [docs/README.md](docs/README.md): indice de la carpeta docs y descripcion breve de cada archivo.

## Pruebas

La validacion principal de la API se realizo con Insomnia siguiendo [docs/pruebas-manuales-insomnia.md](docs/pruebas-manuales-insomnia.md). Todas las pruebas listadas en ese documento pasaron.

El frontend basico en `public/` complementa esas pruebas y permite repetir flujos clave desde navegador.

## Screenshots

### API Tester - Cases

![API Tester Cases](docs/shots/scsh-API-Tester%20Cases.png)

### API Tester - Users

![API Tester Users](docs/shots/scsh-API-Tester%20Users.png)

## Seed

El proyecto incluye semillas para `Agent` y `Case`.

Antes de ejecutar la seed debe existir un usuario admin en MongoAtlas. El primer admin se crea registrando un usuario normal y cambiando manualmente su `role` a `"admin"` desde MongoAtlas.

```bash
npm run seed
```

## Notas de entrega

- `.env.example` esta disponible como plantilla.
