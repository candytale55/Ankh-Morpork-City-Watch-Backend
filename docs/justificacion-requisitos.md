En este proyecto deberás volcar todos los conocimientos aprendidos en los módulos de NodeJS y Backend. 

Deberás realizar un servidor con Express utilizando una base de datos de MongoAtlas, creando 2 modelos como mínimo. 

Uno de los modelos será el modelo de los usuarios, el cual obviamente, tendrá un dato relacionado, tendrá que tener un array de datos que vengan de otra colección. 

Los usuarios deberán poder crearse únicamente con el rol "user" 

El primer administrador lo crearemos nosotros modificando el dato desde mongoAtlas directamente. 

Los admins, podrán cambiar el rol de un usuario para hacerlo admin también, pero OJO! Un usuario normal no puede cambiarse a si mismo el rol ni a ningún otro usuario normal! 

Un usuario puede eliminar su propia cuenta, o también puede ser eliminada por un admin, PERO, un usuario no puede eliminar una cuenta de usuario que no sea la suya propia! 

Los usuarios deben tener un campo "image" que nos permita crear el usuario enviándole una imagen de nuestro equipo, la imagen se procesará mediante un middleware de subida de ficheros que haremos con cloudinary. 

Al eliminar la cuenta de usuario se debe eliminar la imagen de cloudinary. 

Donde los usuarios tienen un array de datos relacionados es importante que en ese array no se puedan duplicar los datos, y cuando se envían nuevos datos no se pisen los anteriores, habrá que tener especial cuidado con esto. 

Se deberá realizar una semilla que nos permita subir un array de datos a una de las colecciones 

El proyecto debe estar correctamente documentado, os dejamos esta herramienta para aprender a documentar proyectos en Markdown de manera correcta: https://dillinger.io/ 

El proyecto DEBE estar público en la entrega. 

El .env siempre se suele ocultar y no subir a Github, así que no cojáis esto como costumbre, pero para facilitar la corrección, es preferible que si lo subáis a Github, ya que simplemente es un proyecto para la escuela. ÁNIMO!!!

Requisitos

- Creación de 2 modelos como mínimo

- 1 dato relacionado como mínimo

- Diferentes roles de usuario con diferentes permisos + middleware Auth

- Subida de ficheros con Cloudinary + eliminación de archivo cuando se elimina el dato

- README.md con la documentación del proyecto

- Semilla para una de las colecciones

- Se evitan los duplicados en el array de los usuarios y no se pierde ningún dato

- CRUD completo de todas las colecciones

- Los roles del usuario funcionan de manera correcta como se indica en la descripción del proyecto