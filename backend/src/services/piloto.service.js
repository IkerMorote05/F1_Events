const pilotoRepository = require('../repositories/piloto.repository');
const escuderiaRepository = require('../repositories/escuderia.repository');
const CategoriaGlobal = require('../models/categoria-global.model');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const { createUniqueSlug } = require('../utils/slug');

class PilotoService {
  async obtenerTodos(includeDeleted = false) {
    return pilotoRepository.findAll(includeDeleted);
  }

  async obtenerPorId(id) {
    const piloto = await pilotoRepository.findById(id);
    if (!piloto) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return piloto;
  }

  async obtenerPorSlug(slug) {
    let piloto = await pilotoRepository.findBySlug(slug);
    if (!piloto && mongoose.Types.ObjectId.isValid(slug)) {
      piloto = await pilotoRepository.findById(slug);
    }
    if (!piloto) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return piloto;
  }

  async crearPiloto(data) {
    if (!(await CategoriaGlobal.findById(data.categoria))) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }

    const escuderiaExiste = await escuderiaRepository.findById(data.escuderia);
    if (!escuderiaExiste) {
      throw new AppError('La escudería proporcionada no existe', 400);
    }

    const numeroExistente = await pilotoRepository.findByNumero(data.numero);
    if (numeroExistente) {
      throw new AppError('El número de piloto ya está ocupado', 400);
    }

    const pilotoData = { ...data };
    delete pilotoData.deletedAt;
    pilotoData.slug = await createUniqueSlug(
      data.nombre,
      (slug, includeDeleted) => pilotoRepository.findBySlug(slug, includeDeleted),
      null,
      'piloto'
    );

    return pilotoRepository.create(pilotoData);
  }

  async actualizarPiloto(id, data) {
    if (data.categoria && !(await CategoriaGlobal.findById(data.categoria))) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }

    if (data.escuderia) {
      const escuderiaExiste = await escuderiaRepository.findById(data.escuderia);
      if (!escuderiaExiste) {
        throw new AppError('La escudería proporcionada no existe', 400);
      }
    }

    if (data.numero) {
      const numeroExistente = await pilotoRepository.findByNumero(data.numero);
      if (numeroExistente && numeroExistente._id.toString() !== id) {
        throw new AppError('El número de piloto ya está ocupado por otro piloto', 400);
      }
    }

    const pilotoData = { ...data };
    delete pilotoData.slug;
    delete pilotoData.deletedAt;
    if (data.nombre) {
      pilotoData.slug = await createUniqueSlug(
        data.nombre,
        (slug, includeDeleted) => pilotoRepository.findBySlug(slug, includeDeleted),
        id,
        'piloto'
      );
    }

    const pilotoActualizado = await pilotoRepository.update(id, pilotoData);
    if (!pilotoActualizado) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return pilotoActualizado;
  }

  async eliminarPiloto(id) {
    const piloto = await pilotoRepository.softDelete(id);
    if (!piloto) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return piloto;
  }

  async softDeletePorSlug(slug) {
    const piloto = await pilotoRepository.softDeleteBySlug(slug);
    if (!piloto) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return piloto;
  }

  async actualizarIsActive(slug, isActive) {
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive debe ser un valor booleano', 400);
    }
    const piloto = await pilotoRepository.setIsActiveBySlug(slug, isActive);
    if (!piloto) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return piloto;
  }

  async cambiarStatus(slug, status) {
    if (typeof status !== 'string' || !status.trim()) {
      throw new AppError('status debe ser un texto no vacío', 400);
    }
    const piloto = await pilotoRepository.changeStatusBySlug(slug, status.trim());
    if (!piloto) {
      throw new AppError('Piloto no encontrado', 404);
    }
    return piloto;
  }

  async restaurarEliminacion(slug) {
    const piloto = await pilotoRepository.restoreBySlug(slug);
    if (!piloto) {
      throw new AppError('Piloto eliminado no encontrado', 404);
    }
    return piloto;
  }
}

module.exports = new PilotoService();