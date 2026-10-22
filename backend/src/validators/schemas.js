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
    escuderia: z.string().min(1),
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
    tipo: z.string().min(1),
    longitud: nonNegativeNumericValue,
    ultimoGanador: z.string().optional(),
    pais: z.string().min(1),
    vueltaRapida: vueltaRapidaSchema.optional(),
    desgaste: z.string().optional(),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const circuitoUpdate = circuitoCreate.partial();

const carreraCreate = z
  .object({
    nombre: z.string().min(1),
    fecha: dateValue,
    capacidad: nonNegativeIntegerValue,
    circuito: z.string().refine(mongoose.Types.ObjectId.isValid, 'Debe ser un ID de circuito válido'),
    isActive: z.boolean().optional(),
    status: z.string().optional(),
  })
  .passthrough();

const carreraUpdate = carreraCreate.partial();

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
    sku: z.string().trim().min(1),
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
  carreraCreate,
  carreraUpdate,
  locationCreate,
  locationUpdate,
  imageCreate,
  imageUpdate,
  imageEntityParams,
  variantCreate,
  variantUpdate,
  usuarioCreate,
  usuarioUpdate,
  rolCreate,
  rolUpdate,
  isActiveBody,
  statusBody,
};
