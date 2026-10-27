const mongoose = require('mongoose');
require('dotenv').config();

const Escuderia = require('./models/escuderia.model');
const Piloto = require('./models/piloto.model');
const Location = require('./models/location.model');
const Image = require('./models/image.model');
const Variant = require('./models/variant.model');
const Usuario = require('./models/usuarios.model');
const Rol = require('./models/roles.model');
const CategoriaGlobal = require('./models/categoria-global.model');
const Circuito = require('./models/circuito.model');
const CategoriaCircuitos = require('./models/categoria-circuitos.model');
const slugify = require('./utils/slug');

const legacyCircuitLocations = new Map([
  ['espana', { pais: 'España', ciudad: 'Barcelona', capital: 'Madrid' }],
  ['bahrein', { pais: 'Bahrein', ciudad: 'Sakhir', capital: 'Manama' }],
  ['australia', { pais: 'Australia', ciudad: 'Melbourne', capital: 'Canberra' }],
  ['china', { pais: 'China', ciudad: 'Shanghai', capital: 'Beijing' }],
  ['japon', { pais: 'Japón', ciudad: 'Suzuka', capital: 'Tokio' }],
]);

const normalizeCountry = (country) =>
  country.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

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

const migrateCircuitLocations = async () => {
  const locations = await Location.find({});
  const locationsByCountry = new Map(
    locations.map((location) => [normalizeCountry(location.pais), location])
  );
  const legacyCircuits = await Circuito.collection
    .find({ location: { $exists: false }, pais: { $type: 'string' } })
    .toArray();

  for (const circuit of legacyCircuits) {
    const country = normalizeCountry(circuit.pais);
    let location = locationsByCountry.get(country);
    if (!location) {
      const locationData = legacyCircuitLocations.get(country);
      if (!locationData) {
        throw new Error(
          `No se puede migrar el circuito "${circuit.nombre}": falta una ubicación para "${circuit.pais}"`
        );
      }
      location = await Location.create(locationData);
      locationsByCountry.set(country, location);
    }

    await Circuito.collection.updateOne(
      { _id: circuit._id, location: { $exists: false } },
      { $set: { location: location._id }, $unset: { pais: '' } }
    );
  }

  return legacyCircuits.length;
};

const migrateCategoryReferences = async () => {
  const [escuderias, pilotos] = await Promise.all([
    Escuderia.collection.find({ categoria: { $type: 'string' } }).toArray(),
    Piloto.collection.find({ categoria: { $type: 'string' } }).toArray(),
  ]);
  const categorias = new Map();

  for (const document of [...escuderias, ...pilotos]) {
    const competicion = document.categoria.trim();
    if (!competicion) {
      throw new Error(`No se puede migrar la categoría vacía del documento ${document._id}`);
    }
    if (!categorias.has(competicion)) {
      let categoria = await CategoriaGlobal.findOne({ competicion });
      if (!categoria) {
        categoria = await CategoriaGlobal.create({ competicion });
      }
      categorias.set(competicion, categoria._id);
    }
  }

  for (const [Model, documents] of [[Escuderia, escuderias], [Piloto, pilotos]]) {
    for (const document of documents) {
      await Model.collection.updateOne(
        { _id: document._id, categoria: document.categoria },
        { $set: { categoria: categorias.get(document.categoria.trim()) } }
      );
    }
  }

  return escuderias.length + pilotos.length;
};

const migrateCircuitGlobalCategories = async () => {
  const circuitos = await Circuito.collection.find({
    $or: [
      { categoria: { $type: 'string' } },
      { categproa: { $type: 'string' } },
    ],
  }).toArray();

  for (const circuito of circuitos) {
    const competicion = (circuito.categoria || circuito.categproa).trim();
    if (!competicion) {
      throw new Error(`No se puede migrar la categoría vacía del circuito ${circuito._id}`);
    }

    let categoria = await CategoriaGlobal.findOne({ competicion });
    if (!categoria) {
      categoria = await CategoriaGlobal.create({ competicion });
    }

    await Circuito.collection.updateOne(
      { _id: circuito._id },
      { $set: { categoria: categoria._id }, $unset: { categproa: '' } }
    );
  }

  return circuitos.length;
};

const migrateCircuitCategoryReferences = async () => {
  const circuitos = await Circuito.collection.find({
    $or: [
      { tipo: { $type: 'string' } },
      { desgaste: { $type: 'string' } },
    ],
  }).toArray();
  const categoriesByValue = new Map();

  for (const circuit of circuitos) {
    const fields = {};
    const unsetFields = {};
    for (const field of ['tipo', 'desgaste']) {
      const value = circuit[field];
      if (typeof value !== 'string') {
        continue;
      }

      const normalizedValue = value.trim();
      if (!normalizedValue) {
        if (field === 'tipo') {
          throw new Error(`No se puede migrar el tipo vacío del circuito ${circuit._id}`);
        }
        unsetFields[field] = '';
        continue;
      }

      const key = `${field}:${normalizedValue}`;
      if (!categoriesByValue.has(key)) {
        let category = await CategoriaCircuitos.findOne({ [field]: normalizedValue });
        if (!category) {
          category = await CategoriaCircuitos.create({
            [field]: normalizedValue,
            slug: `${field}-${slugify(normalizedValue) || 'categoria'}`,
          });
        }
        categoriesByValue.set(key, category._id);
      }
      fields[field] = categoriesByValue.get(key);
    }

    const update = {};
    if (Object.keys(fields).length > 0) {
      update.$set = fields;
    }
    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }
    if (Object.keys(update).length > 0) {
      await Circuito.collection.updateOne({ _id: circuit._id }, update);
    }
  }

  return circuitos.length;
};

const migrateExistingData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI no está configurada');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const categorias = await migrateCategoryReferences();
  const categoriasCircuitosGlobales = await migrateCircuitGlobalCategories();
  const categoriasCircuitos = await migrateCircuitCategoryReferences();
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
  const circuitos = await migrateCircuitLocations();

  console.log(
    `Migración completada: ${categorias} categorías globales, ${categoriasCircuitosGlobales} categorías globales de circuitos y ${categoriasCircuitos} categorías de tipo/desgaste referenciadas, ${escuderias} escuderías, ${pilotos} pilotos, ${circuitos} circuitos, ${locations} ubicaciones, ${images} imágenes, ${variants} variantes, ${usuarios} usuarios y ${roles} roles revisados.`
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
