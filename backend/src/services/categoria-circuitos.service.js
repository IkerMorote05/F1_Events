const categoriaCircuitosRepository = require('../repositories/categoria-circuitos.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');
const {
  categoriaCircuitosCreate,
  categoriaCircuitosUpdate,
} = require('../validators/schemas');

const validatePayload = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(result.error.issues.map(({ message }) => message).join('; '), 400);
  }
  return result.data;
};

const categoryField = (data) => (data.tipo ? 'tipo' : 'desgaste');
const categoryValue = (data, field) => data[field];

class CategoriaCircuitosService {
  obtenerTodas(includeDeleted = false) {
    return categoriaCircuitosRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(categoriaCircuitosRepository, identifier, 'Categoría de circuitos');
  }

  async crearCategoriaCircuitos(payload) {
    const data = validatePayload(categoriaCircuitosCreate, payload);
    const field = categoryField(data);
    const value = categoryValue(data, field);
    const existing = field === 'tipo'
      ? await categoriaCircuitosRepository.findByTipo(value)
      : await categoriaCircuitosRepository.findByDesgaste(value);
    if (existing) {
      throw new AppError(`Ya existe una categoría para ${field} "${value}"`, 400);
    }

    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(
      categoriaCircuitosRepository,
      `${field}-${value}`,
      null,
      'categoria-circuitos'
    );
    return categoriaCircuitosRepository.create(data);
  }

  async actualizarCategoriaCircuitos(identifier, payload) {
    const current = await this.obtenerPorIdentificador(identifier);
    const data = validatePayload(categoriaCircuitosUpdate, payload);
    const currentField = current.tipo ? 'tipo' : 'desgaste';
    const field = data.tipo || data.desgaste ? categoryField(data) : currentField;
    if (data.tipo || data.desgaste) {
      if (field !== currentField) {
        throw new AppError(
          'No se puede cambiar una categoría de tipo por una categoría de desgaste o viceversa',
          400
        );
      }

      const value = categoryValue(data, field);
      const existing = field === 'tipo'
        ? await categoriaCircuitosRepository.findByTipo(value)
        : await categoriaCircuitosRepository.findByDesgaste(value);
      if (existing && existing._id.toString() !== current._id.toString()) {
        throw new AppError(`Ya existe una categoría para ${field} "${value}"`, 400);
      }

      delete data.slug;
      delete data.deletedAt;
      data.slug = await uniqueSlug(
        categoriaCircuitosRepository,
        `${field}-${value}`,
        current._id.toString(),
        'categoria-circuitos'
      );
    } else {
      delete data.slug;
      delete data.deletedAt;
    }
    const updated = await categoriaCircuitosRepository.update(current._id, data);
    if (!updated) throw new AppError('Categoría de circuitos no encontrada', 404);
    return updated;
  }

  async eliminarCategoriaCircuitos(identifier) {
    const category = await this.obtenerPorIdentificador(identifier);
    const field = category.tipo ? 'tipo' : 'desgaste';
    if (await categoriaCircuitosRepository.isReferencedBy(field, category._id)) {
      throw new AppError(`No se puede eliminar la categoría de ${field} porque hay circuitos asociados`, 400);
    }
    return categoriaCircuitosRepository.softDelete(category._id);
  }
}

module.exports = new CategoriaCircuitosService();
