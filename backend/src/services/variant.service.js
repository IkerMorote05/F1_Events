const variantRepository = require('../repositories/variant.repository');
const imageRepository = require('../repositories/image.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');

class VariantService {
  obtenerTodas(includeDeleted = false) {
    return variantRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(variantRepository, identifier, 'Variante');
  }

  async crearVariant(payload) {
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(variantRepository, data.sku, null, 'variant');
    return variantRepository.create(data);
  }

  async actualizarVariant(id, payload) {
    const current = await this.obtenerPorIdentificador(id);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    if (data.sku) {
      data.slug = await uniqueSlug(variantRepository, data.sku, current._id.toString(), 'variant');
    }
    const updated = await variantRepository.update(current._id, data);
    if (!updated) throw new AppError('Variante no encontrada', 404);
    return updated;
  }

  async eliminarVariant(id) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variante no encontrada', 404);
    const images = await imageRepository.findByEntity('Variant', variant._id);
    if (images.length) throw new AppError('No se puede eliminar la variante porque tiene imágenes asociadas', 400);
    return variantRepository.softDelete(variant._id);
  }
}

module.exports = new VariantService();
