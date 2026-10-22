const mongoose = require('mongoose');
require('dotenv').config();

const Escuderia = require('./models/escuderia.model');
const Piloto = require('./models/piloto.model');
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

const migrateCollection = async (Model, fallback) => {
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
    const createdAt = document.createdAt || document.updatedAt || now;
    const updatedAt = document.updatedAt || document.createdAt || now;

    if (!document.createdAt) {
      fields.createdAt = createdAt;
      missingFields.push('createdAt');
    }
    if (!document.updatedAt) {
      fields.updatedAt = updatedAt;
      missingFields.push('updatedAt');
    }
    if (!Object.prototype.hasOwnProperty.call(document, 'deletedAt')) {
      fields.deletedAt = null;
      missingFields.push('deletedAt');
    }
    if (typeof document.isActive !== 'boolean') {
      fields.isActive = true;
      missingFields.push('isActive');
    }
    if (typeof document.status !== 'string' || !document.status.trim()) {
      fields.status = 'active';
      missingFields.push('status');
    }
    if (typeof document.slug !== 'string' || !document.slug.trim()) {
      fields.slug = createSlug(document.nombre, usedSlugs, fallback);
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
  const escuderias = await migrateCollection(Escuderia, 'escuderia');
  const pilotos = await migrateCollection(Piloto, 'piloto');

  console.log(`Migración completada: ${escuderias} escuderías y ${pilotos} pilotos revisados.`);
};

migrateExistingData()
  .catch((error) => {
    console.error('Error durante la migración:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
