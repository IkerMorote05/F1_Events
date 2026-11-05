const Piloto = require('../models/piloto.model');

const populatePiloto = (query) => query
  .populate('escuderia', 'nombre pais motor siglas')
  .populate('categoria', 'competicion')
  .populate('images');

class PilotoRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return populatePiloto(Piloto.find(query));
  }

  async findById(id) {
    return populatePiloto(Piloto.findOne({ _id: id, deletedAt: null }));
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return populatePiloto(Piloto.findOne(query));
  }

  async findByNumero(numero) {
    return Piloto.findOne({ numero });
  }

  async create(data) {
    const piloto = await Piloto.create(data);
    return populatePiloto(Piloto.findById(piloto._id));
  }

  async update(id, data) {
    return populatePiloto(Piloto.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }));
  }

  async softDelete(id) {
    return populatePiloto(Piloto.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ));
  }

  async softDeleteBySlug(slug) {
    return populatePiloto(Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ));
  }

  async setIsActiveBySlug(slug, isActive) {
    return populatePiloto(Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    ));
  }

  async changeStatusBySlug(slug, status) {
    return populatePiloto(Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    ));
  }

  async restoreBySlug(slug) {
    return populatePiloto(Piloto.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    ));
  }

  async findClasificacion() {
    return populatePiloto(Piloto.find({ deletedAt: null })
      .sort({ puntos: -1, victorias: -1 }));
  }

  async findByEscuderia(id) {
    return populatePiloto(Piloto.find({ escuderia: id, deletedAt: null }));
  }
}

module.exports = new PilotoRepository();