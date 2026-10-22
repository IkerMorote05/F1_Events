const mongoose = require('mongoose');
const circuitoRepository = require('../repositories/circuito.repository');
const carreraRepository = require('../repositories/carrera.repository');
const AppError = require('../utils/appError');
const { createUniqueSlug } = require('../utils/slug');

class CircuitoService {
  async obtenerTodos(includeDeleted = false) {
    return circuitoRepository.findAll(includeDeleted);
  }

  async obtenerPorId(id) {
    const circuito = await circuitoRepository.findById(id);
    if (!circuito) {
      throw new AppError('Circuito no encontrado', 404);
    }
    return circuito;
  }

  async obtenerPorSlug(slug) {
    let circuito = await circuitoRepository.findBySlug(slug);
    if (!circuito && mongoose.Types.ObjectId.isValid(slug)) {
      circuito = await circuitoRepository.findById(slug);
    }
    if (!circuito) {
      throw new AppError('Circuito no encontrado', 404);
    }
    return circuito;
  }

  async crearCircuito(data) {
    const circuitoData = { ...data };
    delete circuitoData.deletedAt;
    delete circuitoData.slug;
    circuitoData.slug = await createUniqueSlug(
      data.nombre,
      (slug, includeDeleted) => circuitoRepository.findBySlug(slug, includeDeleted),
      null,
      'circuito'
    );

    return circuitoRepository.create(circuitoData);
  }

  async actualizarCircuito(id, data) {
    const circuitoData = { ...data };
    delete circuitoData.slug;
    delete circuitoData.deletedAt;

    if (data.nombre) {
      circuitoData.slug = await createUniqueSlug(
        data.nombre,
        (slug, includeDeleted) => circuitoRepository.findBySlug(slug, includeDeleted),
        id,
        'circuito'
      );
    }

    const circuitoActualizado = await circuitoRepository.update(id, circuitoData);
    if (!circuitoActualizado) {
      throw new AppError('Circuito no encontrado', 404);
    }
    return circuitoActualizado;
  }

  async eliminarCircuito(id) {
    const carrerasAsociadas = await carreraRepository.findByCircuito(id, true);
    if (carrerasAsociadas.length > 0) {
      throw new AppError('No se puede eliminar el circuito porque tiene carreras asociadas', 400);
    }

    const circuito = await circuitoRepository.softDelete(id);
    if (!circuito) {
      throw new AppError('Circuito no encontrado', 404);
    }
    return circuito;
  }

  async softDeletePorSlug(slug) {
    const circuito = await this.obtenerPorSlug(slug);
    return this.eliminarCircuito(circuito._id.toString());
  }

  async actualizarIsActive(slug, isActive) {
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive debe ser un valor booleano', 400);
    }
    const circuito = await circuitoRepository.setIsActiveBySlug(slug, isActive);
    if (!circuito) {
      throw new AppError('Circuito no encontrado', 404);
    }
    return circuito;
  }

  async cambiarStatus(slug, status) {
    if (typeof status !== 'string' || !status.trim()) {
      throw new AppError('status debe ser un texto no vacío', 400);
    }
    const circuito = await circuitoRepository.changeStatusBySlug(slug, status.trim());
    if (!circuito) {
      throw new AppError('Circuito no encontrado', 404);
    }
    return circuito;
  }

  async restaurarEliminacion(slug) {
    const circuito = await circuitoRepository.restoreBySlug(slug);
    if (!circuito) {
      throw new AppError('Circuito eliminado no encontrado', 404);
    }
    return circuito;
  }
}

module.exports = new CircuitoService();
