# Justificacion de requisitos

Este documento sirve como guia rapida para que el evaluador pueda localizar donde se cumple cada requisito del proyecto. La primera seccion resume el cumplimiento en el mismo orden del enunciado de la escuela. La segunda seccion incluye una tabla de evidencias con los archivos principales.

El backend es una API REST con Express, MongoDB/MongoAtlas, Mongoose, autenticacion JWT, roles de usuario, gestion de contraseñas, envio de correos de recuperacion mediante Nodemailer y subida de imagenes a Cloudinary.

La tematica del proyecto es una API de gestion de casos y agentes inspirada en la City Watch de Ankh-Morpork.

Los modelos principales para los requisitos son `User`, `Case` y `Agent`; `Book` se conserva como coleccion adicional de referencia.

## Requisitos segun el enunciado

### Servidor Express con MongoAtlas

Cumplido. `index.js` crea el servidor con Express, activa `express.json()`, conecta con MongoDB mediante `connectDB()` y monta las rutas bajo `/api/v1`.

La conexion a MongoDB usa la variable `DB_URL`, preparada para una conexion de MongoAtlas desde `.env`.

### Creacion de 2 modelos como minimo

Cumplido. El proyecto tiene mas de dos modelos:

- `User`
- `Case`
- `Agent`
- `Book`

Los modelos principales del dominio son `User`, `Case` y `Agent`.

### 1 dato relacionado como minimo

Cumplido. Existen varias relaciones entre colecciones:

- `Case.createdBy` referencia a `User`.
- `Case.assignedAgents` referencia a `Agent`.
- `Case.assignedTo` referencia a `User`.
- `User.assignedCases` referencia a `Case`.

### Modelo de usuarios con array de datos de otra coleccion

Cumplido. `User` tiene el campo `assignedCases`, que es un array de `ObjectId` con referencia a la coleccion `Case`.

Este array representa los casos asignados a cada usuario.

### Usuarios creados unicamente con rol `"user"`

Cumplido. Aunque el modelo permite los roles `user` y `admin`, el controlador de registro fuerza siempre:

```js
newUser.role = 'user';
```

De este modo, aunque una peticion de registro envie `role: "admin"`, el usuario queda creado como `user`.

### Primer administrador creado manualmente en MongoAtlas

Cumplido segun el enunciado. El primer usuario se registra como `user` y despues se modifica manualmente en MongoAtlas para cambiar su `role` a `"admin"`.

No se seedean usuarios para no borrar ni sobrescribir accidentalmente ese primer administrador.

### Diferentes roles de usuario con diferentes permisos + middleware Auth

Cumplido. La autenticacion se realiza con JWT:

- `login` genera un token.
- `isAuth` verifica el token y guarda el usuario autenticado en `req.user`.
- `requireRole('admin')` protege rutas que requieren rol admin.

Permisos principales:

- Un usuario normal puede registrarse, iniciar sesion, consultar su perfil, cambiar su propia contraseña, crear y consultar casos, actualizar los datos permitidos de su cuenta y borrar su propia cuenta.
- Un admin puede listar usuarios, consultar usuarios por id, cambiar roles, borrar cuentas de otros usuarios, gestionar agentes, gestionar libros, borrar casos y asignar usuarios o agentes a casos.
- Un usuario normal no puede cambiar roles, listar usuarios, consultar otros usuarios por id, asignar usuarios a casos, utilizar los endpoints administrativos de asignacion de agentes a casos ni borrar cuentas ajenas.

**[PENDIENTE]** Revisar la politica de permisos de `PUT /api/v1/books/:bookId/agents/:agentId`, que actualmente no utiliza `requireRole('admin')`.

### Admin puede cambiar el rol de un usuario

Cumplido. La ruta `PATCH /api/v1/users/:id/role` esta protegida con `isAuth` y `requireRole('admin')`.

Ademas, `updateUserRole` usa `runValidators: true`, por lo que el rol debe cumplir el enum del modelo (`user` o `admin`).

