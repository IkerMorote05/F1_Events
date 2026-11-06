const mongoose = require('mongoose');
const variantRepository = require('../repositories/variant.repository');
const imageRepository = require('../repositories/image.repository');
const categoriaCircuitosRepository = require('../repositories/categoria-circuitos.repository');
const AppError = require('../utils/appError');
const slugify = require('../utils/slug');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');
const { variantCreate, variantUpdate } = require('../validators/schemas');
const ticketAvailabilityService = require('./ticket-availability.service');
const ticketTypeRepository = require('../repositories/ticket-type.repository');

const validatePayload = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(result.error.issues.map(({ message }) => message).join('; '), 400);
  }
  return result.data;
};

class VariantService {
  async validarReferencias(data) {
    const [categoriaEntrada, categoriaGrada] = await Promise.all([
      data.categoriaEntrada ? categoriaCircuitosRepository.findById(data.categoriaEntrada) : null,
      data.categoriaGrada ? categoriaCircuitosRepository.findById(data.categoriaGrada) : null,
    ]);

    if (data.categoriaEntrada && !categoriaEntrada) {
      throw new AppError('La categoría de entrada proporcionada no existe', 400);
    }
    if (categoriaEntrada && !categoriaEntrada.categoriaEntrada) {
      throw new AppError('La categoría seleccionada debe ser de clase categoriaEntrada', 400);
    }
    if (data.categoriaGrada && !categoriaGrada) {
      throw new AppError('La categoría de grada proporcionada no existe', 400);
    }
    if (categoriaGrada && !categoriaGrada.categoriaGrada) {
      throw new AppError('La categoría seleccionada debe ser de clase categoriaGrada', 400);
    }

    return { categoriaEntrada, categoriaGrada };
  }

  async generarSku(categoriaEntrada, categoriaGrada, currentId = null) {
    const entradaPart = slugify(categoriaEntrada.categoriaEntrada);
    const gradaPart = slugify(categoriaGrada.categoriaGrada);
    const entrada = entradaPart.replace(/^entrada-/, '') || entradaPart;
    const grada = gradaPart.replace(/^grada-/, '') || gradaPart;
    const sku = `entrada-${entrada}-grada-${grada}`;
    const existing = await variantRepository.findBySku(sku);

    if (existing && (!currentId || existing._id.toString() !== currentId.toString())) {
      throw new AppError('Ya existe una variante para esas categorías de entrada y grada', 409);
    }

    return sku;
  }

  async validarPorcentajeEnCircuitos(variantId, percentage) {
    const tickets = await ticketTypeRepository.findAll();
    const variantsByCircuit = new Map();

    tickets.forEach((ticket) => {
      const circuitId = ticket.circuit?._id?.toString();
      const variant = ticket.category;
      if (!circuitId || !variant?._id) return;
      const variants = variantsByCircuit.get(circuitId) || new Map();
      const currentVariantId = variant._id.toString();
      variants.set(currentVariantId, currentVariantId === variantId.toString()
        ? percentage
        : Number(variant.percentage));
      variantsByCircuit.set(circuitId, variants);
    });
    for (const variants of variantsByCircuit.values()) {
      const total = [...variants.values()].reduce(
        (sum, value) => sum + (Number.isFinite(value) ? value : 0),
        0
      );
      if (total > 100) {
        throw new AppError('La suma de porcentajes de las variantes del circuito no puede superar el 100 %', 400);
      }
    }
  }

  async obtenerTodas(includeDeleted = false) {
    const variants = await variantRepository.findAll(includeDeleted);
    return ticketAvailabilityService.withVariantAvailability(variants);
  }

  async obtenerPorIdentificador(identifier) {
    const variant = await findByIdentifier(variantRepository, identifier, 'Variante');
    return (await ticketAvailabilityService.withVariantAvailability([variant]))[0];
  }

  async crearVariant(payload) {
    const data = validatePayload(variantCreate, payload);
    data.price = Number(data.price);
    data.percentage = Number(data.percentage);
    const { categoriaEntrada, categoriaGrada } = await this.validarReferencias(data);
    data.sku = await this.generarSku(categoriaEntrada, categoriaGrada);
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(variantRepository, data.sku, null, 'variant');
    const variant = await variantRepository.create(data);
    return (await ticketAvailabilityService.withVariantAvailability([variant]))[0];
  }

  async actualizarVariant(id, payload) {
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('El ID de la variante no es válido', 400);
    }
    const current = await variantRepository.findById(id);
    if (!current) throw new AppError('Variante no encontrada', 404);
    const data = validatePayload(variantUpdate, payload);
    if (data.price !== undefined) data.price = Number(data.price);
    const categoriaEntradaId = data.categoriaEntrada || current.categoriaEntrada._id.toString();
    const categoriaGradaId = data.categoriaGrada || current.categoriaGrada._id.toString();
    const { categoriaEntrada, categoriaGrada } = await this.validarReferencias({
      categoriaEntrada: categoriaEntradaId,
      categoriaGrada: categoriaGradaId,
    });
    const percentage = Number(data.percentage ?? current.percentage);
    if (Number.isFinite(percentage)) {
      await this.validarPorcentajeEnCircuitos(current._id, percentage);
      data.percentage = percentage;
    }
    data.sku = await this.generarSku(categoriaEntrada, categoriaGrada, current._id);
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(variantRepository, data.sku, current._id.toString(), 'variant');
    const updated = await variantRepository.update(current._id, data);
    if (!updated) throw new AppError('Variante no encontrada', 404);
    return (await ticketAvailabilityService.withVariantAvailability([updated]))[0];
  }

  async eliminarVariant(id) {
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('El ID de la variante no es válido', 400);
    }
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variante no encontrada', 404);
    if (await variantRepository.isReferencedByTicketType(variant._id)) {
      throw new AppError('No se puede eliminar la variante porque hay tipos de entrada asociados', 400);
    }
    const images = await imageRepository.findByEntity('Variant', variant._id);
    if (images.length) throw new AppError('No se puede eliminar la variante porque tiene imágenes asociadas', 400);
    return variantRepository.softDelete(variant._id);
  }
}

module.exports = new VariantService();
