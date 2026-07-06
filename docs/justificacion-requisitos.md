# Justificacion de requisitos

Este documento resume el estado actual del proyecto respecto a los requisitos minimos de la entrega. Las secciones que todavia no estan cubiertas se dejan vacias por el momento.

## Requisitos cubiertos

### Servidor Express con MongoAtlas y minimo de 2 modelos

El proyecto ya levanta un servidor con Express desde `index.js`, conecta con la base de datos mediante Mongoose y usa la variable `DB_URL` para la conexion a MongoDB/MongoAtlas. Tambien existen mas de dos modelos definidos con Mongoose: `User`, `Agent`, `Case` y todavia permanece `Book`.

Actualmente las rutas principales estan montadas bajo `/api/v1/users`, `/api/v1/agents`, `/api/v1/cases` y `/api/v1/books`.

### Campo `image` en usuarios y subida de ficheros con Cloudinary

El modelo `User` incluye un campo obligatorio `image`. El registro de usuarios utiliza un middleware de subida de archivos con Cloudinary mediante `uploadUser.single('image')`. Cuando se crea un usuario con multipart/form-data, el controller asigna la URL generada por Cloudinary a `newUser.image`.

El proyecto tambien separa las subidas de imagenes de usuarios y agentes usando dos configuraciones de storage distintas: `userPortrait` y `agentPortrait`.

### Eliminacion de imagen de Cloudinary al eliminar un usuario

El controller de usuarios elimina la imagen asociada al usuario usando `deleteFile(deletedUser.image)` antes de devolver la respuesta de eliminacion. La utilidad `deleteFile` construye el `publicId` de Cloudinary a partir de la URL y llama a `cloudinary.uploader.destroy`.

### Middleware de autenticacion con JWT

El proyecto ya cuenta con generacion y verificacion de JWT. En login se genera un token con el id del usuario y el middleware `isAuth` verifica el token recibido por headers, busca el usuario correspondiente en MongoDB y lo adjunta a `req.user`.

Algunas rutas ya usan este middleware, por ejemplo rutas de usuarios y casos.

### Roles definidos en el modelo de usuario

El modelo `User` ya incluye el campo `role`, con enum compartido desde `utils/enums.js` y valor por defecto `"user"`. Esto prepara la base para diferenciar permisos entre usuarios normales y administradores.

### Primer administrador creado manualmente en MongoAtlas

El primer administrador ya se ha creado siguiendo el flujo indicado en el enunciado: primero se registro como usuario normal y despues se modifico manualmente su campo `role` a `"admin"` desde MongoAtlas. De esta forma, el proyecto mantiene la regla de que el registro normal crea usuarios con rol de usuario, y el primer admin se obtiene mediante intervencion directa en la base de datos.

### Modelo con datos relacionados

El modelo `Case` ya contiene relaciones con otras colecciones. El campo `assignedAgents` guarda un array de referencias a documentos del modelo `Agent`, y el campo `createdBy` guarda una referencia al modelo `User`.

### Semilla para colecciones

El proyecto ya tiene semillas para agentes y casos. El script principal de seed conecta a la base de datos y ejecuta primero la semilla de agentes y despues la semilla de casos. Este orden permite que los casos puedan guardar referencias reales a agentes ya insertados.

La semilla de casos tambien busca el usuario administrador por email y asigna su `_id` al campo `createdBy`, de modo que los casos seeded quedan relacionados con el usuario admin y con agentes existentes.

### CRUD completo de las colecciones principales

Las colecciones principales del proyecto tienen rutas para crear, leer, actualizar y eliminar datos. `User` tiene registro, login, listado, detalle, actualizacion y eliminacion. `Agent` tiene listado, creacion, actualizacion y eliminacion. `Case` tiene listado, creacion, actualizacion y eliminacion. Estas operaciones estan definidas en sus respectivos routers y controllers.

## Requisitos pendientes

### El modelo de usuarios tiene que tener un array de datos relacionados de otra coleccion


### Los usuarios deben crearse unicamente con rol `"user"`


### Los administradores pueden cambiar el rol de otros usuarios


