# Cambios aplicados tras el feedback

Este documento resume las correcciones aplicadas a las observaciones recibidas durante la revisión del proyecto.

| Observación | Estado | Solución aplicada | Evidencia | Prueba |
| --- | --- | --- | --- | --- |
| Cualquier usuario autenticado podía actualizar cualquier caso y modificar relaciones desde `PATCH /cases/:id`. | Implementado | `updateCase` permite editar solo al creador o a un admin y copia únicamente campos incluidos en una lista blanca. | `src/api/controllers/case.controller.js`, `src/api/routes/cases.routes.js` | `test/case.controller.test.js` cubre usuario ajeno, creador, admin y relaciones protegidas. |
| El registro aceptaba campos internos como `assignedCases` aunque forzara el rol `user`. | Implementado | El controlador construye el usuario con `name`, email normalizado y `password`; fuerza `role: 'user'` e inicializa `assignedCases` vacío. | `src/api/controllers/user.controller.js` | `test/user.controller.test.js` comprueba que `role` y `assignedCases` enviados por el cliente se ignoran. |
| Un fallo al borrar una imagen en Cloudinary podía dejar el borrado de usuario a medias. | Implementado | Primero se elimina el usuario, después se limpian sus referencias en casos y la eliminación de la imagen se trata como limpieza no bloqueante. | `src/api/controllers/user.controller.js`, `src/utils/deleteFile.js` | `test/user.controller.test.js` simula un fallo de Cloudinary y verifica el borrado de cuenta y referencias. |