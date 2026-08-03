# Pruebas manuales con Insomnia

> ## TL;DR
>
>Ejecuta las carpetas de Insomnia en orden y las solicitudes de cada carpeta de arriba hacia abajo. Los primeros tests crean y guardan automáticamente los usuarios, tokens, agentes, libros y casos necesarios; los tests posteriores reutilizan esas variables para comprobar permisos, actualizaciones, asignaciones y relaciones entre colecciones.
>
>No continúes si falla una solicitud de preparación, ya que las siguientes podrían usar variables antiguas o inexistentes. Al terminar, ejecuta la sección de limpieza para eliminar todos los datos temporales y conservar únicamente el usuario Admin y los datos originales de las semillas.






## Objetivo

La colección de Insomnia comprueba manualmente los principales flujos de la API Ankh-Morpork City Watch:

* Registro, autenticación y autorización de usuarios.
* Actualización de perfiles, imágenes, roles y contraseñas.
* Recuperación de contraseña mediante correo electrónico.
* CRUD de agentes, libros y casos.
* Asignación de casos a usuarios.
* Asignación de agentes a casos y libros.
* Validación de relaciones entre colecciones.
* Eliminación de imágenes en Cloudinary.
* Limpieza de referencias al eliminar documentos.

Las solicitudes están organizadas por casos de uso y sus nombres indican la operación y el resultado esperado. No constituyen una suite automatizada: el estado HTTP, la respuesta, las relaciones y los cambios en Cloudinary deben verificarse manualmente.

## Requisitos previos

Antes de ejecutar las pruebas:

1. Instalar las dependencias:

```bash
npm install
```

2. Configurar las variables del proyecto en `.env`.

3. Iniciar el servidor:

```bash
npm run dev
```

4. Confirmar que la API responde en:

```text
http://localhost:3000
```

5. Confirmar que existe un usuario Admin funcional. Sus credenciales se facilitan de forma privada y no se incluyen en el repositorio.

6. Ejecutar las semillas cuando sea necesario:

```bash
npm run seed
```

Las semillas proporcionan los agentes de referencia utilizados por varias solicitudes.

## Importación de la colección

Importar en Insomnia el archivo exportado en formato **Insomnia 5**.

Después de importarlo, revisar el `Base Environment`. Inicialmente debe contener únicamente:

```json
{
  "PORT": "http://localhost:3000",
  "ADMIN_ID": "<id-del-admin>"
}
```

Los tokens y los IDs temporales se crean mediante los scripts `After-response` durante la ejecución.

No deben conservarse en el archivo exportado:

* Tokens JWT.
* IDs de usuarios, agentes, libros o casos temporales.
* Contraseñas reales.
* Tokens de recuperación de contraseña.

## Imágenes locales

Las solicitudes `multipart/form-data` contienen campos de imagen. Las rutas locales exportadas por Insomnia pertenecen al equipo donde se creó la colección y no son portables.

Antes de ejecutar una solicitud con imagen, seleccionar manualmente un archivo disponible en el equipo actual.

Las comprobaciones relacionadas con Cloudinary incluyen:

* La imagen se guarda al crear el documento.
* Una imagen nueva sustituye a la anterior.
* La imagen anterior se elimina al actualizar.
* La imagen se elimina al borrar el documento.
* Una operación fallida no deja archivos huérfanos.

Estas comprobaciones requieren revisar Cloudinary manualmente.

## Orden de ejecución

Ejecutar las carpetas en este orden:

```text
00 Setup and References
01 Users
02 Passwords
03 Agents
04 Books
05 Cases
06 Clean-up
```

Dentro de cada carpeta, ejecutar las solicitudes de arriba hacia abajo.

### 00 Setup and References

Esta sección:

* Inicia sesión como Admin.
* Guarda `ADMIN_TOKEN`.
* Localiza los agentes creados por las semillas.
* Guarda sus IDs para las pruebas posteriores.

