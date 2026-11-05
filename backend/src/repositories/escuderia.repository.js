const Escuderia = require('../models/escuderia.model');

const populateEscuderia = (query) => query
  .populate('categoria', 'competicion')
  .populate('images');

class EscuderiaRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return populateEscuderia(Escuderia.find(query));
  }

  async findById(id) {
    return populateEscuderia(Escuderia.findOne({ _id: id, deletedAt: null }));
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return populateEscuderia(Escuderia.findOne(query));
  }

  async findByNombre(nombre) {
    return Escuderia.findOne({ nombre }).populate('categoria', 'competicion');
  }

  async create(data) {
    const escuderia = await Escuderia.create(data);
    return populateEscuderia(Escuderia.findById(escuderia._id));
  }

  async update(id, data) {
    return populateEscuderia(Escuderia.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }));
  }

  async softDelete(id) {
    return populateEscuderia(Escuderia.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ));
  }

  async softDeleteBySlug(slug) {
    return populateEscuderia(Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ));
  }

  async setIsActiveBySlug(slug, isActive) {
    return populateEscuderia(Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    ));
  }

  async changeStatusBySlug(slug, status) {
    return populateEscuderia(Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    ));
  }

  async restoreBySlug(slug) {
    return populateEscuderia(Escuderia.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    ));
  }
}

module.exports = new EscuderiaRepository();