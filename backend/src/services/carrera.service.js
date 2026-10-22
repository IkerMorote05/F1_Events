const mongoose = require('mongoose');
const carreraRepository = require('../repositories/carrera.repository');
const circuitoRepository = require('../repositories/circuito.repository');
const AppError = require('../utils/appError');
const { createUniqueSlug } = require('../utils/slug');

class CarreraService {
  async obtenerTodas(includeDeleted = false) {
    return carreraRepository.findAll(includeDeleted);
  }

  async obtenerPorId(id) {
    const carrera = await carreraRepository.findById(id);
    if (!carrera) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carrera;
  }

  async obtenerPorSlug(slug) {
    let carrera = await carreraRepository.findBySlug(slug);
    if (!carrera && mongoose.Types.ObjectId.isValid(slug)) {
      carrera = await carreraRepository.findById(slug);
    }
    if (!carrera) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carrera;
  }

  async validarCircuito(circuitoId) {
    const circuito = await circuitoRepository.findById(circuitoId);
    if (!circuito) {
      throw new AppError('El circuito proporcionado no existe', 400);
    }
  }

  async crearCarrera(data) {
    await this.validarCircuito(data.circuito);

    const carreraData = { ...data };
    delete carreraData.deletedAt;
    delete carreraData.slug;
    carreraData.slug = await createUniqueSlug(
      data.nombre,
      (slug, includeDeleted) => carreraRepository.findBySlug(slug, includeDeleted),
      null,
      'carrera'
    );

    return carreraRepository.create(carreraData);
  }

  async actualizarCarrera(id, data) {
    if (data.circuito) {
      await this.validarCircuito(data.circuito);
    }

    const carreraData = { ...data };
    delete carreraData.slug;
    delete carreraData.deletedAt;

    if (data.nombre) {
      carreraData.slug = await createUniqueSlug(
        data.nombre,
        (slug, includeDeleted) => carreraRepository.findBySlug(slug, includeDeleted),
        id,
        'carrera'
      );
    }

    const carreraActualizada = await carreraRepository.update(id, carreraData);
    if (!carreraActualizada) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carreraActualizada;
  }

  async eliminarCarrera(id) {
    const carrera = await carreraRepository.softDelete(id);
    if (!carrera) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carrera;
  }

  async softDeletePorSlug(slug) {
    const carrera = await carreraRepository.softDeleteBySlug(slug);
    if (!carrera) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carrera;
  }

  async actualizarIsActive(slug, isActive) {
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive debe ser un valor booleano', 400);
    }
    const carrera = await carreraRepository.setIsActiveBySlug(slug, isActive);
    if (!carrera) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carrera;
  }

  async cambiarStatus(slug, status) {
    if (typeof status !== 'string' || !status.trim()) {
      throw new AppError('status debe ser un texto no vacío', 400);
    }
    const carrera = await carreraRepository.changeStatusBySlug(slug, status.trim());
    if (!carrera) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carrera;
  }

  async restaurarEliminacion(slug) {
    const carreraEliminada = await carreraRepository.findBySlug(slug, true);
    if (!carreraEliminada || !carreraEliminada.deletedAt) {
      throw new AppError('Carrera eliminada no encontrada', 404);
    }
    await this.validarCircuito(carreraEliminada.circuito._id || carreraEliminada.circuito);

    const carrera = await carreraRepository.restoreBySlug(slug);
    if (!carrera) {
      throw new AppError('Carrera eliminada no encontrada', 404);
    }
    return carrera;
  }
}

module.exports = new CarreraService();