Si alguna solicitud de esta sección falla, no continuar hasta corregir la configuración o las semillas.

### 01 Users

Comprueba:

* Registro forzado con rol `user`.
* Rechazo de emails duplicados.
* Login correcto e incorrecto.
* Acceso a `/users/me`.
* Permisos de usuario y Admin.
* Actualización de datos e imagen.
* Cambio de roles.
* Eliminación propia y eliminación administrativa.

Sus subsecciones crean y eliminan sus propios usuarios temporales.

### 02 Passwords

Incluye:

* Cambio autenticado de contraseña.
* Validación de confirmación.
* Rechazo de la contraseña actual incorrecta.
* Login con contraseña antigua y nueva.
* Recuperación mediante correo electrónico.

La recuperación de contraseña requiere copiar manualmente el token recibido por correo y colocarlo en la ruta de reset antes de ejecutar la solicitud.

### 03 Agents

Comprueba:

* Lectura pública.
* Restricciones para usuarios normales.
* Creación y actualización por Admin.
* Sustitución de imágenes.
* Validaciones del esquema.
* Prevención de duplicados cuando corresponda.

Algunos agentes temporales permanecen disponibles para las pruebas de Books y Cases y se eliminan en `06 Clean-up`.

### 04 Books

Comprueba:

* Lectura pública.
* Restricciones de creación y modificación.
* Creación y actualización.
* Asignación y eliminación de agentes.
* Prevención de relaciones duplicadas.
* Validación de IDs relacionados.

El usuario normal creado para esta sección debe eliminarse antes de comenzar `05 Cases`.

### 05 Cases

Es el flujo integrado principal. Comprueba:

* Acceso con y sin autenticación.
* Creación y actualización de casos.
* Protección de `createdBy`.
* Asignación de casos a usuarios.
* Sincronización entre `Case.assignedTo` y `User.assignedCases`.
* Asignación y desasignación de agentes.
* Prevención de relaciones duplicadas.
* Limpieza de relaciones al eliminar casos o usuarios.

Después de una asignación o eliminación, consultar nuevamente los documentos relacionados para confirmar el estado de ambos lados de la relación.

### 06 Clean-up

Eliminar únicamente los recursos temporales que sigan existiendo.

Orden recomendado:

```text
1. Cases
2. Books
3. Users
4. Agents
```

Los datos de las semillas y el usuario Admin deben permanecer intactos.

Las solicitudes de recuperación para ejecuciones interrumpidas deben guardarse en una carpeta separada llamada:

```text
Emergency cleanup — do not run normally
```

## Interpretación de respuestas

Como referencia general:

```text
200 / 201  Operación correcta
400        Datos o identificadores inválidos
401        Token ausente, inválido o expirado
403        Usuario autenticado sin permisos
404        Ruta o recurso inexistente
```

Un ID puede tener un formato correcto y no existir en MongoDB. Por ello se comprueban por separado:

```text
ID mal formado                  → 400
ID válido pero inexistente      → 404
ID existente                    → operación correcta
```

## Variables temporales

Los scripts de Insomnia guardan variables como:

```text
ADMIN_TOKEN
USER_1_ID
USER_1_TOKEN
CASE_CLACKS
CASE_GUILD
BK_GUARDS
VIMES
CARROT
```

Las pruebas negativas no deben sobrescribir las variables de los recursos válidos.

Los deletes eliminan sus variables mediante `environment.unset()` cuando la operación termina correctamente.

Si una solicitud de preparación falla, no continuar utilizando valores que hayan quedado de una ejecución anterior. Limpiar el entorno y repetir la sección desde el principio.

## Estado esperado al terminar

Después del cleanup:

* No quedan usuarios temporales.
* No quedan casos de prueba.
* No quedan libros de prueba.
* No quedan agentes temporales.
* Los agentes de las semillas permanecen disponibles.
* El usuario Admin permanece disponible.
* El entorno de Insomnia conserva únicamente `PORT` y `ADMIN_ID`.
