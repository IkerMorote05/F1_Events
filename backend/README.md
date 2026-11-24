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

La migración completa los datos heredados de las entidades existentes, crea perfiles para los usuarios existentes, corrige referencias de rol inválidas, elimina perfiles huérfanos y garantiza el rol estándar `Usuario`, protege las contraseñas con Argon2 y verifica el índice único del SKU de tipos de entrada. Es idempotente y puede ejecutarse de nuevo.

## Autenticación

Configura `JWT_SECRET` con una clave aleatoria de al menos 32 caracteres y, opcionalmente, `JWT_EXPIRES_IN` (por defecto `1h`). `POST /api/auth/login` devuelve públicamente un JWT con el rol vigente. El registro (`POST /api/auth/register`) y el cierre de sesión (`POST /api/auth/logout`) requieren un administrador autenticado. Envía el token como `Authorization: Bearer <token>`; los JWT revocados se almacenan mediante su hash hasta su vencimiento y el middleware rechaza su uso posterior. Solo son públicas las rutas `GET` de escuderías, clasificaciones, circuitos, carreras, ubicaciones, categorías, pilotos, tipos de entrada y variantes. El resto de rutas y métodos, incluido el acceso al perfil, requiere un administrador autenticado.

Las bases de datos existentes deben ejecutar `npm run migrate` para mover nombre, apellidos y avatar a `Profile` y convertir las contraseñas existentes a Argon2. Los datos de prueba incluyen las cuentas/roles `Admin` y `Usuario`; el usuario de prueba conserva la contraseña `123456789`.

## Tipos de entrada

El endpoint `/api/ticket-types` permite consultar, crear, actualizar y eliminar lógicamente tipos de entrada. Cada tipo requiere un SKU único generado automáticamente, referencias a un circuito, una carrera y una variante válida, un precio base diario no negativo (el campo `price` en las solicitudes) y una duración entera de 1 a 3 días. Su campo `estado` admite `Vendida`, `Disponible`, `Reservada`, `Cancelada` o `Reembolsada` y por defecto es `Disponible`. La propiedad `category` referencia una variante que debe tener categorías de entrada y grada. El precio devuelto (`price`) se calcula como precio base diario × duración + precio de la variante; `basePrice` conserva el precio diario para ediciones. Las relaciones se devuelven pobladas y se envían como IDs de MongoDB al crear o actualizar.

Las carreras (`/api/carreras`) admiten los estados `En vigor`, `Cancelada`, `Aplazada` y `Finalizada`; el valor predeterminado es `En vigor`.

## Shop

Las rutas públicas de Shop son `GET /api/shop/home/:resource` (recursos: `categories`, `locations`, `circuits`, `races`, `pilots`, `tickets`, `escuderias` y `localizaciones`), `GET /api/shop` y `GET /api/shop/:slug`. La Home entrega categorías globales y de circuitos por separado; `localizaciones` devuelve ubicaciones usadas por circuitos. Shop List combina tickets disponibles, circuitos, carreras, pilotos y escuderías, y acepta `search`, `type`, `limit` (1–100, por defecto 20), `offset`, `minPrice`, `maxPrice` y filtros por categoría, ubicación/localización, circuito, carrera, piloto, escudería o ticket. Los filtros aceptan ID, slug o nombre, se combinan con AND y cada filtro permite valores separados por comas. La paginación se aplica al catálogo combinado y devuelve `total`, `limit` y `offset`. `GET /api/shop/:slug` busca el SKU del ticket y adjunta los tickets disponibles del mismo circuito y carrera en `variants`.

Las variantes (`/api/variants`) generan el SKU a partir de sus categorías y requieren precio no negativo, porcentaje y referencias a categorías `categoriaEntrada` y `categoriaGrada` existentes. Los tipos de entrada usan `category` para referenciar una variante. El formulario de categorías de circuitos permite administrar ambas clases.

Las variantes también admiten `descripcion` y un `percentage` entre 0 y 100 (hasta dos decimales). En cada circuito, las variantes asociadas mediante tipos de entrada deben sumar exactamente 100 % para mostrar disponibilidad. El porcentaje se aplica a la capacidad de cada carrera y la distribución de unidades enteras usa el método de mayores restos para que las cantidades de variantes sumen la capacidad de la carrera. Los tipos de entrada muestran su asignación individual (cada tipo conserva su propio stock); la variante muestra el total de sus asignaciones por circuito. Mientras el total no sea exactamente 100 %, la disponibilidad se indica como pendiente de configuración.

> `npm run seed` elimina y vuelve a insertar los datos de prueba. No lo ejecutes si necesitas conservar los datos actuales.
