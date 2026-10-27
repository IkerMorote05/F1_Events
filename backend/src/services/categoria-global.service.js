const categoriaGlobalRepository = require('../repositories/categoria-global.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');
const { categoriaGlobalCreate, categoriaGlobalUpdate } = require('../validators/schemas');

const validatePayload = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(result.error.issues.map(({ message }) => message).join('; '), 400);
  }
  return result.data;
};

class CategoriaGlobalService {
  obtenerTodas(includeDeleted = false) {
    return categoriaGlobalRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(categoriaGlobalRepository, identifier, 'Categoría global');
  }

  async crearCategoriaGlobal(payload) {
    const data = validatePayload(categoriaGlobalCreate, payload);
    if (await categoriaGlobalRepository.findByCompeticion(data.competicion)) {
      throw new AppError('Ya existe una categoría global para esa competición', 400);
    }

    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(categoriaGlobalRepository, data.competicion, null, 'categoria-global');
    return categoriaGlobalRepository.create(data);
  }

  async actualizarCategoriaGlobal(identifier, payload) {
    const current = await this.obtenerPorIdentificador(identifier);
    const data = validatePayload(categoriaGlobalUpdate, payload);
    delete data.slug;
    delete data.deletedAt;

    if (data.competicion) {
      const existing = await categoriaGlobalRepository.findByCompeticion(data.competicion);
      if (existing && existing._id.toString() !== current._id.toString()) {
        throw new AppError('Ya existe una categoría global para esa competición', 400);
      }
      data.slug = await uniqueSlug(
        categoriaGlobalRepository,
        data.competicion,
        current._id.toString(),
        'categoria-global'
      );
    }

    const updated = await categoriaGlobalRepository.update(current._id, data);
    if (!updated) throw new AppError('Categoría global no encontrada', 404);
    return updated;
  }

  async eliminarCategoriaGlobal(identifier) {
    const category = await this.obtenerPorIdentificador(identifier);
    if (await categoriaGlobalRepository.isReferenced(category._id)) {
      throw new AppError('No se puede eliminar la categoría global porque tiene entidades asociadas', 400);
    }
    return categoriaGlobalRepository.softDelete(category._id);
  }
}

module.exports = new CategoriaGlobalService();