### Usuario normal no puede cambiar roles

Cumplido. Hay dos protecciones:

- La ruta especifica de cambio de rol requiere admin.
- La actualizacion general de usuario elimina `role` del body con `delete req.body.role`.

### Usuario puede eliminar su propia cuenta

Cumplido. `deleteUser` permite borrar la cuenta cuando `req.user._id` coincide con el `id` solicitado.

### Admin puede eliminar cuentas de usuarios

Cumplido. `deleteUser` tambien permite el borrado cuando el usuario autenticado tiene `role: "admin"`.

### Usuario normal no puede eliminar cuentas ajenas

Cumplido. Si el usuario autenticado no es admin y tampoco es propietario de la cuenta, `deleteUser` responde `403 Forbidden`.

### Campo `image` en usuarios

Cumplido. El modelo `User` define el campo `image` como requerido.

### Subida de ficheros con Cloudinary

Cumplido. La ruta de registro de usuarios usa `uploadUser.single('image')`, configurado con `multer-storage-cloudinary`.

Tambien existe subida de imagenes para agentes con `uploadAgent.single('image')`.

### Eliminacion y sustitucion de archivos en Cloudinary

Cumplido para la eliminacion de documentos.

Al borrar un usuario se llama a `deleteFile` para eliminar su imagen de Cloudinary.

Al borrar un agente tambien se elimina su imagen.

Las actualizaciones de usuario y agente permiten sustituir la imagen almacenada y contienen logica para evitar conservar una imagen nueva cuando la operacion de base de datos falla.

**[PENDIENTE]** Realizar nuevamente las pruebas completas de rollback y sustitucion de imagen despues de los cambios finales del codigo.

### Evitar duplicados en el array de usuarios y no perder datos anteriores

Cumplido. La asignacion de casos a usuarios se hace mediante la ruta admin:

```txt
PUT /api/v1/cases/:caseId/assign/:userId
```

El controlador usa `$addToSet` en ambos lados de la relacion:

- En `Case.assignedTo`, para anadir el usuario al caso.
- En `User.assignedCases`, para anadir el caso al usuario.

`$addToSet` evita duplicados y no sustituye los valores anteriores del array.

Ademas, las rutas generales de creacion/edicion de casos eliminan `assignedTo` del body, y la ruta general de actualizacion de usuarios elimina `assignedCases` del body. Asi la relacion solo se modifica desde la ruta controlada por admin.

### Semilla para una de las colecciones

Cumplido. El proyecto incluye semillas para `Agent` y `Case`.

El script `npm run seed` ejecuta `src/utils/seeds/index.seed.js`, que inserta primero agentes y despues casos. Los casos seeded incluyen relaciones con agentes y con el admin previamente creado.

### CRUD completo de todas las colecciones

**[PENDIENTE]** La mayor parte del CRUD esta implementada, pero el requisito no debe marcarse definitivamente como cerrado hasta añadir la lectura individual que falta en `Agent` y `Book`.

Estado actual:

- `users`: registro, login, listado admin, detalle admin, perfil propio, actualizacion y borrado.
- `cases`: listado, detalle, creacion, actualizacion, borrado y operaciones de asignacion.
- `agents`: listado, busqueda, creacion, actualizacion y borrado.
- `books`: listado, creacion, actualizacion, borrado y gestion de relaciones con agentes.

Falta añadir:

```text
GET /api/v1/agents/:id
GET /api/v1/books/:id
```

Cuando ambos endpoints esten implementados y probados, esta seccion puede cambiarse nuevamente a `Cumplido`.

### README.md con documentacion del proyecto

Cumplido.

El `README.md` incluye:

- descripcion del proyecto;
- tecnologias y dependencias;
- variables de entorno;
- instalacion y ejecucion;
- autenticacion;
- cambio y recuperacion de contraseña;
- permisos;
- pruebas;
- seed;
- enlaces a documentacion complementaria.

