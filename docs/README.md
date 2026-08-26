# Documentacion del proyecto

Esta carpeta concentra la documentacion funcional, tecnica y de pruebas del backend.

## Indice de documentos

- [justificacion-requisitos.md](justificacion-requisitos.md)
  - Documento de cumplimiento de requisitos escolares.
  - Mantiene el orden solicitado por la escuela.
  - Indica donde se implementa cada requisito y señala con **[PENDIENTE]** los puntos que aun deben completarse o comprobarse.

- [dev-notes.md](dev-notes.md)
  - Notas tecnicas del proyecto.
  - Explica decisiones de implementacion, permisos, relaciones de datos, Cloudinary, seeds y consideraciones de arquitectura.
  - Incluye los pendientes tecnicos conocidos antes de la entrega.

- [autenticacion-y-passwords.md](autenticacion-y-passwords.md)
  - Explica login y autenticacion mediante JWT.
  - Documenta el cambio y recuperacion de contraseña.
  - Describe el uso del token temporal y Nodemailer.

- [pruebas-manuales-insomnia.md](pruebas-manuales-insomnia.md)
  - Guia para ejecutar las pruebas de la API con Insomnia.
  - Explica el orden de ejecucion, variables temporales y scripts `After-response`.
  - Identifica las comprobaciones que todavia requieren revision manual.

## Carpetas de apoyo

- [shots/](shots)
  - Capturas del frontend y de los flujos documentados.

## Estado de la documentacion

La documentacion se esta revisando durante la ultima fase de correccion del proyecto.

Los marcadores **[PENDIENTE]** identifican funcionalidades, pruebas o comprobaciones que todavia deben revisarse antes de la entrega final.

**[PENDIENTE]** Añadir las capturas definitivas del flujo de recuperacion de contraseña.

**[PENDIENTE]** Revisar y eliminar los marcadores que ya no correspondan despues de la ultima ejecucion completa de pruebas.