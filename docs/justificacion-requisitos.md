# Justificacion de requisitos


Este documento sirve como guia rapida para que el evaluador pueda localizar si se cumplen los requisitos mínimos del proyecto. La justificación se centra en lo que exige el enunciado de la escuela; las funcionalidades extra que se han añadido (autenticacion JWT, recuperacion de contraseñas, email, etc.) aparecen como ampliaciones del proyecto y no como requisitos indispensables.

La tematica del proyecto es una API de gestion de casos y agentes inspirada en la City Watch.

## Requisitos segun el enunciado

### 1. Servidor Express con MongoAtlas

Cumplido. `index.js` crea la aplicación con Express, activa `express.json()`, conecta con MongoDB mediante `connectDB()` y monta las rutas bajo `/api/v1`.

La conexión a MongoDB usa la variable `DB_URL`, preparada para una conexión de MongoAtlas desde `.env`.

### 2. Creación de 2 modelos como mínimo

Cumplido. El proyecto tiene varios modelos, entre ellos:

- `User`
- `Case`
- `Agent`
- `Book`

Los modelos principales del dominio son `User`, `Case` y `Agent`.

### 3. 1 dato relacionado como mínimo

Cumplido. Existen varias relaciones entre colecciones:

- `Case.createdBy` referencia a `User`.
- `Case.assignedAgents` referencia a `Agent`.
- `Case.assignedTo` referencia a `User`.
- `User.assignedCases` referencia a `Case`.

### 4. Modelo de usuarios con array de datos de otra colección

Cumplido. `User` tiene el campo `assignedCases`, que es un array de `ObjectId` con referencia a la colección `Case`.

Este array representa los casos asignados a cada usuario.

### 5. Usuarios creados únicamente con rol `"user"`

Cumplido. Aunque el modelo permite los roles `user` y `admin`, el controlador de registro fuerza siempre:

```js
newUser.role = 'user';
```

De este modo, aunque una petición de registro envíe `role: "admin"`, el usuario queda creado como `user`.

### 6. Primer administrador creado manualmente en MongoAtlas

Cumplido. El primer usuario se registra como `user` y luego se modifica manualmente en MongoAtlas para cambiar su `role` a `"admin"`.

Esto se hace para proteger la creación del primer administrador sin seeding de usuarios.

### 7. Diferentes roles de usuario con diferentes permisos + middleware Auth

Cumplido. La autenticación se realiza con JWT:

- `login` genera un token.
- `isAuth` verifica el token y guarda el usuario autenticado en `req.user`.
- `requireRole('admin')` protege rutas que requieren rol administrador.

Esto permite distinguir permisos entre usuarios normales y administradores.

### 8. Subida de ficheros con Cloudinary + eliminación del archivo

Cumplido. El proyecto usa `multer-storage-cloudinary` para gestionar la subida de imágenes y elimina la imagen asociada al borrar el dato.

Existencias principales:

- `src/middlewares/file.js`
- `src/utils/deleteFile.js`
- rutas y controladores de `User` y `Agent`

### 9. README.md con documentación del proyecto

Cumplido. El `README.md` incluye una descripción del proyecto, instalación, dependencias, variables de entorno, autenticación, permisos, seeds y enlaces a documentación adicional.

### 10. Semilla para una de las colecciones

Cumplido. El proyecto incluye semillas para `Agent` y `Case` a través de `src/utils/seeds/index.seed.js` y el script `npm run seed`.

### 11. Se evitan los duplicados en el array de usuarios y no se pierde ningún dato

Cumplido. La relación se gestiona con `$addToSet` para evitar duplicados y evitar sobrescribir datos anteriores del array.

Esto se aplica al flujo de asignación de casos a usuarios, donde no se reemplaza el contenido actual del array.

### 12. CRUD completo de todas las colecciones

Cumplido. El proyecto incluye las operaciones de creación, lectura, actualización y borrado para las colecciones principales:

- `users`
- `cases`
- `agents`
- `books`

### 13. Los roles del usuario funcionan de manera correcta

Cumplido. El rol de usuario está protegido por la lógica del backend:

- los usuarios se crean como `user`;
- el primer `admin` se crea manualmente;
- el admin puede cambiar roles;
- un usuario normal no puede cambiarse a sí mismo ni a otros usuarios;
- un usuario puede borrar su propia cuenta, pero no la de otros usuarios;
- un admin puede gestionar cuentas ajenas cuando corresponde.

## Notas adicionales

El proyecto incluye ampliaciones útiles que no forman parte del requisito mínimo del enunciado, pero que están bien implementadas y documentadas, como:

- autenticación JWT;
- cambio y recuperación de contraseña;
- envío de email con Nodemailer;
- gestión del catálogo de agentes y libros;
- validaciones adicionales y documentación técnica.

Estas ampliaciones se documentan en las guías del proyecto y no sustituyen los requisitos mínimos descritos arriba.

### Proyecto público y `.env`

Para la entrega, el repositorio debe publicarse en GitHub y el archivo `.env` debe mantenerse fuera del repositorio para no compartir secretos.

## Tabla de evidencias

| Requisito mínimo | Evidencia |
| --- | --- |
| Servidor Express + MongoAtlas | `index.js` crea la app, usa `express.json()` y conecta con MongoDB mediante `connectDB()` en `src/config/db.js`. |
| Mínimo de 2 modelos | `src/api/models/User.js`, `src/api/models/Case.js`, `src/api/models/Agent.js`, `src/api/models/Book.js`. |
| Dato relacionado mínimo | `Case.createdBy`, `Case.assignedTo`, `Case.assignedAgents` y `User.assignedCases` hacen referencia a otras colecciones. |
| Array relacionado en User | `src/api/models/User.js` define `assignedCases` como array de referencias a `Case`. |
| Usuarios creados solo como `user` | `src/api/controllers/user.controller.js` fuerza `newUser.role = 'user'` en el registro. |
| Primer admin manual | Flujo documentado en `docs/dev-notes.md`; no se crea usuario admin por seed. |
| Roles + middleware Auth | `src/middlewares/isAuth.js` y `src/middlewares/requireRole.js`; rutas protegidas en `src/api/routes/user.routes.js`. |
| Cloudinary + eliminación de imagen | `src/middlewares/file.js`, `src/utils/deleteFile.js`, `deleteUser` y lógica de actualización de `User`/`Agent`. |
| README del proyecto | `README.md` incluye instalación, env, documentación, seeds y explicación del proyecto. |
| Seed de una colección | `src/utils/seeds/index.seed.js` y el script `npm run seed` en `package.json`. |
| Evitar duplicados en arrays | `assignCaseToUser` usa `$addToSet` para evitar duplicados sin perder los datos anteriores. |
| CRUD completo | Rutas y controladores de `users`, `cases`, `agents` y `books` incluyen operaciones de alta, lectura, edición y borrado. |
| Roles correctos y permisos | `updateUserRole`, `deleteUser` y `requireRole('admin')` en la lógica de usuarios y rutas. |
