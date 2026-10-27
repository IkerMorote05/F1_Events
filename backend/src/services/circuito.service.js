const mongoose = require('mongoose');
const circuitoRepository = require('../repositories/circuito.repository');
const carreraRepository = require('../repositories/carrera.repository');
const locationRepository = require('../repositories/location.repository');
const CategoriaCircuitos = require('../models/categoria-circuitos.model');
const CategoriaGlobal = require('../models/categoria-global.model');
const AppError = require('../utils/appError');
const slugify = require('../utils/slug');
const { createUniqueSlug } = slugify;

class CircuitoService {
  async resolveCategoryReference(field, value) {
    if (value === undefined) {
      return undefined;
    }
    if (value === null || (typeof value === 'string' && !value.trim())) {
      return field === 'desgaste' ? null : undefined;
    }
    if (typeof value !== 'string') {
      throw new AppError(`El valor de ${field} no es válido`, 400);
    }

    const normalizedValue = value.trim();
    let category;
    if (mongoose.Types.ObjectId.isValid(normalizedValue)) {
      category = await CategoriaCircuitos.findById(normalizedValue);
      if (!category || typeof category[field] !== 'string' || !category[field].trim()) {
        throw new AppError(`La categoría de ${field} proporcionada no existe`, 400);
      }
    } else {
      category = await CategoriaCircuitos.findOne({ [field]: normalizedValue });
      if (!category) {
        category = await CategoriaCircuitos.create({
          [field]: normalizedValue,
          slug: `${field}-${slugify(normalizedValue) || 'categoria'}`,
        });
      }
    }
    return category._id;
  }

  async resolveCategoryReferences(data) {
    for (const field of ['tipo', 'desgaste']) {
      if (data[field] !== undefined) {
        data[field] = await this.resolveCategoryReference(field, data[field]);
      }
    }
  }

  async resolveGlobalCategory(value, required = false) {
    if (value === undefined || value === null || value === '') {
      if (required) {
        throw new AppError('La categoría del circuito es obligatoria', 400);
      }
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new AppError('El valor de la categoría no es válido', 400);
    }

    const normalizedValue = value.trim();
    const category = mongoose.Types.ObjectId.isValid(normalizedValue)
      ? await CategoriaGlobal.findById(normalizedValue)
      : await CategoriaGlobal.findOne({ competicion: normalizedValue });
    if (!category) {
      throw new AppError('La categoría proporcionada no existe', 400);
    }
    return category._id;
  }

  async validateRelations(data, required = false) {
    if (data.location === undefined) {
      if (required) {
        throw new AppError('La ubicación es obligatoria', 400);
      }
      return;
    }

    if (typeof data.location !== 'string' || !mongoose.Types.ObjectId.isValid(data.location)) {
      throw new AppError('El ID de la ubicación no es válido', 400);
    }
    const location = await locationRepository.findById(data.location);
    if (!location) {
      throw new AppError('La ubicación proporcionada no existe', 400);
    }
  }

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
    circuitoData.categoria = await this.resolveGlobalCategory(data.categoria, true);
    await this.resolveCategoryReferences(circuitoData);
    await this.validateRelations(circuitoData, true);
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
    if (data.categoria !== undefined) {
      circuitoData.categoria = await this.resolveGlobalCategory(data.categoria, true);
    }
    await this.resolveCategoryReferences(circuitoData);
    await this.validateRelations(circuitoData);

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
