const Circuito = require('../models/circuito.model');

class CircuitoRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return Circuito.find(query);
  }

  async findById(id) {
    return Circuito.findOne({ _id: id, deletedAt: null });
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Circuito.findOne(query);
  }

  async create(data) {
    return Circuito.create(data);
  }

  async update(id, data) {
    return Circuito.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id) {
    return Circuito.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async softDeleteBySlug(slug) {
    return Circuito.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async setIsActiveBySlug(slug, isActive) {
    return Circuito.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async changeStatusBySlug(slug, status) {
    return Circuito.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    );
  }

  async restoreBySlug(slug) {
    return Circuito.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );
  }
}

module.exports = new CircuitoRepository();
