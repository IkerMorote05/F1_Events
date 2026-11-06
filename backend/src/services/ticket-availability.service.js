const ticketTypeRepository = require('../repositories/ticket-type.repository');
const carreraRepository = require('../repositories/carrera.repository');

const getId = (value) => value?._id?.toString() || value?.toString() || '';
const normalizePercentage = (value) => Math.round(Number(value) * 100) / 100;

const allocateRaceCapacity = (capacity, variants) => {
  const allocations = variants.map((variant) => {
    const percentage = Number(variant.percentage);
    const validPercentage = Number.isFinite(percentage) && percentage >= 0 && percentage <= 100
      ? percentage
      : 0;
    const exact = capacity * validPercentage / 100;
    const amount = Math.floor(exact);
    return { ...variant, amount, remainder: exact - amount };
  });
  const percentageTotal = normalizePercentage(
    variants.reduce((sum, variant) => sum + (Number.isFinite(variant.percentage) ? variant.percentage : 0), 0)
  );

  if (percentageTotal === 100) {
    const remaining = capacity - allocations.reduce((sum, item) => sum + item.amount, 0);
    allocations
      .slice()
      .sort((left, right) => (
        right.remainder - left.remainder || left.sku.localeCompare(right.sku)
      ))
      .slice(0, remaining)
      .forEach((item) => {
        const allocation = allocations.find((candidate) => candidate.id === item.id);
        allocation.amount += 1;
      });
  }

  return allocations;
};

class TicketAvailabilityService {
  async calcular() {
    const [ticketTypes, races] = await Promise.all([
      ticketTypeRepository.findAll(),
      carreraRepository.findAll(),
    ]);
    const racesByCircuit = new Map();
    const ticketsByCircuit = new Map();

    races.forEach((race) => {
      const circuitId = getId(race.circuito);
      if (!circuitId) return;
      const circuitRaces = racesByCircuit.get(circuitId) || [];
      circuitRaces.push(race);
      racesByCircuit.set(circuitId, circuitRaces);
    });

    ticketTypes.forEach((ticket) => {
      const circuitId = getId(ticket.circuit);
      const variant = ticket.category;
      if (!circuitId || !variant?._id) return;
      const circuitTickets = ticketsByCircuit.get(circuitId) || [];
      circuitTickets.push(ticket);
      ticketsByCircuit.set(circuitId, circuitTickets);
    });

    const ticketAvailability = new Map();
    const variantAvailability = new Map();

    ticketsByCircuit.forEach((circuitTickets, circuitId) => {
      const variantsById = new Map();
      circuitTickets.forEach((ticket) => {
        const variant = ticket.category;
        const id = getId(variant);
        if (!variantsById.has(id)) {
          variantsById.set(id, {
            id,
            sku: variant.sku || id,
            percentage: Number(variant.percentage),
          });
        }
      });

      const variants = [...variantsById.values()];
      const percentageTotal = normalizePercentage(
        variants.reduce((sum, variant) => sum + (Number.isFinite(variant.percentage) ? variant.percentage : 0), 0)
      );
      const configured = variants.every((variant) => (
        Number.isFinite(variant.percentage) && variant.percentage >= 0 && variant.percentage <= 100
      )) && percentageTotal === 100;
      const circuitRaces = racesByCircuit.get(circuitId) || [];
      const circuit = circuitRaces[0]?.circuito;

      variants.forEach((variant) => {
        variantAvailability.set(`${circuitId}:${variant.id}`, {
          circuitId,
          variantId: variant.id,
          circuitName: circuit?.nombre || 'Circuito',
          capacity: circuitRaces.reduce((sum, race) => sum + (Number(race.capacidad) || 0), 0),
          percentageTotal,
          configured,
          availableQuantity: 0,
        });
      });

      circuitRaces.forEach((race) => {
        const raceId = getId(race);
        const allocations = allocateRaceCapacity(Number(race.capacidad) || 0, variants);
        allocations.forEach((allocation) => {
          const key = `${circuitId}:${raceId}:${allocation.id}`;
          ticketAvailability.set(key, {
            availableQuantity: allocation.amount,
            percentageTotal,
            availabilityConfigured: configured,
          });
          const variantAvailabilityKey = `${circuitId}:${allocation.id}`;
          const availability = variantAvailability.get(variantAvailabilityKey);
          availability.availableQuantity += allocation.amount;
        });
      });

      circuitTickets.forEach((ticket) => {
        const key = `${circuitId}:${getId(ticket.race)}:${getId(ticket.category)}`;
        const availability = ticketAvailability.get(key) || {
          availableQuantity: 0,
          percentageTotal,
          availabilityConfigured: false,
        };
        ticketAvailability.set(`ticket:${getId(ticket)}`, availability);
      });
    });

    return { ticketAvailability, variantAvailability };
  }

  async withTicketAvailability(ticketTypes) {
    const { ticketAvailability } = await this.calcular();
    return ticketTypes.map((ticket) => {
      const ticketData = ticket.toObject();
      const basePrice = Number(ticketData.basePrice ?? ticketData.price);
      const price = Math.round((
        basePrice * Number(ticketData.duration) + Number(ticketData.category?.price || 0) + Number.EPSILON
      ) * 100) / 100;
      return {
        ...ticketData,
        basePrice,
        price,
        ...(ticketAvailability.get(`ticket:${getId(ticket)}`) || {
          availableQuantity: 0,
          percentageTotal: 0,
          availabilityConfigured: false,
        }),
      };
    });
  }

  async withVariantAvailability(variants) {
    const { variantAvailability } = await this.calcular();
    return variants.map((variant) => {
      const variantId = getId(variant);
      return {
        ...variant.toObject(),
        availabilityByCircuit: [...variantAvailability.values()]
          .filter((availability) => availability.variantId === variantId)
          .map((availability) => ({
            circuit: { _id: availability.circuitId, nombre: availability.circuitName },
            capacity: availability.capacity,
            percentageTotal: availability.percentageTotal,
            configured: availability.configured,
            availableQuantity: availability.availableQuantity,
          })),
      };
    });
  }
}

module.exports = new TicketAvailabilityService();