La explicacion detallada se divide entre:

```text
docs/dev-notes.md
docs/autenticacion-y-passwords.md
docs/pruebas-manuales-insomnia.md
```

**[PENDIENTE]** Realizar una ultima revision del README despues de cerrar codigo y pruebas para eliminar cualquier marcador `[PENDIENTE]` que ya no corresponda.

### Proyecto publico en la entrega

Accion de entrega. El proyecto debe hacerse publico en GitHub antes de entregar. Esta accion no depende del codigo fuente ni de la implementacion del backend.

### `.env` para facilitar la correccion

Durante el desarrollo, `.env` se mantiene fuera del repositorio y `.env.example` sirve como plantilla de configuracion.

Las credenciales reales necesarias para la correccion deben proporcionarse de forma privada cuando sea necesario.

No deben publicarse secretos de MongoDB, JWT, Cloudinary o SMTP en el repositorio.

## Tabla de evidencias

| Requisito | Evidencia |
| --- | --- |
| Servidor Express | `index.js` crea la app, usa `express.json()` y monta `/api/v1/users`, `/api/v1/cases`, `/api/v1/agents` y `/api/v1/books`. |
| Conexion MongoDB/MongoAtlas | `src/config/db.js`; `index.js` llama a `connectDB()`; `.env.example` documenta `DB_URL`. |
| Minimo de 2 modelos | `src/api/models/User.js`, `src/api/models/Case.js`, `src/api/models/Agent.js`, `src/api/models/Book.js`. |
| Relacion Case-User | `src/api/models/Case.js` define `createdBy` y `assignedTo` con `ref: 'User'`. |
| Relacion Case-Agent | `src/api/models/Case.js` define `assignedAgents` con `ref: 'Agent'`. |
| Array relacionado en User | `src/api/models/User.js` define `assignedCases` con `ref: 'Case'`. |
| Registro solo como user | `src/api/controllers/user.controller.js`, funcion `register`, fuerza `newUser.role = 'user'`. |
| Primer admin manual | Flujo documentado en `docs/dev-notes.md`; no hay seed de usuarios para proteger el admin manual. |
| Auth JWT | `src/utils/jwt.js`; `src/middlewares/isAuth.js`; `login` en `src/api/controllers/user.controller.js`. |
| Cambio de contraseña | `PATCH /api/v1/users/me/password` en `src/api/routes/user.routes.js`; `changePassword` en `src/api/controllers/user.controller.js`; requiere usuario autenticado mediante `isAuth`. |
| Recuperación de contraseña | `POST /api/v1/users/forgot-password` y `PATCH /api/v1/users/reset-password/:token` en `src/api/routes/user.routes.js`; controladores `forgotPassword` y `resetPassword` en `src/api/controllers/user.controller.js`. |
| Token temporal de recuperación | `forgotPassword` genera el token; `User.js` define `resetPasswordToken` y `resetPasswordExpires`; se almacena el hash del token y se comprueba su expiración durante `resetPassword`. |
| Envío de correo de recuperación | `src/utils/sendResetPasswordEmail.js` utiliza Nodemailer para enviar el enlace temporal de cambio de contraseña. |
| Middleware de rol | `src/middlewares/requireRole.js`. |
| Admin cambia roles | `PATCH /api/v1/users/:id/role` en `src/api/routes/user.routes.js`; `updateUserRole` en `src/api/controllers/user.controller.js`. |
| User normal no cambia roles | `updateUser` elimina `req.body.role`; ruta de rol usa `requireRole('admin')`. |
| User borra su cuenta | `deleteUser` compara `req.user._id` con `req.params.id`. |
| Admin borra usuarios | `deleteUser` permite la accion si `req.user.role === 'admin'`. |
| User no borra cuentas ajenas | `deleteUser` devuelve `403` si no es admin ni propietario. |
| Campo image en User | `src/api/models/User.js`. |
| Upload Cloudinary usuario | `src/middlewares/file.js`; `src/api/routes/user.routes.js`; `register` en `user.controller.js`. |
| Eliminacion imagen usuario | `deleteUser` llama a `deleteFile(deletedUser.image)`; `src/utils/deleteFile.js`. |
| Upload y borrado Cloudinary Agent | `src/middlewares/file.js`; `src/api/routes/agents.routes.js`; `src/api/controllers/agent.controller.js`. |
| Evitar duplicados en array User | `assignCaseToUser` usa `$addToSet` sobre `User.assignedCases`. |
| No perder datos anteriores | `$addToSet` agrega sin reemplazar el array existente; `updateUser` elimina `assignedCases` del body. |
| Asignacion admin de casos | `PUT /api/v1/cases/:caseId/assign/:userId` en `src/api/routes/cases.routes.js`; `assignCaseToUser` en `case.controller.js`. |
| Asignacion admin de agentes a casos | `PUT /api/v1/cases/:caseId/assign-agent/:agentId` en `src/api/routes/cases.routes.js`; usa `isAuth` y `requireRole('admin')`; controlador `assignCaseToAgent`. |
| Desasignacion admin de agentes de casos | `PUT /api/v1/cases/:caseId/unassign-agent/:agentId` en `src/api/routes/cases.routes.js`; usa `isAuth` y `requireRole('admin')`; controlador `removeCaseFromAgent`. |
| Limpieza al borrar User | `deleteUser` usa `$pull` para quitar el usuario de `Case.assignedTo`. |
| Limpieza al borrar Case | `deleteCase` usa `$pull` para quitar el caso de `User.assignedCases`. |
| Seed agentes | `src/utils/seeds/agents.seed.js`; `src/api/data/agents.data.js`. |
| Seed casos | `src/utils/seeds/cases.seed.js`; `src/api/data/cases.data.js`. |
| Seed centralizada | `src/utils/seeds/index.seed.js`; script `seed` en `package.json`. |
| Validacion ObjectId | `src/middlewares/validateObjectId.js` valida parámetros antes de consultar MongoDB. Actualmente se utiliza en algunas rutas. **[PENDIENTE]** Revisar y aplicar de forma consistente en todas las rutas que reciben IDs. |
| CRUD User | `src/api/routes/user.routes.js`; `src/api/controllers/user.controller.js`. |
| CRUD Case | `src/api/routes/cases.routes.js`; `src/api/controllers/case.controller.js`. **[PENDIENTE]** Terminar revisión de duplicados y normalización de `title`. |
| CRUD Agent | `src/api/routes/agents.routes.js`; `src/api/controllers/agent.controller.js`. Incluye listado, búsqueda, creación, actualización y borrado. **[PENDIENTE]** Añadir `GET /api/v1/agents/:id`. |
| Relacion Book-Agent | `src/api/models/Book.js` y endpoints de relación en `src/api/routes/books.routes.js`. **[PENDIENTE]** Revisar el permiso de `PUT /api/v1/books/:bookId/agents/:agentId`. |
| CRUD Book | `src/api/routes/books.routes.js`; `src/api/controllers/book.controller.js`. Incluye listado, creación, actualización, borrado y relaciones con agentes. **[PENDIENTE]** Añadir `GET /api/v1/books/:id`. |
| README | `README.md`: descripcion general, instalacion, dependencias, autenticacion, pruebas y enlaces a documentacion detallada. |
| Notas tecnicas ampliadas | `docs/dev-notes.md`: decisiones de implementacion, permisos, relaciones, Cloudinary, seeds y pendientes tecnicos. |
| Guia de autenticacion | `docs/autenticacion-y-passwords.md`: login, JWT, cambio y recuperacion de contraseña. |
| Guia de pruebas | `docs/pruebas-manuales-insomnia.md`: organizacion, ejecucion y limpieza de las pruebas realizadas con Insomnia. |
