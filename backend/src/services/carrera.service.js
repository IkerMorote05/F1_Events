const mongoose = require('mongoose');
const carreraRepository = require('../repositories/carrera.repository');
const circuitoRepository = require('../repositories/circuito.repository');
const AppError = require('../utils/appError');
const { createUniqueSlug } = require('../utils/slug');

class CarreraService {
  validarId(id) {
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('El ID de la carrera no es válido', 400);
    }
  }

  validarPayload(payload, parcial = false) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new AppError('Los datos de la carrera deben enviarse en un payload válido', 400);
    }

    const carreraData = { ...payload };
    delete carreraData.slug;
    delete carreraData.deletedAt;

    const allowedFields = new Set([
      'nombre',
      'fecha',
      'capacidad',
      'circuito',
      'isActive',
      'status',
    ]);
    const unsupportedField = Object.keys(carreraData).find((field) => !allowedFields.has(field));
    if (unsupportedField) {
      throw new AppError(`El campo ${unsupportedField} no es válido para una carrera`, 400);
    }
    if (parcial && Object.keys(carreraData).length === 0) {
      throw new AppError('El payload debe incluir al menos un dato de la carrera', 400);
    }

    if (!parcial) {
      for (const field of ['nombre', 'fecha', 'capacidad', 'circuito']) {
        if (carreraData[field] === undefined || carreraData[field] === null) {
          throw new AppError(`El campo ${field} es obligatorio`, 400);
        }
      }
    }

    if (carreraData.nombre !== undefined) {
      if (typeof carreraData.nombre !== 'string' || !carreraData.nombre.trim()) {
        throw new AppError('El nombre de la carrera debe ser un texto no vacío', 400);
      }
      carreraData.nombre = carreraData.nombre.trim();
    }

    if (carreraData.fecha !== undefined) {
      if (
        !(carreraData.fecha instanceof Date) &&
        (typeof carreraData.fecha !== 'string' || !carreraData.fecha.trim())
      ) {
        throw new AppError('La fecha de la carrera no es válida', 400);
      }
      const fecha = new Date(carreraData.fecha);
      if (Number.isNaN(fecha.getTime())) {
        throw new AppError('La fecha de la carrera no es válida', 400);
      }
      carreraData.fecha = fecha;
    }

    if (carreraData.capacidad !== undefined) {
      if (
        (typeof carreraData.capacidad === 'string' && !carreraData.capacidad.trim()) ||
        (typeof carreraData.capacidad !== 'number' && typeof carreraData.capacidad !== 'string')
      ) {
        throw new AppError('La capacidad debe ser un número entero no negativo', 400);
      }
      const capacidad = Number(carreraData.capacidad);
      if (!Number.isInteger(capacidad) || capacidad < 0) {
        throw new AppError('La capacidad debe ser un número entero no negativo', 400);
      }
      carreraData.capacidad = capacidad;
    }

    if (carreraData.isActive !== undefined && typeof carreraData.isActive !== 'boolean') {
      throw new AppError('isActive debe ser un valor booleano', 400);
    }

    if (
      carreraData.status !== undefined &&
      (typeof carreraData.status !== 'string' || !carreraData.status.trim())
    ) {
      throw new AppError('status debe ser un texto no vacío', 400);
    }

    return carreraData;
  }

  async obtenerTodas(includeDeleted = false) {
    return carreraRepository.findAll(includeDeleted);
  }

  async obtenerPorId(id) {
    this.validarId(id);
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
    if (typeof circuitoId !== 'string' || !mongoose.Types.ObjectId.isValid(circuitoId)) {
      throw new AppError('El ID del circuito no es válido', 400);
    }
    const circuito = await circuitoRepository.findById(circuitoId);
    if (!circuito) {
      throw new AppError('El circuito proporcionado no existe', 400);
    }
  }

  async crearCarrera(payload) {
    const carreraData = this.validarPayload(payload);
    await this.validarCircuito(carreraData.circuito);
    carreraData.slug = await createUniqueSlug(
      carreraData.nombre,
      (slug, includeDeleted) => carreraRepository.findBySlug(slug, includeDeleted),
      null,
      'carrera'
    );

    return carreraRepository.create(carreraData);
  }

  async actualizarCarrera(id, payload) {
    const carreraActual = await this.obtenerPorId(id);
    const carreraData = this.validarPayload(payload, true);

    if (carreraData.circuito) {
      await this.validarCircuito(carreraData.circuito);
    }

    if (carreraData.nombre) {
      carreraData.slug = await createUniqueSlug(
        carreraData.nombre,
        (slug, includeDeleted) => carreraRepository.findBySlug(slug, includeDeleted),
        carreraActual._id.toString(),
        'carrera'
      );
    }

    const carreraActualizada = await carreraRepository.update(carreraActual._id, carreraData);
    if (!carreraActualizada) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return carreraActualizada;
  }

  async eliminarCarrera(id) {
    this.validarId(id);
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
