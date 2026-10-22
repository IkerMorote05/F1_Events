const Escuderia = require('../models/escuderia.model');

class EscuderiaRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return Escuderia.find(query);
  }

  async findById(id) {
    return Escuderia.findOne({ _id: id, deletedAt: null });
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Escuderia.findOne(query);
  }

  async findByNombre(nombre) {
    return Escuderia.findOne({ nombre });
  }

  async create(data) {
    return Escuderia.create(data);
  }

  async update(id, data) {
    return Escuderia.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id) {
    return Escuderia.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async softDeleteBySlug(slug) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async setIsActiveBySlug(slug, isActive) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async changeStatusBySlug(slug, status) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    );
  }

  async restoreBySlug(slug) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );
  }
}

module.exports = new EscuderiaRepository();