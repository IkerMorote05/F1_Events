const mongoose = require('mongoose');
require('dotenv').config();

const Escuderia = require('./models/escuderia.model');
const Piloto = require('./models/piloto.model');
const Location = require('./models/location.model');
const Image = require('./models/image.model');
const Variant = require('./models/variant.model');
const Usuario = require('./models/usuarios.model');
const Rol = require('./models/roles.model');
const slugify = require('./utils/slug');

const createSlug = (name, usedSlugs, fallback) => {
  const baseSlug = slugify(name) || fallback;
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
};

const migrateCollection = async (Model, fallback, getSlugSource, includeStatus = false) => {
  const documents = await Model.collection.find({}).toArray();
  const usedSlugs = new Set(
    documents
      .map((document) => document.slug)
      .filter((slug) => typeof slug === 'string' && slug.length > 0)
  );

  for (const document of documents) {
    const fields = {};
    const missingFields = [];
    const now = new Date();
    const createdAt = document.createdAt || document.lastUpdate || document.updatedAt || now;
    const updatedAt = document.lastUpdate || document.updatedAt || document.createdAt || now;
    const updatedAtField = Model.schema.options.timestamps?.updatedAt || 'updatedAt';

    if (!document.createdAt) {
      fields.createdAt = createdAt;
      missingFields.push('createdAt');
    }
    if (!document[updatedAtField]) {
      fields[updatedAtField] = updatedAt;
      missingFields.push(updatedAtField);
    }
    if (!Object.prototype.hasOwnProperty.call(document, 'deletedAt')) {
      fields.deletedAt = null;
      missingFields.push('deletedAt');
    }
    if (typeof document.isActive !== 'boolean') {
      fields.isActive = true;
      missingFields.push('isActive');
    }
    if (includeStatus && (typeof document.status !== 'string' || !document.status.trim())) {
      fields.status = 'active';
      missingFields.push('status');
    }
    if (typeof document.slug !== 'string' || !document.slug.trim()) {
      fields.slug = createSlug(getSlugSource(document), usedSlugs, fallback);
      missingFields.push('slug');
    }

    if (missingFields.length > 0) {
      await Model.collection.updateOne(
        { _id: document._id },
        { $set: fields }
      );
    }
  }

  return documents.length;
};

const migrateExistingData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI no está configurada');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const escuderias = await migrateCollection(
    Escuderia,
    'escuderia',
    (document) => document.nombre,
    true
  );
  const pilotos = await migrateCollection(
    Piloto,
    'piloto',
    (document) => document.nombre,
    true
  );
  const locations = await migrateCollection(
    Location,
    'location',
    (document) =>
      [document.ciudad, document.capital, document.pais]
        .filter((value) => typeof value === 'string' && value.trim())
        .join('-')
  );
  const images = await migrateCollection(
    Image,
    'image',
    (document) =>
      [document.entity_type, document.entity_id, document.position]
        .filter((value) => value !== undefined && value !== null && `${value}`.trim())
        .join('-')
  );
  const variants = await migrateCollection(Variant, 'variant', (document) => document.sku);
  const usuarios = await migrateCollection(
    Usuario,
    'usuario',
    (document) => `${document.nombre}-${document.apellidos}`,
    true
  );
  const roles = await migrateCollection(Rol, 'rol', (document) => document.nombre, true);

  console.log(
    `Migración completada: ${escuderias} escuderías, ${pilotos} pilotos, ${locations} ubicaciones, ${images} imágenes, ${variants} variantes, ${usuarios} usuarios y ${roles} roles revisados.`
  );
};

migrateExistingData()
  .catch((error) => {
    console.error('Error durante la migración:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
