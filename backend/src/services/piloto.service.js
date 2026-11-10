const pilotoRepository = require('../repositories/piloto.repository');
const escuderiaRepository = require('../repositories/escuderia.repository');
const categoriaGlobalRepository = require('../repositories/categoria-global.repository');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const { createUniqueSlug } = require('../utils/slug');

const estadosValidos = ['compitiendo', 'agente libre', 'lesion', 'retirado', 'piloto reserva'];

class PilotoService {
  async validarEscuderiaYEstado(escuderiaId, estado, excludePilotId = null) {
    if (!estadosValidos.includes(estado)) {
      throw new AppError('El estado del piloto no es válido', 400);
    }

    const requiereEscuderia = ['compitiendo', 'lesion', 'piloto reserva'].includes(estado);
    if (!escuderiaId) {
      if (requiereEscuderia) {
        throw new AppError(`La escudería es obligatoria para un piloto ${estado}`, 400);
      }
      return null;
    }

    if (!mongoose.Types.ObjectId.isValid(escuderiaId)) {
      throw new AppError('La escudería proporcionada no es válida', 400);
    }

    const escuderia = await escuderiaRepository.findById(escuderiaId);
    if (!escuderia) {
      throw new AppError('La escudería proporcionada no existe', 400);
    }

    if (estado === 'compitiendo') {
      const pilotosCompitiendo = await pilotoRepository.countCompitiendoByEscuderia(
        escuderiaId,
        excludePilotId
      );
      if (pilotosCompitiendo >= 2) {
        throw new AppError('Una escudería no puede tener más de dos pilotos compitiendo', 400);
      }
    }
    return escuderia._id;
  }

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
    if (!(await categoriaGlobalRepository.findById(data.categoria))) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }

    const estado = data.estado ?? 'compitiendo';
    const escuderiaId = await this.validarEscuderiaYEstado(data.escuderia || null, estado);

    const numeroExistente = await pilotoRepository.findByNumero(data.numero);
    if (numeroExistente) {
      throw new AppError('El número de piloto ya está ocupado', 400);
    }

    const pilotoData = { ...data };
    delete pilotoData.deletedAt;
    pilotoData.estado = estado;
    pilotoData.escuderia = escuderiaId;
    pilotoData.slug = await createUniqueSlug(
      data.nombre,
      (slug, includeDeleted) => pilotoRepository.findBySlug(slug, includeDeleted),
      null,
      'piloto'
    );

    return pilotoRepository.create(pilotoData);
  }

  async actualizarPiloto(id, data) {
    const pilotoActual = await pilotoRepository.findById(id);
    if (!pilotoActual) {
      throw new AppError('Piloto no encontrado', 404);
    }

    if (data.categoria && !(await categoriaGlobalRepository.findById(data.categoria))) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }

    const currentEscuderiaId = pilotoActual.escuderia?._id
      ? pilotoActual.escuderia._id.toString()
      : pilotoActual.escuderia?.toString();
    const escuderiaSolicitada = Object.hasOwn(data, 'escuderia')
      ? data.escuderia || null
      : currentEscuderiaId || null;
    const estado = data.estado ?? pilotoActual.estado ?? 'compitiendo';
    const escuderiaId = await this.validarEscuderiaYEstado(
      escuderiaSolicitada,
      estado,
      pilotoActual._id
    );

    if (data.numero) {
      const numeroExistente = await pilotoRepository.findByNumero(data.numero);
      if (numeroExistente && numeroExistente._id.toString() !== id) {
        throw new AppError('El número de piloto ya está ocupado por otro piloto', 400);
      }
    }

    const pilotoData = { ...data };
    if (Object.hasOwn(data, 'escuderia')) {
      pilotoData.escuderia = escuderiaId;
    } else if (['compitiendo', 'lesion', 'piloto reserva'].includes(estado) && !currentEscuderiaId) {
      pilotoData.escuderia = escuderiaId;
    }
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
    const deletedPilot = await pilotoRepository.findBySlug(slug, true);
    if (!deletedPilot || !deletedPilot.deletedAt) {
      throw new AppError('Piloto eliminado no encontrado', 404);
    }
    const categoryId = deletedPilot.categoria?._id || deletedPilot.categoria;
    const escuderiaId = deletedPilot.escuderia?._id || deletedPilot.escuderia;
    if (!categoryId || !(await categoriaGlobalRepository.findById(categoryId))) {
      throw new AppError('No se puede restaurar el piloto porque su categoría no existe', 400);
    }
    const estado = deletedPilot.estado || 'compitiendo';
    await this.validarEscuderiaYEstado(
      escuderiaId?.toString() || null,
      estado,
      deletedPilot._id
    );

    const piloto = await pilotoRepository.restoreBySlug(slug);
    if (!piloto) {
      throw new AppError('Piloto eliminado no encontrado', 404);
    }
    return piloto;
  }
}

module.exports = new PilotoService();