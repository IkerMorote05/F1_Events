const Piloto = require('../models/piloto.model');

class PilotoRepository {
  async findAll(includeDeleted = false) {
    const query = includeDeleted ? {} : { deletedAt: null };
    return Piloto.find(query).populate('escuderia', 'nombre pais motor siglas');
  }

  async findById(id) {
    return Piloto.findOne({ _id: id, deletedAt: null }).populate('escuderia', 'nombre pais motor siglas');
  }

  async findBySlug(slug, includeDeleted = false) {
    const query = { slug };
    if (!includeDeleted) {
      query.deletedAt = null;
    }
    return Piloto.findOne(query).populate('escuderia', 'nombre pais motor siglas');
  }

  async findByNumero(numero) {
    return Piloto.findOne({ numero });
  }

  async create(data) {
    return Piloto.create(data);
  }

  async update(id, data) {
    return Piloto.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
      new: true,
      runValidators: true,
    }).populate('escuderia', 'nombre pais motor siglas');
  }

  async softDelete(id) {
    return Piloto.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async softDeleteBySlug(slug) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async setIsActiveBySlug(slug, isActive) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async changeStatusBySlug(slug, status) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: null },
      { status },
      { new: true, runValidators: true }
    );
  }

  async restoreBySlug(slug) {
    return Piloto.findOneAndUpdate(
      { slug, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );
  }

  async findClasificacion() {
    return Piloto.find({ deletedAt: null })
      .populate('escuderia', 'nombre')
      .sort({ puntos: -1, victorias: -1 });
  }

  async findByEscuderia(id) {
    return Piloto.find({ escuderia: id, deletedAt: null });
  }
}

module.exports = new PilotoRepository();