### Un usuario normal no puede cambiar su propio rol ni el de otros usuarios


### Un usuario puede eliminar su propia cuenta


### Un administrador puede eliminar cualquier cuenta de usuario


### Un usuario normal no puede eliminar cuentas que no sean la suya


### Evitar duplicados en el array relacionado de usuarios sin perder datos anteriores


### README con documentacion completa del proyecto


### Roles de usuario funcionando segun la descripcion completa del proyecto


### Proyecto publico en la entrega


### `.env` incluido para facilitar la correccion


## Tabla de evidencias

| Requisito cubierto | Evidencia |
| --- | --- |
| Servidor Express | `index.js` crea la app con Express, usa `express.json()` y monta las rutas principales. |
| Conexion con MongoDB/MongoAtlas | `src/config/db.js` usa `mongoose.connect(process.env.DB_URL)` y `index.js` llama a `connectDB()`. |
| Minimo de 2 modelos | `src/api/models/User.js`, `src/api/models/Agent.js`, `src/api/models/Case.js` y `src/api/models/Book.js`. |
| Campo `image` en usuarios | `src/api/models/User.js` define `image` como campo obligatorio. |
| Subida de imagen de usuario con Cloudinary | `src/middlewares/file.js` define `uploadUser`; `src/api/routes/user.routes.js` usa `uploadUser.single('image')`; `src/api/controllers/user.controller.js` asigna `req.file.path` a `newUser.image`. |
| Subida de imagen de agente con Cloudinary | `src/middlewares/file.js` define `uploadAgent`; `src/api/routes/agents.routes.js` usa `uploadAgent.single('image')`; `src/api/controllers/agent.controller.js` asigna `req.file.path` a `newAgent.image`. |
| Eliminacion de imagen de usuario en Cloudinary | `src/api/controllers/user.controller.js` llama a `deleteFile(deletedUser.image)` en `deleteUser`; `src/utils/deleteFile.js` usa `cloudinary.uploader.destroy`. |
| Middleware Auth | `src/middlewares/isAuth.js` verifica el token, busca el usuario y lo guarda en `req.user`. |
| JWT | `src/utils/jwt.js` contiene `generateToken` y `verifyToken`; `src/api/controllers/user.controller.js` genera token en login. |
| Roles definidos en User | `src/api/models/User.js` define `role`; `src/utils/enums.js` define `roleEnum`. |
| Primer administrador creado manualmente | El usuario inicial se registro como usuario normal y se modifico manualmente a `admin` desde MongoAtlas, siguiendo la instruccion del enunciado. |
| Relacion Case-Agent | `src/api/models/Case.js` define `assignedAgents` como array de ObjectId con `ref: 'Agent'`. |
| Relacion Case-User | `src/api/models/Case.js` define `createdBy` como ObjectId con `ref: 'User'`. |
| Semilla de agentes | `src/utils/seeds/agents.seed.js` usa `Agent.deleteMany({})` y `Agent.insertMany(agents)`; `src/api/data/agents.data.js` contiene el array de agentes. |
| Semilla de casos con relaciones | `src/utils/seeds/cases.seed.js` busca `User` y `Agent`, construye `casesWithRelations` con `createdBy` y `assignedAgents`, y usa `Case.insertMany(casesWithRelations)`. |
| Script seed centralizado | `src/utils/seeds/index.seed.js` conecta con MongoDB y ejecuta `launchAgentsSeed()` antes de `launchCasesSeed()`; `package.json` define `npm run seed`. |
| CRUD User | `src/api/routes/user.routes.js` define register/login, `GET /`, `GET /:id`, `PUT /:id` y `DELETE /:id`; `src/api/controllers/user.controller.js` contiene las funciones asociadas. |
| CRUD Agent | `src/api/routes/agents.routes.js` define `GET /`, `POST /`, `PUT /:id` y `DELETE /:id`; `src/api/controllers/agent.controller.js` contiene las funciones asociadas. |
| CRUD Case | `src/api/routes/cases.routes.js` define `GET /`, `POST /`, `PUT /:id` y `DELETE /:id`; `src/api/controllers/case.controller.js` contiene las funciones asociadas. |
