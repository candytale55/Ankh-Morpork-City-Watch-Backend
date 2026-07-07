## Pruebas manuales de flujo crítico

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

### 2. Login

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

Guardar el token como `USER_TOKEN`.

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

### 6. User normal no puede asignar casos

**Request**

```http
PATCH /api/v1/cases/CASE_ID/assign/USER_ID
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede asignar casos.

---

### 7. Login como admin

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

Guardar el token como `ADMIN_TOKEN`.

---

### 8. Admin puede listar usuarios

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

### 9. Admin asigna caso a usuario

**Request**

```http
PATCH /api/v1/cases/CASE_ID/assign/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- La respuesta devuelve el caso actualizado.
- `case.assignedTo` contiene `USER_ID`.
- La respuesta devuelve el usuario actualizado.
- `user.assignedCases` contiene `CASE_ID`.

---

### 10. Admin asigna el mismo caso otra vez

**Request**

```http
PATCH /api/v1/cases/CASE_ID/assign/USER_ID
Authorization: Bearer ADMIN_TOKEN
```

**Resultado esperado**

- Status `200`.
- `case.assignedTo` no duplica `USER_ID`.
- `user.assignedCases` no duplica `CASE_ID`.

---

### 11. User normal no puede cambiar su rol

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

### 12. Admin puede cambiar rol de usuario

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

### 13. Admin no puede asignar un rol inválido

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

### 14. Borrar caso limpia assignedCases del usuario

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

### 15. Borrar usuario elimina imagen y limpia assignedTo en casos

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

### 16. User normal no puede borrar otro usuario

Crear un segundo usuario normal y obtener su id como `OTHER_USER_ID`.

**Request**

```http
DELETE /api/v1/users/OTHER_USER_ID
Authorization: Bearer USER_TOKEN
```

**Resultado esperado**

- Status `403`.
- El usuario normal no puede borrar cuentas ajenas.
