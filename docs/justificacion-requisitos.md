# Justificacion de requisitos

Guia breve para localizar la evidencia de los requisitos implementados. Los requisitos pendientes se dejan sin justificar hasta que esten cerrados.

## Requisitos cubiertos

- Servidor Express conectado a MongoDB/MongoAtlas.
- Minimo de dos modelos: `User`, `Agent`, `Case` y `Book`.
- Campo `image` en usuarios, subida con Cloudinary y eliminacion de imagen al borrar usuario.
- Middleware de autenticacion con JWT.
- Roles `user` y `admin` definidos en el modelo de usuario.
- Primer administrador creado manualmente en MongoAtlas.
- Admin puede cambiar el rol de otros usuarios mediante ruta protegida.
- Usuario normal no puede cambiar su propio rol ni el de otros usuarios.
- Usuario puede eliminar su propia cuenta.
- Admin puede eliminar cuentas de usuarios.
- Usuario normal no puede eliminar cuentas ajenas.
- Modelo `Case` con relaciones a `Agent` y `User`.
- Semillas de agentes y casos, incluyendo relaciones en los casos seeded.
- CRUD implementado en las colecciones principales: users, agents, cases y books.

## Requisitos pendientes

### El modelo de usuarios tiene que tener un array de datos relacionados de otra coleccion


### Los usuarios deben crearse unicamente con rol `"user"`


### Evitar duplicados en el array relacionado de usuarios sin perder datos anteriores


### README con documentacion completa del proyecto


### Roles de usuario funcionando segun la descripcion completa del proyecto


### Proyecto publico en la entrega


### `.env` incluido para facilitar la correccion


## Tabla de evidencias

| Requisito | Evidencia |
| --- | --- |
| Servidor Express | `index.js` crea la app, usa `express.json()` y monta rutas bajo `/api/v1`. |
| Conexion MongoDB/MongoAtlas | `src/config/db.js`; `index.js` llama a `connectDB()`. |
| Minimo de 2 modelos | `src/api/models/User.js`, `Agent.js`, `Case.js`, `Book.js`. |
| Campo `image` en usuario | `src/api/models/User.js`. |
| Upload Cloudinary usuario | `src/middlewares/file.js`, `src/api/routes/user.routes.js`, `src/api/controllers/user.controller.js`. |
| Eliminacion imagen usuario | `src/api/controllers/user.controller.js` usa `deleteFile(deletedUser.image)`; `src/utils/deleteFile.js`. |
| Middleware Auth/JWT | `src/middlewares/isAuth.js`; `src/utils/jwt.js`; login en `src/api/controllers/user.controller.js`. |
| Roles user/admin | `src/api/models/User.js`; `src/utils/enums.js`. |
| Primer admin manual | Usuario inicial registrado como `user` y modificado manualmente a `admin` en MongoAtlas. |
| Admin cambia roles | `PATCH /api/v1/users/:id/role` en `src/api/routes/user.routes.js`; `updateUserRole` en `user.controller.js`; `requireRole('admin')`. |
| User normal no cambia roles | `PUT /api/v1/users/:id` borra `req.body.role`; `PATCH /:id/role` requiere admin. |
| User borra su cuenta / admin borra usuarios | `deleteUser` compara `req.user._id` con `req.params.id` y revisa `req.user.role`. |
| User normal no borra cuentas ajenas | `deleteUser` devuelve `403` si no es admin ni propietario de la cuenta. |
| Relacion Case-Agent | `src/api/models/Case.js` define `assignedAgents` con `ref: 'Agent'`. |
| Relacion Case-User | `src/api/models/Case.js` define `createdBy` con `ref: 'User'`. |
| Seed agentes | `src/utils/seeds/agents.seed.js`; `src/api/data/agents.data.js`. |
| Seed casos con relaciones | `src/utils/seeds/cases.seed.js`; `src/api/data/cases.data.js`. |
| Seed centralizado | `src/utils/seeds/index.seed.js`; script `seed` en `package.json`. |
| CRUD User | `src/api/routes/user.routes.js`; `src/api/controllers/user.controller.js`. |
| CRUD Agent | `src/api/routes/agents.routes.js`; `src/api/controllers/agent.controller.js`. |
| CRUD Case | `src/api/routes/cases.routes.js`; `src/api/controllers/case.controller.js`. |
| CRUD Book | `src/api/routes/books.routes.js`; `src/api/controllers/book.controller.js`. |
