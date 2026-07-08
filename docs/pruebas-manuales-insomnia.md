## Pruebas manuales de flujo critico

Base URL local:

```txt
http://localhost:3000
```

Variables recomendadas en Insomnia:

```txt
USER_TOKEN
ADMIN_TOKEN
USER_ID
OTHER_USER_ID
CASE_ID
AGENT_ID
BOOK_ID
```

Resumen de metodos importantes:

- Actualizar usuario: `PUT /api/v1/users/:id`
- Cambiar rol: `PATCH /api/v1/users/:id/role`
- Actualizar caso: `PATCH /api/v1/cases/:id`
- Asignar caso a usuario: `PUT /api/v1/cases/:caseId/assign/:userId`
- Actualizar agente: `PUT /api/v1/agents/:id`
- Actualizar libro: `PUT /api/v1/books/:id`

---

### 1. Register con intento de admin

**Request**

```http
POST /api/v1/users/register
Content-Type: multipart/form-data
```

Enviar campos:

```txt
name: Test User
email: testuser@example.com
password: 123456
role: admin
image: archivo de imagen
```

**Resultado esperado**

- Status `201`.
- El usuario se crea correctamente.
- La respuesta devuelve `role: "user"`, aunque se haya enviado `role: "admin"`.
- La respuesta no devuelve `password`.

---

### 2. Login como usuario normal

**Request**

```http
POST /api/v1/users/login
Content-Type: application/json
```

```json
{
  "email": "testuser@example.com",
  "password": "123456"
}
```

**Resultado esperado**

- Status `200`.
- La respuesta devuelve `token`.
- La respuesta devuelve datos del usuario.
- La respuesta no devuelve `password`.
- Guardar el token como `USER_TOKEN`.

---

### 3. User normal no puede listar usuarios

**Request**

```http
GET /api/v1/users
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede ver la lista de usuarios.

---

### 4. User normal puede ver su propio perfil

**Request**

```http
GET /api/v1/users/me
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `200`.
- Devuelve el usuario autenticado.
- No devuelve `password`.

---

### 5. User normal crea un caso

**Request**

```http
POST /api/v1/cases
Authorization: Bearer USER_TOKEN
Content-Type: application/json
```

```json
{
  "title": "Test case created by normal user",
  "description": "Case created to verify createdBy and assignedTo protections.",
  "type": "case",
  "status": "open",
  "priority": "medium",
  "location": "Ankh-Morpork",
  "reportedBy": "Manual test",
  "suspectName": "Unknown",
  "suspectSpecies": "human",
  "createdBy": "000000000000000000000000",
  "assignedTo": ["000000000000000000000000"]
}
```

**Resultado esperado**

- Status `201`.
- El caso se crea.
- `createdBy` queda con el id real del usuario autenticado.
- `assignedTo` no se rellena desde el body.
- Guardar el `_id` del caso como `CASE_ID`.

---

### 6. User normal puede listar casos

**Request**

```http
GET /api/v1/cases
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `200`.
- Devuelve un array de casos.

---

### 7. User normal puede ver un caso por id

**Request**

```http
GET /api/v1/cases/CASE_ID
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `200`.
- Devuelve el caso indicado.

---

### 8. User normal actualiza un caso con PATCH

**Request**

```http
PATCH /api/v1/cases/CASE_ID
Authorization: Bearer USER_TOKEN
Content-Type: application/json
```

```json
{
  "status": "under investigation",
  "priority": "high",
  "assignedTo": ["000000000000000000000000"],
  "createdBy": "000000000000000000000000"
}
```

**Resultado esperado**

- Status `200`.
- `status` y `priority` se actualizan.
- `assignedTo` no cambia desde esta ruta.
- `createdBy` no cambia desde esta ruta.

---

### 9. User normal no puede asignar casos

**Request**

```http
PUT /api/v1/cases/CASE_ID/assign/USER_ID
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede asignar casos.

---

### 10. Login como admin

**Request**

```http
POST /api/v1/users/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "ADMIN_PASSWORD"
}
```

**Resultado esperado**

- Status `200`.
- Devuelve `token`.
- El usuario tiene `role: "admin"`.
- La respuesta no devuelve `password`.
- Guardar el token como `ADMIN_TOKEN`.

---

### 11. Admin puede listar usuarios

**Request**

```http
GET /api/v1/users
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- Devuelve la lista de usuarios.
- Los usuarios no incluyen `password`.
- Guardar el `_id` del usuario normal como `USER_ID`.

---

### 12. Admin puede ver usuario por id

**Request**

```http
GET /api/v1/users/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- Devuelve el usuario indicado.
- No devuelve `password`.

---

### 13. Admin asigna caso a usuario con PUT

**Request**

```http
PUT /api/v1/cases/CASE_ID/assign/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- La respuesta devuelve el caso actualizado.
- `case.assignedTo` contiene `USER_ID`.
- La respuesta devuelve el usuario actualizado.
- `user.assignedCases` contiene `CASE_ID`.

---

### 14. Admin asigna el mismo caso otra vez

**Request**

