const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const { createUniqueSlug } = require('../utils/slug');

const findByIdentifier = async (repository, identifier, entityName) => {
  let document = await repository.findBySlug(identifier);
  if (!document && mongoose.Types.ObjectId.isValid(identifier)) {
    document = await repository.findById(identifier);
  }
  if (!document) throw new AppError(`${entityName} no encontrado`, 404);
  return document;
};

const uniqueSlug = (repository, value, currentId, fallback) =>
  createUniqueSlug(
    value,
    (slug, includeDeleted) => repository.findBySlug(slug, includeDeleted),
    currentId,
    fallback
  );

module.exports = { findByIdentifier, uniqueSlug };
