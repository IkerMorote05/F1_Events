const Carrera = require('../models/carrera.model');

class CarreraRepository {
  populateCircuito(query) {
    return query.populate({
      path: 'circuito',
      select: 'nombre slug location',
      populate: { path: 'location', select: 'pais ciudad capital slug' },
    });
  }

  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return this.populateCircuito(Carrera.find(query));
  }

  async findById(id) {
    return this.populateCircuito(Carrera.findOne({ _id: id, deletedAt: null }));
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return this.populateCircuito(Carrera.findOne(query));
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
    return this.populateCircuito(Carrera.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }));
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
