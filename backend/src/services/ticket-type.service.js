const mongoose = require('mongoose');
const ticketTypeRepository = require('../repositories/ticket-type.repository');
const circuitoRepository = require('../repositories/circuito.repository');
const carreraRepository = require('../repositories/carrera.repository');
const variantRepository = require('../repositories/variant.repository');
const AppError = require('../utils/appError');
const slugify = require('../utils/slug');
const { ticketTypeCreate, ticketTypeUpdate } = require('../validators/schemas');
const ticketAvailabilityService = require('./ticket-availability.service');

const parsePayload = (schema, payload) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(result.error.issues.map(({ message }) => message).join('; '), 400);
  }
  return result.data;
};

class TicketTypeService {
  validarId(id) {
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('El ID del tipo de entrada no es válido', 400);
    }
  }

  async validarReferencias(data) {
    const [circuit, race, category] = await Promise.all([
      data.circuit ? circuitoRepository.findById(data.circuit) : null,
      data.race ? carreraRepository.findById(data.race) : null,
      data.category ? variantRepository.findById(data.category) : null,
    ]);

    if (data.circuit && !circuit) {
      throw new AppError('El circuito proporcionado no existe', 400);
    }
    if (data.race && !race) {
      throw new AppError('La carrera proporcionada no existe', 400);
    }
    if (data.category && !category) {
      throw new AppError('La variante proporcionada no existe', 400);
    }
    if (category && (!category.categoriaEntrada?.categoriaEntrada || !category.categoriaGrada?.categoriaGrada)) {
      throw new AppError('La variante debe tener una categoría de entrada y una categoría de grada válidas', 400);
    }
    if (category && (!Number.isFinite(category.price) || category.price < 0)) {
      throw new AppError('La variante debe tener un precio válido', 400);
    }
    if (category && (!Number.isFinite(category.percentage) || category.percentage < 0 || category.percentage > 100)) {
      throw new AppError('La variante debe tener un porcentaje de disponibilidad válido', 400);
    }

    if (race && circuit) {
      const raceCircuitId = race.circuito?._id || race.circuito;
      if (!raceCircuitId) {
        throw new AppError('La carrera no tiene un circuito válido asociado', 400);
      }
      if (raceCircuitId.toString() !== circuit._id.toString()) {
        throw new AppError('La carrera seleccionada no pertenece al circuito indicado', 400);
      }
    }

    return { circuit, race, category };
  }

  generarSku({ circuit, race, duration, category }) {
    return slugify(`${race.nombre}-${circuit.nombre}-${duration}-dias-${category.sku}`);
  }

  async validarPorcentajeEnCircuito(circuitId, category, currentTicketId = null) {
    const tickets = await ticketTypeRepository.findAll();
    const variants = new Map();

    tickets.forEach((ticket) => {
      if (currentTicketId && ticket._id.toString() === currentTicketId.toString()) return;
      if (ticket.circuit._id.toString() !== circuitId.toString()) return;
      const variant = ticket.category;
      variants.set(variant._id.toString(), Number(variant.percentage));
    });

    variants.set(category._id.toString(), Number(category.percentage));
    const percentageTotal = Math.round(
      ([...variants.values()].reduce(
        (sum, percentage) => sum + (Number.isFinite(percentage) ? percentage : 0),
        0
      ) + Number.EPSILON) * 100
    ) / 100;
    if (percentageTotal > 100) {
      throw new AppError('La suma de porcentajes de las variantes del circuito no puede superar el 100 %', 400);
    }
  }

  async validarSku(sku, currentId = null) {
    const existing = await ticketTypeRepository.findBySku(sku, true);
    if (existing && (!currentId || existing._id.toString() !== currentId.toString())) {
      throw new AppError('Ya existe un tipo de entrada con ese SKU', 409);
    }
  }

  async obtenerTodos(includeDeleted = false) {
    const ticketTypes = await ticketTypeRepository.findAll(includeDeleted);
    return ticketAvailabilityService.withTicketAvailability(ticketTypes);
  }

  async obtenerPorIdentificador(identifier) {
    const ticketType = await ticketTypeRepository.findByIdentifier(identifier);
    if (!ticketType) {
      throw new AppError('Tipo de entrada no encontrado', 404);
    }
    return (await ticketAvailabilityService.withTicketAvailability([ticketType]))[0];
  }

  async crear(payload) {
    const data = parsePayload(ticketTypeCreate, payload);
    data.estado = data.estado || 'Disponible';
    data.basePrice = Number(data.price);
    data.duration = Number(data.duration);
    const references = await this.validarReferencias(data);
    await this.validarPorcentajeEnCircuito(references.circuit._id, references.category);
    data.sku = this.generarSku({ ...references, duration: data.duration });
    await this.validarSku(data.sku);
    data.price = Math.round((
      data.basePrice * data.duration + references.category.price + Number.EPSILON
    ) * 100) / 100;
    const ticketType = await ticketTypeRepository.create(data);
    return (await ticketAvailabilityService.withTicketAvailability([ticketType]))[0];
  }

  async actualizar(id, payload) {
    this.validarId(id);
    const current = await ticketTypeRepository.findById(id);
    if (!current) {
      throw new AppError('Tipo de entrada no encontrado', 404);
    }

    const data = parsePayload(ticketTypeUpdate, payload);
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.duration !== undefined) data.duration = Number(data.duration);

    const references = await this.validarReferencias({
      circuit: data.circuit || current.circuit._id.toString(),
      race: data.race || current.race._id.toString(),
      category: data.category || current.category._id.toString(),
    });
    await this.validarPorcentajeEnCircuito(references.circuit._id, references.category, current._id);
    const basePrice = data.price ?? current.basePrice ?? current.price / current.duration;
    data.basePrice = basePrice;
    const duration = data.duration ?? current.duration;
    data.price = Math.round((basePrice * duration + references.category.price + Number.EPSILON) * 100) / 100;
    data.sku = this.generarSku({
      ...references,
      duration: data.duration ?? current.duration,
    });
    await this.validarSku(data.sku, current._id);

    const updated = await ticketTypeRepository.update(current._id, data);
    if (!updated) {
      throw new AppError('Tipo de entrada no encontrado', 404);
    }
    return (await ticketAvailabilityService.withTicketAvailability([updated]))[0];
  }

  async eliminar(id) {
    this.validarId(id);
    const deleted = await ticketTypeRepository.softDelete(id);
    if (!deleted) {
      throw new AppError('Tipo de entrada no encontrado', 404);
    }
    return deleted;
  }
}

module.exports = new TicketTypeService();
