const Escuderia = require('../models/escuderia.model');

class EscuderiaRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return Escuderia.find(query).populate('categoria', 'competicion');
  }

  async findById(id) {
    return Escuderia.findOne({ _id: id, deletedAt: null }).populate('categoria', 'competicion');
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Escuderia.findOne(query).populate('categoria', 'competicion');
  }

  async findByNombre(nombre) {
    return Escuderia.findOne({ nombre }).populate('categoria', 'competicion');
  }

  async create(data) {
    const escuderia = await Escuderia.create(data);
    return escuderia.populate('categoria', 'competicion');
  }

  async update(id, data) {
    return Escuderia.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }).populate('categoria', 'competicion');
  }

  async softDelete(id) {
    return Escuderia.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).populate('categoria', 'competicion');
  }

  async softDeleteBySlug(slug) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).populate('categoria', 'competicion');
  }

  async setIsActiveBySlug(slug, isActive) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    ).populate('categoria', 'competicion');
  }

  async changeStatusBySlug(slug, status) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    ).populate('categoria', 'competicion');
  }

  async restoreBySlug(slug) {
    return Escuderia.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    ).populate('categoria', 'competicion');
  }
}

module.exports = new EscuderiaRepository();