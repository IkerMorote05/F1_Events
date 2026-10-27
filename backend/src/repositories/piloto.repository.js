const Piloto = require('../models/piloto.model');

class PilotoRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return Piloto.find(query)
      .populate('escuderia', 'nombre pais motor siglas')
      .populate('categoria', 'competicion');
  }

  async findById(id) {
    return Piloto.findOne({ _id: id, deletedAt: null })
      .populate('escuderia', 'nombre pais motor siglas')
      .populate('categoria', 'competicion');
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Piloto.findOne(query)
      .populate('escuderia', 'nombre pais motor siglas')
      .populate('categoria', 'competicion');
  }

  async findByNumero(numero) {
    return Piloto.findOne({ numero });
  }

  async create(data) {
    const piloto = await Piloto.create(data);
    return piloto.populate('categoria', 'competicion');
  }

  async update(id, data) {
    return Piloto.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    })
      .populate('escuderia', 'nombre pais motor siglas')
      .populate('categoria', 'competicion');
  }

  async softDelete(id) {
    return Piloto.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).populate('categoria', 'competicion');
  }

  async softDeleteBySlug(slug) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).populate('categoria', 'competicion');
  }

  async setIsActiveBySlug(slug, isActive) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    ).populate('categoria', 'competicion');
  }

  async changeStatusBySlug(slug, status) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    ).populate('categoria', 'competicion');
  }

  async restoreBySlug(slug) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    ).populate('categoria', 'competicion');
  }

  async findClasificacion() {
    return Piloto.find({ deletedAt: null })
      .populate('escuderia', 'nombre')
      .populate('categoria', 'competicion')
      .sort({ puntos: -1, victorias: -1 });
  }

  async findByEscuderia(id) {
    return Piloto.find({ escuderia: id, deletedAt: null }).populate('categoria', 'competicion');
  }
}

module.exports = new PilotoRepository();