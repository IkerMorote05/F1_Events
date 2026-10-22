const Carrera = require('../models/carrera.model');

class CarreraRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return Carrera.find(query).populate('circuito', 'nombre slug pais');
  }

  async findById(id) {
    return Carrera.findOne({ _id: id, deletedAt: null }).populate('circuito', 'nombre slug pais');
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Carrera.findOne(query).populate('circuito', 'nombre slug pais');
  }

  async findByCircuito(id, includeDeleted = false) {
    const query = { circuito: id };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Carrera.find(query);
  }

  async create(data) {
    return Carrera.create(data);
  }

  async update(id, data) {
    return Carrera.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }).populate('circuito', 'nombre slug pais');
  }

  async softDelete(id) {
    return Carrera.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async softDeleteBySlug(slug) {
    return Carrera.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async setIsActiveBySlug(slug, isActive) {
    return Carrera.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async changeStatusBySlug(slug, status) {
    return Carrera.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    );
  }

  async restoreBySlug(slug) {
    return Carrera.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );
  }
}

module.exports = new CarreraRepository();