```http
PUT /api/v1/cases/CASE_ID/assign/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- `case.assignedTo` no duplica `USER_ID`.
- `user.assignedCases` no duplica `CASE_ID`.

---

### 15. User normal no puede cambiar su rol

**Request**

```http
PUT /api/v1/users/USER_ID
Authorization: Bearer USER_TOKEN
Content-Type: application/json
```

```json
{
  "role": "admin"
}
```

**Resultado esperado**

- Status `403`.
- El usuario conserva `role: "user"`.

---

### 16. Admin puede cambiar rol de usuario

**Request**

```http
PATCH /api/v1/users/USER_ID/role
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "role": "admin"
}
```

**Resultado esperado**

- Status `200`.
- El usuario pasa a tener `role: "admin"`.
- La respuesta no devuelve `password`.

Opcional: volver a dejarlo como user.

```json
{
  "role": "user"
}
```

---

### 17. Admin no puede asignar un rol invalido

**Request**

```http
PATCH /api/v1/users/USER_ID/role
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "role": "superadmin"
}
```

**Resultado esperado**

- Status `400`.
- El rol no cambia.

---

### 18. Agents: GET publico lista agentes

**Request**

```http
GET /api/v1/agents
```

**Resultado esperado**

- Status `200`.
- Devuelve un array de agentes.
- Cada agente contiene datos como `name`, `title`, `organization`, `species`, `gender` e `image`.

---

### 19. Agents: user normal no puede crear agente

**Request**

```http
POST /api/v1/agents
Authorization: Bearer USER_TOKEN
Content-Type: multipart/form-data
```

Enviar campos:

```txt
name: Test Agent
title: Constable
organization: Ankh-Morpork City Watch
gender: unknown
species: human
image: archivo de imagen
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede crear agentes.

---

### 20. Agents: admin crea agente con imagen

**Request**

```http
POST /api/v1/agents
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data
```

Enviar campos:

```txt
name: Test Agent
title: Constable
organization: Ankh-Morpork City Watch
gender: unknown
species: human
image: archivo de imagen
```

**Resultado esperado**

- Status `201`.
- El agente se crea.
- La respuesta incluye `image` con URL de Cloudinary.
- Guardar el `_id` como `AGENT_ID`.

---

### 21. Agents: admin actualiza agente con PUT

**Request**

```http
PUT /api/v1/agents/AGENT_ID
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data
```

Enviar campos:

```txt
name: Test Agent Updated
title: Sergeant
organization: Ankh-Morpork City Watch
gender: unknown
species: human
image: archivo de imagen
```

**Resultado esperado**

- Status `200`.
- El agente se actualiza.
- `name` o `title` reflejan los nuevos datos.

---

### 22. Agents: admin borra agente y elimina imagen

**Request**

```http
DELETE /api/v1/agents/AGENT_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- El agente se elimina.
- La imagen asociada se elimina de Cloudinary.

---

### 23. Books: GET publico lista libros

**Request**

```http
GET /api/v1/books
```

**Resultado esperado**

- Status `200`.
- Devuelve un array de libros.

---

### 24. Books: user normal no puede crear libro

**Request**

```http
POST /api/v1/books
Authorization: Bearer USER_TOKEN
Content-Type: application/json
```

```json
{
  "title": "Guards! Guards!",
  "publishedDate": "1989-01-01",
  "saga": "Discworld"
}
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede crear libros.

---

### 25. Books: admin crea libro

**Request**

```http
POST /api/v1/books
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "title": "Guards! Guards!",
  "publishedDate": "1989-01-01",
  "saga": "Discworld"
}
```

**Resultado esperado**

- Status `201`.
- El libro se crea.
- Guardar el `_id` como `BOOK_ID`.

---

### 26. Books: admin actualiza libro con PUT

**Request**

```http
PUT /api/v1/books/BOOK_ID
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "title": "Guards! Guards! Updated",
  "publishedDate": "1989-01-01",
  "saga": "Discworld - City Watch"
}
```

**Resultado esperado**

- Status `200`.
- El libro se actualiza.
- La respuesta refleja los nuevos datos.

---

### 27. Books: admin borra libro

**Request**

```http
DELETE /api/v1/books/BOOK_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- El libro se elimina.

---

### 28. Borrar caso limpia assignedCases del usuario

**Request**

```http
DELETE /api/v1/cases/CASE_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- El caso se elimina.

Comprobar usuario:

```http
GET /api/v1/users/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- `assignedCases` ya no contiene `CASE_ID`.

---

### 29. Borrar usuario elimina imagen y limpia assignedTo en casos

Crear o usar otro caso asignado al usuario antes de esta prueba.

**Request**

```http
DELETE /api/v1/users/USER_ID
Authorization: Bearer USER_TOKEN
```

o, si lo borra un admin:

```http
DELETE /api/v1/users/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- El usuario se elimina.
- La imagen del usuario se elimina de Cloudinary.
- Los casos donde estaba asignado ya no contienen `USER_ID` en `assignedTo`.

---

### 30. User normal no puede borrar otro usuario

Crear un segundo usuario normal y obtener su id como `OTHER_USER_ID`.

**Request**

```http
DELETE /api/v1/users/OTHER_USER_ID
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede borrar cuentas ajenas.
