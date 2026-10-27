const Circuito = require('../models/circuito.model');

class CircuitoRepository {
  populate(query) {
    return query
      .populate('location', 'pais ciudad capital slug')
      .populate('categoria', 'competicion')
      .populate('tipo', 'tipo')
      .populate('desgaste', 'desgaste');
  }

  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return this.populate(Circuito.find(query));
  }

  async findById(id) {
    return this.populate(Circuito.findOne({ _id: id, deletedAt: null }));
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return this.populate(Circuito.findOne(query));
  }

  async create(data) {
    const circuito = await Circuito.create(data);
    return this.populate(circuito);
  }

  async update(id, data) {
    return this.populate(Circuito.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }));
  }

  async softDelete(id) {
    return this.populate(Circuito.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ));
  }

  async softDeleteBySlug(slug) {
    return this.populate(Circuito.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ));
  }

  async setIsActiveBySlug(slug, isActive) {
    return this.populate(Circuito.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    ));
  }

  async changeStatusBySlug(slug, status) {
    return this.populate(Circuito.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    ));
  }

  async restoreBySlug(slug) {
    return this.populate(Circuito.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    ));
  }
}

module.exports = new CircuitoRepository();
