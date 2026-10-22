# API REST de Clasificación de F1 (Clean Architecture)

Proyecto con arquitectura en 3 capas (Controllers -> Services -> Repositories).

La API aplica cabeceras de seguridad con Helmet, registra las peticiones con Morgan y valida los parámetros y cuerpos de las rutas con Zod. Los errores de validación y de negocio se responden de forma centralizada en JSON.

## Instalación

```bash
npm install
npm run dev
```

## Actualizar una base de datos existente

1. Configura `MONGO_URI` en el archivo `.env` para apuntar a la base de datos que quieras actualizar.
2. Desde la carpeta `backend`, ejecuta la migración:

   ```bash
   npm run migrate
   ```

3. Cuando termine correctamente, inicia la API:

   ```bash
   npm run dev
   ```

La migración completa `createdAt`, `updatedAt`, `deletedAt`, `isActive`, `status` y `slug` en los documentos de pilotos y escuderías, sin reemplazar sus otros campos. Es idempotente y puede ejecutarse de nuevo.

> `npm run seed` elimina y vuelve a insertar los datos de prueba. No lo ejecutes si necesitas conservar los datos actuales.
