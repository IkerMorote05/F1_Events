const swaggerUi = require('swagger-ui-express');

const apiResponse = (description, schema = { type: 'object' }) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', example: 'success' },
          data: schema,
          message: { type: 'string' },
        },
      },
    },
  },
});

const errorResponse = {
  description: 'Error de validación o recurso no encontrado',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const slugParameter = {
  name: 'slug',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'Slug del recurso (también admite ID de MongoDB en la consulta)',
};

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
  description: 'ID de MongoDB',
};

const requestBody = (schema, description) => ({
  required: true,
  description,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'F1 Drivers & Standing API',
    version: '1.2.0',
    description: 'API REST para gestionar escuderías, pilotos y clasificación de Fórmula 1.',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}/api`,
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Pilotos', description: 'Gestión de pilotos' },
    { name: 'Escuderías', description: 'Gestión de escuderías' },
    { name: 'Circuitos', description: 'Gestión de circuitos' },
    { name: 'Carreras', description: 'Gestión de carreras' },
    { name: 'Clasificación', description: 'Clasificación del campeonato' },
    { name: 'Imágenes', description: 'Gestión de imágenes y sus entidades asociadas' },
    { name: 'Ubicaciones', description: 'Gestión de ubicaciones' },
    { name: 'Variantes', description: 'Gestión de variantes' },
    { name: 'Usuarios', description: 'Gestión de usuarios' },
    { name: 'Roles', description: 'Gestión de roles' },
  ],
  paths: {
    '/pilotos': {
      get: {
        tags: ['Pilotos'],
        summary: 'Obtener todos los pilotos',
        responses: {
          200: apiResponse('Lista de pilotos', {
            type: 'array',
            items: { $ref: '#/components/schemas/Piloto' },
          }),
        },
      },
      post: {
        tags: ['Pilotos'],
        summary: 'Crear un piloto',
        requestBody: requestBody('PilotoCreate', 'Datos del piloto'),
        responses: {
          201: apiResponse('Piloto creado', { $ref: '#/components/schemas/Piloto' }),
          400: errorResponse,
        },
      },
    },
    '/pilotos/{slug}': {
      get: {
        tags: ['Pilotos'],
        summary: 'Obtener un piloto por slug o ID heredado',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Piloto encontrado', { $ref: '#/components/schemas/Piloto' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Pilotos'],
        summary: 'Actualizar un piloto por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        requestBody: requestBody('PilotoUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Piloto actualizado', { $ref: '#/components/schemas/Piloto' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Pilotos'],
        summary: 'Eliminar lógicamente un piloto por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        responses: {
          200: apiResponse('Piloto eliminado'),
          404: errorResponse,
        },
      },
    },
    '/pilotos/{slug}/soft-delete': {
      patch: {
        tags: ['Pilotos'],
        summary: 'Eliminar lógicamente un piloto por slug',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Piloto eliminado', { $ref: '#/components/schemas/Piloto' }),
          404: errorResponse,
        },
      },
    },
    '/pilotos/{slug}/is-active': {
      patch: {
        tags: ['Pilotos'],
        summary: 'Cambiar el estado activo de un piloto',
        parameters: [slugParameter],
        requestBody: requestBody('IsActiveUpdate', 'Nuevo estado activo'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Piloto' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/pilotos/{slug}/status': {
      patch: {
        tags: ['Pilotos'],
        summary: 'Actualizar el estado textual de un piloto',
        parameters: [slugParameter],
        requestBody: requestBody('StatusUpdate', 'Nuevo estado'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Piloto' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/pilotos/{slug}/restore-delete': {
      patch: {
        tags: ['Pilotos'],
        summary: 'Restaurar un piloto eliminado',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Piloto restaurado', { $ref: '#/components/schemas/Piloto' }),
          404: errorResponse,
        },
      },
    },
    '/escuderias': {
      get: {
        tags: ['Escuderías'],
        summary: 'Obtener todas las escuderías',
        responses: {
          200: apiResponse('Lista de escuderías', {
            type: 'array',
            items: { $ref: '#/components/schemas/Escuderia' },
          }),
        },
      },
      post: {
        tags: ['Escuderías'],
        summary: 'Crear una escudería',
        requestBody: requestBody('EscuderiaCreate', 'Datos de la escudería'),
        responses: {
          201: apiResponse('Escudería creada', { $ref: '#/components/schemas/Escuderia' }),
          400: errorResponse,
        },
      },
    },
    '/escuderias/{slug}': {
      get: {
        tags: ['Escuderías'],
        summary: 'Obtener una escudería por slug o ID heredado',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Escudería encontrada', { $ref: '#/components/schemas/Escuderia' }),
          404: errorResponse,
        },
      },
      put: {
        tags: ['Escuderías'],
        summary: 'Actualizar una escudería por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        requestBody: requestBody('EscuderiaUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Escudería actualizada', { $ref: '#/components/schemas/Escuderia' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Escuderías'],
        summary: 'Eliminar lógicamente una escudería por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        responses: {
          200: apiResponse('Escudería eliminada'),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/escuderias/{slug}/soft-delete': {
      patch: {
        tags: ['Escuderías'],
        summary: 'Eliminar lógicamente una escudería por slug',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Escudería eliminada', { $ref: '#/components/schemas/Escuderia' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/escuderias/{slug}/is-active': {
      patch: {
        tags: ['Escuderías'],
        summary: 'Cambiar el estado activo de una escudería',
        parameters: [slugParameter],
        requestBody: requestBody('IsActiveUpdate', 'Nuevo estado activo'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Escuderia' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/escuderias/{slug}/status': {
      patch: {
        tags: ['Escuderías'],
        summary: 'Actualizar el estado textual de una escudería',
        parameters: [slugParameter],
        requestBody: requestBody('StatusUpdate', 'Nuevo estado'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Escuderia' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/escuderias/{slug}/restore-delete': {
      patch: {
        tags: ['Escuderías'],
        summary: 'Restaurar una escudería eliminada',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Escudería restaurada', { $ref: '#/components/schemas/Escuderia' }),
          404: errorResponse,
        },
      },
    },
    '/circuitos': {
      get: {
        tags: ['Circuitos'],
        summary: 'Obtener todos los circuitos',
        responses: {
          200: apiResponse('Lista de circuitos', {
            type: 'array',
            items: { $ref: '#/components/schemas/Circuito' },
          }),
        },
      },
      post: {
        tags: ['Circuitos'],
        summary: 'Crear un circuito',
        requestBody: requestBody('CircuitoCreate', 'Datos del circuito'),
        responses: {
          201: apiResponse('Circuito creado', { $ref: '#/components/schemas/Circuito' }),
          400: errorResponse,
        },
      },
    },
    '/circuitos/{slug}': {
      get: {
        tags: ['Circuitos'],
        summary: 'Obtener un circuito por slug o ID',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Circuito encontrado', { $ref: '#/components/schemas/Circuito' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Circuitos'],
        summary: 'Actualizar un circuito por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        requestBody: requestBody('CircuitoUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Circuito actualizado', { $ref: '#/components/schemas/Circuito' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Circuitos'],
        summary: 'Eliminar lógicamente un circuito por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        responses: {
          200: apiResponse('Circuito eliminado'),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/circuitos/{slug}/soft-delete': {
      patch: {
        tags: ['Circuitos'],
        summary: 'Eliminar lógicamente un circuito por slug',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Circuito eliminado', { $ref: '#/components/schemas/Circuito' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/circuitos/{slug}/is-active': {
      patch: {
        tags: ['Circuitos'],
        summary: 'Cambiar el estado activo de un circuito',
        parameters: [slugParameter],
        requestBody: requestBody('IsActiveUpdate', 'Nuevo estado activo'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Circuito' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/circuitos/{slug}/status': {
      patch: {
        tags: ['Circuitos'],
        summary: 'Actualizar el estado textual de un circuito',
        parameters: [slugParameter],
        requestBody: requestBody('StatusUpdate', 'Nuevo estado'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Circuito' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/circuitos/{slug}/restore-delete': {
      patch: {
        tags: ['Circuitos'],
        summary: 'Restaurar un circuito eliminado',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Circuito restaurado', { $ref: '#/components/schemas/Circuito' }),
          404: errorResponse,
        },
      },
    },
    '/carreras': {
      get: {
        tags: ['Carreras'],
        summary: 'Obtener todas las carreras',
        responses: {
          200: apiResponse('Lista de carreras', {
            type: 'array',
            items: { $ref: '#/components/schemas/Carrera' },
          }),
        },
      },
      post: {
        tags: ['Carreras'],
        summary: 'Crear una carrera',
        requestBody: requestBody('CarreraCreate', 'Datos de la carrera'),
        responses: {
          201: apiResponse('Carrera creada', { $ref: '#/components/schemas/Carrera' }),
          400: errorResponse,
        },
      },
    },
    '/carreras/{slug}': {
      get: {
        tags: ['Carreras'],
        summary: 'Obtener una carrera por slug o ID',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Carrera encontrada', { $ref: '#/components/schemas/Carrera' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Carreras'],
        summary: 'Actualizar una carrera por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        requestBody: requestBody('CarreraUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Carrera actualizada', { $ref: '#/components/schemas/Carrera' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Carreras'],
        summary: 'Eliminar lógicamente una carrera por ID',
        parameters: [{ ...idParameter, name: 'slug', description: 'ID de MongoDB' }],
        responses: {
          200: apiResponse('Carrera eliminada'),
          404: errorResponse,
        },
      },
    },
    '/carreras/{slug}/soft-delete': {
      patch: {
        tags: ['Carreras'],
        summary: 'Eliminar lógicamente una carrera por slug',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Carrera eliminada', { $ref: '#/components/schemas/Carrera' }),
          404: errorResponse,
        },
      },
    },
    '/carreras/{slug}/is-active': {
      patch: {
        tags: ['Carreras'],
        summary: 'Cambiar el estado activo de una carrera',
        parameters: [slugParameter],
        requestBody: requestBody('IsActiveUpdate', 'Nuevo estado activo'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Carrera' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/carreras/{slug}/status': {
      patch: {
        tags: ['Carreras'],
        summary: 'Actualizar el estado textual de una carrera',
        parameters: [slugParameter],
        requestBody: requestBody('StatusUpdate', 'Nuevo estado'),
        responses: {
          200: apiResponse('Estado actualizado', { $ref: '#/components/schemas/Carrera' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/carreras/{slug}/restore-delete': {
      patch: {
        tags: ['Carreras'],
        summary: 'Restaurar una carrera eliminada',
        parameters: [slugParameter],
        responses: {
          200: apiResponse('Carrera restaurada', { $ref: '#/components/schemas/Carrera' }),
          404: errorResponse,
        },
      },
    },
    '/images': {
      get: {
        tags: ['Imágenes'],
        summary: 'Obtener imágenes',
        responses: {
          200: apiResponse('Lista de imágenes', {
            type: 'array',
            items: { $ref: '#/components/schemas/Image' },
          }),
        },
      },
      post: {
        tags: ['Imágenes'],
        summary: 'Crear una imagen',
        requestBody: requestBody('ImageCreate', 'Datos de la imagen'),
        responses: {
          201: apiResponse('Imagen creada', { $ref: '#/components/schemas/Image' }),
          400: errorResponse,
        },
      },
    },
    '/images/entity/{entityType}/{entityId}': {
      get: {
        tags: ['Imágenes'],
        summary: 'Obtener imágenes de una entidad',
        parameters: [
          { name: 'entityType', in: 'path', required: true, schema: { type: 'string' } },
          { ...idParameter, name: 'entityId' },
        ],
        responses: {
          200: apiResponse('Imágenes de la entidad'),
          400: errorResponse,
        },
      },
    },
    '/images/{identifier}': {
      get: {
        tags: ['Imágenes'],
        summary: 'Obtener una imagen por ID o slug',
        parameters: [{ ...slugParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Imagen encontrada', { $ref: '#/components/schemas/Image' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Imágenes'],
        summary: 'Actualizar una imagen por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        requestBody: requestBody('ImageUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Imagen actualizada', { $ref: '#/components/schemas/Image' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Imágenes'],
        summary: 'Eliminar una imagen por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Imagen eliminada', { $ref: '#/components/schemas/Image' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/locations': {
      get: {
        tags: ['Ubicaciones'],
        summary: 'Obtener ubicaciones',
        responses: {
          200: apiResponse('Lista de ubicaciones', {
            type: 'array',
            items: { $ref: '#/components/schemas/Location' },
          }),
        },
      },
      post: {
        tags: ['Ubicaciones'],
        summary: 'Crear una ubicación',
        requestBody: requestBody('LocationCreate', 'Datos de la ubicación'),
        responses: {
          201: apiResponse('Ubicación creada', { $ref: '#/components/schemas/Location' }),
          400: errorResponse,
        },
      },
    },
    '/locations/{identifier}': {
      get: {
        tags: ['Ubicaciones'],
        summary: 'Obtener una ubicación por ID o slug',
        parameters: [{ ...slugParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Ubicación encontrada', { $ref: '#/components/schemas/Location' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Ubicaciones'],
        summary: 'Actualizar una ubicación por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        requestBody: requestBody('LocationUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Ubicación actualizada', { $ref: '#/components/schemas/Location' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Ubicaciones'],
        summary: 'Eliminar una ubicación por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Ubicación eliminada', { $ref: '#/components/schemas/Location' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/variants': {
      get: {
        tags: ['Variantes'],
        summary: 'Obtener variantes',
        responses: {
          200: apiResponse('Lista de variantes', {
            type: 'array',
            items: { $ref: '#/components/schemas/Variant' },
          }),
        },
      },
      post: {
        tags: ['Variantes'],
        summary: 'Crear una variante',
        requestBody: requestBody('VariantCreate', 'Datos de la variante'),
        responses: {
          201: apiResponse('Variante creada', { $ref: '#/components/schemas/Variant' }),
          400: errorResponse,
        },
      },
    },
    '/variants/{identifier}': {
      get: {
        tags: ['Variantes'],
        summary: 'Obtener una variante por ID o slug',
        parameters: [{ ...slugParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Variante encontrada', { $ref: '#/components/schemas/Variant' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Variantes'],
        summary: 'Actualizar una variante por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        requestBody: requestBody('VariantUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Variante actualizada', { $ref: '#/components/schemas/Variant' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Variantes'],
        summary: 'Eliminar una variante por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Variante eliminada', { $ref: '#/components/schemas/Variant' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuarios',
        responses: {
          200: apiResponse('Lista de usuarios', {
            type: 'array',
            items: { $ref: '#/components/schemas/Usuario' },
          }),
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear un usuario',
        requestBody: requestBody('UsuarioCreate', 'Datos del usuario'),
        responses: {
          201: apiResponse('Usuario creado', { $ref: '#/components/schemas/Usuario' }),
          400: errorResponse,
        },
      },
    },
    '/usuarios/{identifier}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener un usuario por ID o slug',
        parameters: [{ ...slugParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Usuario encontrado', { $ref: '#/components/schemas/Usuario' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Usuarios'],
        summary: 'Actualizar un usuario por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        requestBody: requestBody('UsuarioUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Usuario actualizado', { $ref: '#/components/schemas/Usuario' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar un usuario por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Usuario eliminado', { $ref: '#/components/schemas/Usuario' }),
          404: errorResponse,
        },
      },
    },
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Obtener roles',
        responses: {
          200: apiResponse('Lista de roles', {
            type: 'array',
            items: { $ref: '#/components/schemas/Rol' },
          }),
        },
      },
      post: {
        tags: ['Roles'],
        summary: 'Crear un rol',
        requestBody: requestBody('RolCreate', 'Datos del rol'),
        responses: {
          201: apiResponse('Rol creado', { $ref: '#/components/schemas/Rol' }),
          400: errorResponse,
        },
      },
    },
    '/roles/{identifier}': {
      get: {
        tags: ['Roles'],
        summary: 'Obtener un rol por ID o slug',
        parameters: [{ ...slugParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Rol encontrado', { $ref: '#/components/schemas/Rol' }),
          404: errorResponse,
        },
      },
      patch: {
        tags: ['Roles'],
        summary: 'Actualizar un rol por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        requestBody: requestBody('RolUpdate', 'Campos que se desean actualizar'),
        responses: {
          200: apiResponse('Rol actualizado', { $ref: '#/components/schemas/Rol' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Roles'],
        summary: 'Eliminar un rol por ID',
        parameters: [{ ...idParameter, name: 'identifier' }],
        responses: {
          200: apiResponse('Rol eliminado', { $ref: '#/components/schemas/Rol' }),
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/clasificacion': {
      get: {
        tags: ['Clasificación'],
        summary: 'Obtener la clasificación por puntos y victorias',
        responses: {
          200: apiResponse('Clasificación actual', {
            type: 'array',
            items: { $ref: '#/components/schemas/Clasificacion' },
          }),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Error de validación: nombre: Invalid input' },
        },
      },
      Piloto: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nombre: { type: 'string', example: 'Fernando Alonso' },
          numero: { type: 'number', example: 14 },
          nacionalidad: { type: 'string', example: 'Española' },
          escuderia: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/EscuderiaRef' }] },
          puntos: { type: 'number', example: 7 },
          victorias: { type: 'number', example: 0 },
          podios: { type: 'number', example: 0 },
          slug: { type: 'string', example: 'fernando-alonso' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      PilotoCreate: {
        type: 'object',
        required: ['nombre', 'numero', 'nacionalidad', 'escuderia'],
        properties: {
          nombre: { type: 'string', example: 'Fernando Alonso' },
          numero: { type: 'number', example: 14 },
          nacionalidad: { type: 'string', example: 'Española' },
          escuderia: { type: 'string', example: '507f1f77bcf86cd799439011' },
          puntos: { type: 'number', minimum: 0, default: 0 },
          victorias: { type: 'number', minimum: 0, default: 0 },
          podios: { type: 'number', minimum: 0, default: 0 },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      PilotoUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          numero: { type: 'number' },
          nacionalidad: { type: 'string' },
          escuderia: { type: 'string' },
          puntos: { type: 'number', minimum: 0 },
          victorias: { type: 'number', minimum: 0 },
          podios: { type: 'number', minimum: 0 },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      Escuderia: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nombre: { type: 'string', example: 'Aston Martin Aramaco Formula One Team' },
          siglas: { type: 'string', example: 'AM' },
          pais: { type: 'string', example: 'Reino Unido' },
          motor: { type: 'string', example: 'Honda RA626H' },
          jefe: { type: 'string', example: 'Adrian Newey' },
          año: { type: 'number', example: 2018 },
          slug: { type: 'string', example: 'aston-martin-aramaco-formula-one-team' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      EscuderiaRef: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nombre: { type: 'string' },
          pais: { type: 'string' },
          motor: { type: 'string' },
        },
      },
      EscuderiaCreate: {
        type: 'object',
        required: ['nombre', 'pais', 'motor'],
        properties: {
          nombre: { type: 'string', example: 'Aston Martin Aramaco Formula One Team' },
          siglas: { type: 'string', example: 'AM' },
          pais: { type: 'string', example: 'Reino Unido' },
          motor: { type: 'string', example: 'Honda RA626H' },
          jefe: { type: 'string', example: 'Adrian Newey' },
          año: { type: 'number', example: 2018 },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      EscuderiaUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          siglas: { type: 'string' },
          pais: { type: 'string' },
          motor: { type: 'string' },
          jefe: { type: 'string' },
          año: { type: 'number' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      Circuito: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nombre: { type: 'string', example: 'Circuit de Barcelona-Catalunya' },
          tipo: { type: 'string', example: 'Permanente' },
          slug: { type: 'string', example: 'circuit-de-barcelona-catalunya' },
          longitud: { type: 'number', example: 4.657 },
          ultimoGanador: { type: 'string', example: 'Oscar Piastri' },
          pais: { type: 'string', example: 'España' },
          vueltaRapida: {
            type: 'object',
            properties: {
              tiempo: { type: 'number', example: 82.6 },
              piloto: { type: 'string', example: 'Max Verstappen' },
              anio: { type: 'string', format: 'date-time' },
            },
          },
          desgaste: { type: 'string', example: 'Medio' },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      CircuitoCreate: {
        type: 'object',
        required: ['nombre', 'tipo', 'longitud', 'pais'],
        properties: {
          nombre: { type: 'string' },
          tipo: { type: 'string' },
          longitud: { type: 'number', minimum: 0 },
          ultimoGanador: { type: 'string' },
          pais: { type: 'string' },
          vueltaRapida: {
            type: 'object',
            required: ['tiempo', 'piloto', 'anio'],
            properties: {
              tiempo: { type: 'number', minimum: 0 },
              piloto: { type: 'string' },
              anio: { type: 'string', format: 'date-time' },
            },
          },
          desgaste: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      CircuitoUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          tipo: { type: 'string' },
          longitud: { type: 'number', minimum: 0 },
          ultimoGanador: { type: 'string' },
          pais: { type: 'string' },
          vueltaRapida: {
            type: 'object',
            required: ['tiempo', 'piloto', 'anio'],
            properties: {
              tiempo: { type: 'number', minimum: 0 },
              piloto: { type: 'string' },
              anio: { type: 'string', format: 'date-time' },
            },
          },
          desgaste: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      Carrera: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          slug: { type: 'string', example: 'gran-premio-de-espana' },
          nombre: { type: 'string', example: 'Gran Premio de España' },
          fecha: { type: 'string', format: 'date-time' },
          capacidad: { type: 'integer', example: 140000 },
          circuito: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/CircuitoRef' }] },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', example: 'active' },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      CircuitoRef: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nombre: { type: 'string' },
          slug: { type: 'string' },
          pais: { type: 'string' },
        },
      },
      CarreraCreate: {
        type: 'object',
        required: ['nombre', 'fecha', 'capacidad', 'circuito'],
        properties: {
          nombre: { type: 'string' },
          fecha: { type: 'string', format: 'date-time' },
          capacidad: { type: 'integer', minimum: 0 },
          circuito: { type: 'string', description: 'ID de un circuito existente' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      CarreraUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          fecha: { type: 'string', format: 'date-time' },
          capacidad: { type: 'integer', minimum: 0 },
          circuito: { type: 'string', description: 'ID de un circuito existente' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      Image: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          slug: { type: 'string' },
          entity_type: { type: 'string', enum: ['Piloto', 'Escuderia', 'Circuito', 'Carrera', 'Usuario', 'Rol', 'Location', 'Variant'] },
          entity_id: { type: 'string' },
          image_url: { type: 'string', format: 'uri' },
          alt_text: { type: 'string' },
          position: { type: 'integer', minimum: 0 },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      ImageCreate: {
        type: 'object',
        required: ['entity_type', 'entity_id', 'image_url'],
        properties: {
          entity_type: { type: 'string', enum: ['Piloto', 'Escuderia', 'Circuito', 'Carrera', 'Usuario', 'Rol', 'Location', 'Variant'] },
          entity_id: { type: 'string' },
          image_url: { type: 'string', format: 'uri' },
          alt_text: { type: 'string' },
          position: { type: 'integer', minimum: 0 },
          isActive: { type: 'boolean' },
        },
      },
      ImageUpdate: {
        type: 'object',
        properties: {
          entity_type: { type: 'string', enum: ['Piloto', 'Escuderia', 'Circuito', 'Carrera', 'Usuario', 'Rol', 'Location', 'Variant'] },
          entity_id: { type: 'string' },
          image_url: { type: 'string', format: 'uri' },
          alt_text: { type: 'string' },
          position: { type: 'integer', minimum: 0 },
          isActive: { type: 'boolean' },
        },
      },
      Location: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          slug: { type: 'string' },
          pais: { type: 'string' },
          ciudad: { type: 'string' },
          capital: { type: 'string' },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      LocationCreate: {
        type: 'object',
        required: ['pais', 'ciudad', 'capital'],
        properties: {
          pais: { type: 'string' },
          ciudad: { type: 'string' },
          capital: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      LocationUpdate: {
        type: 'object',
        properties: {
          pais: { type: 'string' },
          ciudad: { type: 'string' },
          capital: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      Variant: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          slug: { type: 'string' },
          sku: { type: 'string' },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      VariantCreate: {
        type: 'object',
        required: ['sku'],
        properties: { sku: { type: 'string' }, isActive: { type: 'boolean' } },
      },
      VariantUpdate: {
        type: 'object',
        properties: { sku: { type: 'string' }, isActive: { type: 'boolean' } },
      },
      Usuario: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          slug: { type: 'string' },
          nombre: { type: 'string' },
          apellidos: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatar: { type: 'string' },
          roles: { type: 'string' },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      UsuarioCreate: {
        type: 'object',
        required: ['nombre', 'apellidos', 'email', 'password', 'roles'],
        properties: {
          nombre: { type: 'string' },
          apellidos: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          avatar: { type: 'string' },
          roles: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      UsuarioUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          apellidos: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          avatar: { type: 'string' },
          roles: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      Rol: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          slug: { type: 'string' },
          nombre: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastUpdate: { type: 'string', format: 'date-time' },
        },
      },
      RolCreate: {
        type: 'object',
        required: ['nombre', 'description'],
        properties: {
          nombre: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      RolUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
      IsActiveUpdate: {
        type: 'object',
        required: ['isActive'],
        properties: { isActive: { type: 'boolean', example: true } },
      },
      StatusUpdate: {
        type: 'object',
        required: ['status'],
        properties: { status: { type: 'string', example: 'Activo' } },
      },
      Clasificacion: {
        type: 'object',
        properties: {
          posicion: { type: 'integer', example: 1 },
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nombre: { type: 'string', example: 'Fernando Alonso' },
          numero: { type: 'number', example: 14 },
          nacionalidad: { type: 'string', example: 'Española' },
          escuderia: { type: 'string', example: 'Aston Martin Aramaco Formula One Team' },
          puntos: { type: 'number', example: 7 },
          victorias: { type: 'number', example: 0 },
          podios: { type: 'number', example: 0 },
        },
      },
    },
  },
};

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
