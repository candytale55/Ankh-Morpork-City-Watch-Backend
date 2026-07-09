# Ankh-Morpork City Watch Backend
 
Backend REST desarrollado con Node.js, Express y MongoDB/MongoAtlas para un proyecto de Master. La API gestiona usuarios, casos, agentes y libros de referencia, con autenticacion JWT, roles, subida de imagenes a Cloudinary y relaciones entre colecciones.

La documentacion de requisitos esta en:

- `docs/justificacion-requisitos.md`: guia para el evaluador con los requisitos de la escuela y los archivos donde se cumplen.
- `docs/dev-notes.md`: notas tecnicas ampliadas sobre decisiones de implementacion.

## Tecnologias

- Node.js
- Express
- MongoDB / MongoAtlas
- Mongoose
- JWT
- Bcrypt
- Dotenv
- Cloudinary
- Multer
- Multer Storage Cloudinary
- Nodemon

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto usando `.env.example` como referencia:

```env
DB_URL=mongodb+srv://...
PORT=3000
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Durante el desarrollo `.env` se mantiene fuera del repositorio. Para la entrega final puede incluirse si se decide facilitar la correccion, tal como indica el enunciado de la escuela.

## Ejecucion

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Por defecto el servidor usa:

```txt
http://localhost:3000
```

Las rutas de la API se montan bajo:

```txt
/api/v1
```

## Frontend de pruebas

El proyecto incluye un frontend estatico sencillo para probar el backend de forma visual. Se sirve desde el mismo servidor Express, por lo que no requiere instalacion adicional ni proceso de build.

Con el servidor levantado, abrir:

```txt
http://localhost:3000
```

El tester permite:

- iniciar sesion y guardar el token en el navegador;
- registrar usuarios con imagen;
- consultar agentes con foto y datos;
- consultar, crear, editar, asignar y borrar casos;
- consultar usuarios como admin;
- cambiar roles y borrar usuarios como admin;
- filtrar la vista actual con una barra de busqueda;
- ver errores y mensajes de la API en pantalla.

Este frontend fue generado con ayuda de Codex como interfaz de apoyo para pruebas manuales rapidas. Como este proyecto es principalmente de backend, la interfaz es basica: su objetivo es facilitar validaciones visuales, no actuar como producto frontend final.

La validacion principal de la API se realizo en Insomnia siguiendo la checklist de `docs/pruebas-manuales-insomnia.md`, y todas las pruebas registradas en ese documento pasaron. El frontend basico complementa esa validacion y permite repetir los flujos principales desde navegador.

## Seed

El proyecto incluye semillas para `Agent` y `Case`.

Antes de ejecutar la seed debe existir un usuario admin en MongoAtlas. El primer admin se crea registrando un usuario normal y cambiando manualmente su `role` a `"admin"` desde MongoAtlas.

Ejecutar:

```bash
npm run seed
```

La seed inserta primero agentes y despues casos. Los casos seeded se relacionan con agentes y con el admin existente.

## Autenticacion

El login devuelve un token JWT. Las rutas protegidas deben incluir:

```http
Authorization: Bearer TOKEN
```

Los usuarios se registran siempre con rol `user`, aunque se envie otro rol en el body. El primer admin se crea manualmente desde MongoAtlas.

## Permisos principales

Usuarios normales:

- Registrarse e iniciar sesion.
- Consultar su propio perfil.
- Consultar casos.
- Crear y editar casos.
- Actualizar su propia cuenta, excepto `role`, `password` y `assignedCases`.
- Borrar su propia cuenta.

Admins:

- Listar usuarios.
- Consultar usuarios por id.
- Cambiar roles.
- Borrar cuentas de otros usuarios.
- Crear, editar y borrar agentes.
- Crear, editar y borrar libros.
- Borrar casos.
- Asignar casos a usuarios.

## Rutas de usuarios

| Metodo | Ruta | Auth | Rol | Descripcion |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/users/register` | No | Publico | Crea usuario con imagen. Siempre queda con rol `user`. |
| POST | `/api/v1/users/login` | No | Publico | Inicia sesion y devuelve token. |
| GET | `/api/v1/users/me` | Si | User/Admin | Devuelve el usuario autenticado. |
| GET | `/api/v1/users` | Si | Admin | Lista usuarios. |
| GET | `/api/v1/users/:id` | Si | Admin | Obtiene un usuario por id. |
| PUT | `/api/v1/users/:id` | Si | Propietario/Admin | Actualiza datos generales. No permite cambiar `role`, `password` ni `assignedCases`. |
| PATCH | `/api/v1/users/:id/role` | Si | Admin | Cambia rol de usuario. |
| DELETE | `/api/v1/users/:id` | Si | Propietario/Admin | Borra usuario e imagen de Cloudinary. |

Para crear usuario con imagen, enviar `multipart/form-data` con el campo de archivo `image`.

## Rutas de casos

| Metodo | Ruta | Auth | Rol | Descripcion |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/cases` | Si | User/Admin | Lista casos. |
| GET | `/api/v1/cases/:id` | Si | User/Admin | Obtiene un caso por id. |
| POST | `/api/v1/cases` | Si | User/Admin | Crea caso. `createdBy` se toma del token. |
| PATCH | `/api/v1/cases/:id` | Si | User/Admin | Actualiza caso. No permite cambiar `createdBy` ni `assignedTo`. |
| DELETE | `/api/v1/cases/:id` | Si | Admin | Borra caso y limpia `User.assignedCases`. |
| PUT | `/api/v1/cases/:caseId/assign/:userId` | Si | Admin | Asigna caso a usuario con `$addToSet`. |

La asignacion de casos actualiza ambos lados de la relacion:

- `Case.assignedTo`
- `User.assignedCases`

Se usa `$addToSet` para evitar duplicados sin borrar asignaciones anteriores.

## Rutas de agentes

| Metodo | Ruta | Auth | Rol | Descripcion |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/agents` | No | Publico | Lista agentes. |
| POST | `/api/v1/agents` | Si | Admin | Crea agente con imagen. |
| PUT | `/api/v1/agents/:id` | Si | Admin | Actualiza agente. |
| DELETE | `/api/v1/agents/:id` | Si | Admin | Borra agente e imagen de Cloudinary. |

Para crear o actualizar agente con imagen, enviar `multipart/form-data` con el campo de archivo `image`.

## Rutas de libros

`Book` se conserva como coleccion adicional de referencia.

| Metodo | Ruta | Auth | Rol | Descripcion |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/books` | No | Publico | Lista libros. |
| POST | `/api/v1/books` | Si | Admin | Crea libro. |
| PUT | `/api/v1/books/:id` | Si | Admin | Actualiza libro. |
| DELETE | `/api/v1/books/:id` | Si | Admin | Borra libro. |

## Modelos principales

`User`:

- `name`
- `email`
- `password`
- `image`
- `role`
- `assignedCases`

`Case`:

- `title`
- `description`
- `type`
- `status`
- `priority`
- `location`
- `reportedBy`
- `suspectName`
- `suspectSpecies`
- `assignedAgents`
- `assignedTo`
- `createdBy`

`Agent`:

- `name`
- `title`
- `organization`
- `gender`
- `species`
- `image`

## Notas de entrega

- El repositorio debe estar publico antes de entregar.
- `.env.example` esta disponible como plantilla.
- Si se decide incluir `.env` para facilitar la correccion, hacerlo en el ultimo commit de entrega.
