const { z } = require('zod');
const mongoose = require('mongoose');

const numericValue = z.union([
  z.number().finite(),
  z.string().trim().min(1).refine((value) => Number.isFinite(Number(value)), 'Debe ser un número válido'),
]);
const nonNegativeNumericValue = numericValue.refine((value) => Number(value) >= 0, 'Debe ser un número no negativo');
const nonNegativeIntegerValue = numericValue.refine(
  (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
  'Debe ser un número entero no negativo'
);
const dateValue = z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), 'Debe ser una fecha válida');

const slugParams = z.object({ slug: z.string().min(1) });
const identifierParams = z.object({ identifier: z.string().min(1) });
const idParams = z.object({
  id: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID válido'),
});

const pilotoCreate = z
  .object({
    nombre: z.string().min(1),
    numero: numericValue,
    nacionalidad: z.string().min(1),
    escuderia: z.union([z.string().min(1), z.literal(''), z.null()]).optional(),
    estado: z.enum(['compitiendo', 'agente libre', 'lesion', 'retirado', 'piloto reserva']).optional(),
    categoria: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de categoría válido'),
    puntos: numericValue.optional(),
    victorias: numericValue.optional(),
    podios: numericValue.optional(),
    fecha_nacimiento: z.string().optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const pilotoUpdate = pilotoCreate.partial();

const escuderiaCreate = z
  .object({
    nombre: z.string().min(1),
    pais: z.string().min(1),
    motor: z.string().min(1),
    categoria: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de categoría válido'),
    siglas: z.string().optional(),
    jefe: z.string().optional(),
    año: numericValue.optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const escuderiaUpdate = escuderiaCreate.partial();

const vueltaRapidaSchema = z
  .object({
    tiempo: z.string().trim().min(1),
    piloto: z.string().min(1),
    anio: dateValue,
  });

const circuitoCreate = z
  .object({
    nombre: z.string().min(1),
    categoria: z.string().min(1),
    tipo: z.string().min(1),
    longitud: nonNegativeNumericValue,
    ultimoGanador: z.string().optional(),
    location: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de ubicación válido'),
    vueltaRapida: vueltaRapidaSchema.optional(),
    desgaste: z.string().optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const circuitoUpdate = circuitoCreate.partial();

const categoriaGlobalCreate = z
  .object({
    competicion: z.string().trim().min(1),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const categoriaGlobalUpdate = categoriaGlobalCreate.partial();

const categoriaCircuitosCreate = z
  .object({
    desgaste: z.string().trim().min(1).optional(),
    tipo: z.string().trim().min(1).optional(),
    categoriaEntrada: z.string().trim().min(1).optional(),
    categoriaGrada: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough()
  .refine((data) => [data.tipo, data.desgaste, data.categoriaEntrada, data.categoriaGrada].filter(Boolean).length === 1, {
    message: 'Debe indicar una sola clase: tipo, desgaste, categoría de entrada o categoría de grada',
    path: ['tipo'],
  });

const categoriaCircuitosUpdate = z
  .object({
    desgaste: z.string().trim().min(1).optional(),
    tipo: z.string().trim().min(1).optional(),
    categoriaEntrada: z.string().trim().min(1).optional(),
    categoriaGrada: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough()
  .refine((data) => [data.tipo, data.desgaste, data.categoriaEntrada, data.categoriaGrada].filter(Boolean).length <= 1, {
    message: 'Debe indicar como máximo una clase de categoría',
    path: ['tipo'],
  });

const carreraCreate = z
  .object({
    nombre: z.string().min(1),
    fecha: dateValue,
    capacidad: nonNegativeIntegerValue,
    circuito: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de circuito válido'),
    estado: z.enum(['En vigor', 'Cancelada', 'Aplazada', 'Finalizada']).optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const carreraUpdate = carreraCreate.partial();

const ticketTypeCreate = z.object({
  sku: z.string().trim().min(1).optional(),
  circuit: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de circuito válido'),
  race: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de carrera válido'),
  price: nonNegativeNumericValue,
  duration: numericValue.refine(
    (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 3,
    'La duración debe ser un número entero de 1 a 3 días'
  ),
  category: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de variante válido'),
  estado: z.enum(['Vendida', 'Disponible', 'Reservada', 'Cancelada', 'Reembolsada']).optional(),
  isActive: z.boolean().optional(),
  status: z.string().optional(),
});

const ticketTypeUpdate = ticketTypeCreate.partial().refine(
  (data) => Object.keys(data).length > 0,
  'El payload debe incluir al menos un dato del tipo de entrada'
);

const locationCreate = z
  .object({
    pais: z.string().trim().min(1),
    ciudad: z.string().trim().min(1),
    capital: z.string().trim().min(1),
    isActive: z.boolean().optional(),
  })
  .passthrough();

const locationUpdate = locationCreate.partial();

const imageCreate = z
  .object({
    entity_type: z.enum([
      'Piloto',
      'Escuderia',
      'Circuito',
      'Carrera',
      'Usuario',
      'Rol',
      'Location',
      'Variant',
    ]),
    entity_id: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID válido'),
    image_url: z.string().url(),
    alt_text: z.string().optional(),
    position: nonNegativeIntegerValue.optional(),
    isActive: z.boolean().optional(),
  })
  .passthrough();

const imageUpdate = imageCreate.partial();

const variantCreate = z
  .object({
    sku: z.string().trim().min(1).optional(),
    price: nonNegativeNumericValue,
    descripcion: z.string().trim().optional(),
    percentage: numericValue.refine(
      (value) => Number(value) >= 0 && Number(value) <= 100,
      'El porcentaje debe estar entre 0 y 100'
    ).refine(
      (value) => Number.isInteger(Number(value) * 100),
      'El porcentaje admite como máximo dos decimales'
    ),
    categoriaEntrada: z.string().refine(
      mongoose.Types.ObjectId.isValid,
      'Debe ser un ID de categoría de entrada válido'
    ),
    categoriaGrada: z.string().refine(
      mongoose.Types.ObjectId.isValid,
      'Debe ser un ID de categoría de grada válido'
    ),
    isActive: z.boolean().optional(),
  })
  .passthrough();

const variantUpdate = variantCreate.partial();

const entityTypes = [
  'Piloto',
  'Escuderia',
  'Circuito',
  'Carrera',
  'Usuario',
  'Rol',
  'Location',
  'Variant',
];

const imageEntityParams = z.object({
  entityType: z.enum(entityTypes),
  entityId: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID válido'),
});

const usuarioCreate = z
  .object({
    nombre: z.string().trim().min(1),
    apellidos: z.string().trim().min(1),
    email: z.string().trim().email(),
    password: z.string().min(1),
    avatar: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de imagen válido').optional(),
    roles: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de rol válido'),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const usuarioUpdate = usuarioCreate.partial();

const authRegister = z.object({
  nombre: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const authLogin = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const profileUpdate = z
  .object({
    nombre: z.string().trim().min(1).optional(),
    apellidos: z.string().trim().min(1).optional(),
    avatar: z.union([
      z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de imagen válido'),
      z.null(),
    ]).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'El perfil debe incluir al menos un dato');

const rolCreate = z
  .object({
    nombre: z.string().trim().min(1),
    description: z.string().trim().min(1),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const rolUpdate = rolCreate.partial();

const isActiveBody = z.object({ isActive: z.boolean() }).passthrough();
const statusBody = z.object({ status: z.string().min(1) }).passthrough();

module.exports = {
  slugParams,
  identifierParams,
  idParams,
  pilotoCreate,
  pilotoUpdate,
  escuderiaCreate,
  escuderiaUpdate,
  circuitoCreate,
  circuitoUpdate,
  categoriaGlobalCreate,
  categoriaGlobalUpdate,
  categoriaCircuitosCreate,
  categoriaCircuitosUpdate,
  carreraCreate,
  carreraUpdate,
  ticketTypeCreate,
  ticketTypeUpdate,
  locationCreate,
  locationUpdate,
  imageCreate,
  imageUpdate,
  imageEntityParams,
  variantCreate,
  variantUpdate,
  usuarioCreate,
  usuarioUpdate,
  authRegister,
  authLogin,
  profileUpdate,
  rolCreate,
  rolUpdate,
  isActiveBody,
  statusBody,
};
