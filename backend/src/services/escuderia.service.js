const escuderiaRepository = require('../repositories/escuderia.repository');
const pilotoRepository = require('../repositories/piloto.repository');
const CategoriaGlobal = require('../models/categoria-global.model');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const { createUniqueSlug } = require('../utils/slug');

class EscuderiaService {
  async obtenerTodas(includeDeleted = false) {
    return escuderiaRepository.findAll(includeDeleted);
  }

  async obtenerPorId(id) {
    const escuderia = await escuderiaRepository.findById(id);
    if (!escuderia) {
      throw new AppError('Escudería no encontrada', 404);
    }
    return escuderia;
  }

  async obtenerPorSlug(slug) {
    let escuderia = await escuderiaRepository.findBySlug(slug);
    if (!escuderia && mongoose.Types.ObjectId.isValid(slug)) {
      escuderia = await escuderiaRepository.findById(slug);
    }
    if (!escuderia) {
      throw new AppError('Escudería no encontrada', 404);
    }
    return escuderia;
  }

  async crearEscuderia(data) {
    if (!(await CategoriaGlobal.findById(data.categoria))) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }

    const nombreExiste = await escuderiaRepository.findByNombre(data.nombre);
    if (nombreExiste) {
      throw new AppError('Ya existe una escudería con ese nombre', 400);
    }

    const escuderiaData = { ...data };
    delete escuderiaData.deletedAt;
    escuderiaData.slug = await createUniqueSlug(
      data.nombre,
      (slug, includeDeleted) => escuderiaRepository.findBySlug(slug, includeDeleted),
      null,
      'escuderia'
    );

    return escuderiaRepository.create(escuderiaData);
  }

  async actualizarEscuderia(id, data) {
    if (data.categoria && !(await CategoriaGlobal.findById(data.categoria))) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }

    if (data.nombre) {
      const nombreExiste = await escuderiaRepository.findByNombre(data.nombre);
      if (nombreExiste && nombreExiste._id.toString() !== id) {
        throw new AppError('Ya existe otra escudería con ese nombre', 400);
      }
    }

    const escuderiaData = { ...data };
    delete escuderiaData.slug;
    delete escuderiaData.deletedAt;
    if (data.nombre) {
      escuderiaData.slug = await createUniqueSlug(
        data.nombre,
        (slug, includeDeleted) => escuderiaRepository.findBySlug(slug, includeDeleted),
        id,
        'escuderia'
      );
    }

    const escuderiaActualizada = await escuderiaRepository.update(id, escuderiaData);
    if (!escuderiaActualizada) {
      throw new AppError('Escudería no encontrada', 404);
    }
    return escuderiaActualizada;
  }

  async eliminarEscuderia(id) {
    const pilotosAsociados = await pilotoRepository.findByEscuderia(id);
    if (pilotosAsociados.length > 0) {
      throw new AppError('No se puede eliminar la escudería porque tiene pilotos asociados', 400);
    }

    const escuderia = await escuderiaRepository.softDelete(id);
    if (!escuderia) {
      throw new AppError('Escudería no encontrada', 404);
    }
    return escuderia;
  }

  async softDeletePorSlug(slug) {
    const escuderia = await this.obtenerPorSlug(slug);
    return this.eliminarEscuderia(escuderia._id.toString());
  }

  async actualizarIsActive(slug, isActive) {
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive debe ser un valor booleano', 400);
    }
    const escuderia = await escuderiaRepository.setIsActiveBySlug(slug, isActive);
    if (!escuderia) {
      throw new AppError('Escudería no encontrada', 404);
    }
    return escuderia;
  }

  async cambiarStatus(slug, status) {
    if (typeof status !== 'string' || !status.trim()) {
      throw new AppError('status debe ser un texto no vacío', 400);
    }
    const escuderia = await escuderiaRepository.changeStatusBySlug(slug, status.trim());
    if (!escuderia) {
      throw new AppError('Escudería no encontrada', 404);
    }
    return escuderia;
  }

  async restaurarEliminacion(slug) {
    const escuderia = await escuderiaRepository.restoreBySlug(slug);
    if (!escuderia) {
      throw new AppError('Escudería eliminada no encontrada', 404);
    }
    return escuderia;
  }
}

module.exports = new EscuderiaService();