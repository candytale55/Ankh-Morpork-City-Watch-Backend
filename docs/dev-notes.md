# Dev notes

Notas de implementacion y decisiones tecnicas del proyecto.

## Autenticacion y permisos

La autenticacion se maneja con JWT. Cuando un usuario hace login, `user.controller.js` genera un token con el id del usuario. En las rutas protegidas, `isAuth` verifica el token, busca el usuario en MongoDB y guarda ese usuario en `req.user`.

La autorizacion por rol se separa en `requireRole`. Este middleware recibe un rol requerido, por ejemplo `requireRole('admin')`, y comprueba que exista `req.user` y que su `role` coincida. Por eso siempre debe usarse despues de `isAuth`.

Ejemplo:

```js
usersRouter.patch('/:id/role', isAuth, requireRole('admin'), updateUserRole);
```

Esto deja claro que solo un usuario autenticado con rol admin puede cambiar roles.

## Cambio de roles

El cambio de rol se separo en una ruta especifica:

```txt
PATCH /api/v1/users/:id/role
```

La decision se tomo para no mezclar la actualizacion normal del perfil con una accion sensible de permisos. `PUT /users/:id` actualiza datos generales y elimina `role` del body con `delete req.body.role`, de modo que un usuario normal no pueda elevar sus permisos usando la ruta general.

La ruta de roles usa `requireRole('admin')`, por lo que un usuario normal recibe `403 Forbidden`.

## Eliminacion de usuarios

La ruta de borrado no usa `requireRole('admin')` directamente porque el requisito permite dos casos:

- un usuario puede borrar su propia cuenta;
- un admin puede borrar cualquier cuenta.

Por eso la comprobacion vive en `deleteUser`. El controller calcula:

```js
const isAdmin = req.user.role === 'admin';
const isSameUser = req.user._id.toString() === id;
```

Si no es admin ni propietario de la cuenta, responde `403`. Si esta autorizado, borra la imagen de Cloudinary y despues elimina el documento de usuario.

## Books

`Book` se conserva como material de referencia y consulta. Cualquier usuario puede hacer `GET`, pero crear, editar y borrar libros requiere autenticacion y rol admin.

## Cloudinary

El proyecto usa dos configuraciones de subida en `file.js`:

- `uploadUser`, que guarda imagenes en `userPortrait`;
- `uploadAgent`, que guarda imagenes en `agentPortrait`.

El campo usado por la API es `image`. En multipart/form-data, el archivo debe enviarse con ese nombre de campo.

Cuando se elimina un usuario o agente, se llama a `deleteFile`, que obtiene el `publicId` desde la URL y usa `cloudinary.uploader.destroy`.

## Seeds

Las semillas se separaron por responsabilidad:

- `agents.data.js` contiene los datos base de agentes.
- `cases.data.js` contiene los datos base de casos, sin ids de MongoDB.
- `agents.seed.js` limpia e inserta agentes.
- `cases.seed.js` busca el admin y agentes ya insertados para construir relaciones.
- `index.seed.js` conecta a MongoDB y ejecuta las semillas en orden.

El orden es importante:

```txt
1. seed agents
2. seed cases
```

Los casos necesitan ids reales de agentes, por eso `cases.seed.js` se ejecuta despues de `agents.seed.js`.

`cases.data.js` no incluye `createdBy` ni `assignedAgents` porque esos valores dependen de documentos reales en MongoDB. Antes de insertar, `cases.seed.js` crea `casesWithRelations`, anadiendo:

- `createdBy: adminUser._id`
- `assignedAgents: [agentId, agentId]`

Asi los documentos cumplen el schema de `Case` al momento de insertarse.

## Primer admin

El primer admin se crea siguiendo el enunciado: se registra como usuario normal y luego se cambia manualmente su `role` a `"admin"` desde MongoAtlas. No se seedearon usuarios para evitar sobrescribir o borrar accidentalmente ese primer admin.

## Pendiente: array relacionado en User

El requisito pide que `User` tenga un array con datos relacionados de otra coleccion y que no haya duplicados ni perdida de datos anteriores. La opcion prevista es agregar un array como `createdCases` con referencias a `Case`.

Cuando se implemente, las actualizaciones deberian usar `$addToSet` para evitar duplicados sin pisar los valores existentes.
