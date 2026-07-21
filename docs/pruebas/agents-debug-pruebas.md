# Pruebas de debug temporal en rutas de agents

## Contexto y objetivo
Este documento resume una sesion de debug temporal para investigar una posible duplicacion de agentes durante el ciclo CRUD (create, update, delete).

## Problema que motivo el debug
- Durante pruebas manuales con Insomnia parecia que un `PUT /api/v1/agents/:id` podia terminar en un comportamiento similar a creacion duplicada.
- En paralelo, cuando un update fallaba por validacion (por ejemplo, un `species` fuera del enum), la imagen nueva podia quedar subida en Cloudinary aunque la operacion de base de datos se rechazara.

Objetivo de la sesion:
- Confirmar con evidencia de request real si el update entraba solo por `PUT` o si se disparaba un `POST` no esperado.
- Verificar el ciclo completo `POST -> PUT -> DELETE` para descartar rutas cruzadas.

## Explicacion (resumen tecnico)
1. Sospecha inicial:
Se observo en pruebas manuales que al actualizar un agente parecia crearse otro documento nuevo.

2. Hipotesis y verificacion:
Se agrego un debug temporal para registrar metodo HTTP + URL en cada request de `agents` y confirmar si en el update se estaba ejecutando solo `PUT /api/v1/agents/:id` o tambien un `POST /api/v1/agents/` no esperado.

3. Resultado y conclusion:
En la traza analizada, el ciclo se comporto correctamente: creacion por `POST`, actualizacion por `PUT`, y borrado por `DELETE`, cada uno como llamada independiente. No se detecto una doble llamada automatica en esa corrida.

## Funcion temporal utilizada
```js
// Temporary debug logger for agent routes while diagnosing duplicate creations.
agentsRouter.use((req, res, next) => {
    const params = JSON.stringify(req.params || {});
    const query = JSON.stringify(req.query || {});
    const line = `[AGENTS_DEBUG] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | params=${params} | query=${query}`;

    res.set('X-Agents-Debug', `${req.method} ${req.originalUrl}`);
    console.log(line);

    try {
        fs.appendFileSync(agentsDebugLogPath, `${line}\n`, 'utf8');
    } catch (error) {
        console.error('Could not write agents debug log file', error.message);
    }

    next();
});
```

## Resultado (extracto de agents-debug.log)
```txt
[AGENTS_DEBUG] 2026-07-21T19:10:30.690Z | POST /api/v1/agents/ | params={} | query={}
[AGENTS_DEBUG] 2026-07-21T19:13:07.836Z | PUT /api/v1/agents/6a5fc4275f21f6da9b01b4a2 | params={} | query={}
[AGENTS_DEBUG] 2026-07-21T19:16:08.625Z | DELETE /api/v1/agents/6a5fc4275f21f6da9b01b4a2 | params={} | query={}
```

## Estado final
El debug temporal se elimino del codigo para mantener limpio el backend, y se conservaron solo los cambios funcionales permanentes (validaciones y rollback de imagen en errores).
