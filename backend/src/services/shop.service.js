const AppError = require('../utils/appError');
const shopRepository = require('../repositories/shop.repository');
const ticketTypeRepository = require('../repositories/ticket-type.repository');
const categoriaGlobalService = require('./categoria-global.service');
const categoriaCircuitosService = require('./categoria-circuitos.service');
const carreraService = require('./carrera.service');
const circuitoService = require('./circuito.service');
const escuderiaService = require('./escuderia.service');
const locationService = require('./location.service');
const pilotoService = require('./piloto.service');
const ticketTypeService = require('./ticket-type.service');
const ticketAvailabilityService = require('./ticket-availability.service');

const activeOnly = (items) => items.filter((item) => item.isActive !== false);

const HOME_RESOURCES = {
  categories: async () => {
    const [global, circuit] = await Promise.all([
      categoriaGlobalService.obtenerTodas(),
      categoriaCircuitosService.obtenerTodas(),
    ]);
    return {
      global: activeOnly(global),
      circuit: activeOnly(circuit),
    };
  },
  locations: async () => activeOnly(await locationService.obtenerTodas()),
  circuits: async () => activeOnly(await circuitoService.obtenerTodos()),
  races: async () => activeOnly(await carreraService.obtenerTodas()),
  pilots: async () => activeOnly(await pilotoService.obtenerTodos()),
  tickets: async () => (await ticketTypeService.obtenerTodos()).filter(
    ({ estado, isActive }) => estado === 'Disponible' && isActive !== false
  ),
  escuderias: async () => activeOnly(await escuderiaService.obtenerTodas()),
  localizaciones: () => shopRepository.findCircuitLocations(),
};

const integerParam = (value, name, defaultValue, maximum = Number.MAX_SAFE_INTEGER) => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AppError(`${name} debe ser un entero`, 400);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > maximum) {
    throw new AppError(`${name} debe ser un entero entre 0 y ${maximum}`, 400);
  }
  return parsed;
};

const priceParam = (value, name) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AppError(`${name} debe ser un número no negativo`, 400);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new AppError(`${name} debe ser un número no negativo`, 400);
  }
  return parsed;
};

const scalarParam = (value, name) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim() || value.length > 120) {
    throw new AppError(`${name} debe ser un valor no vacío`, 400);
  }
  return value.trim();
};

const parseTypes = (value) => {
  if (value === undefined) return undefined;
  const aliases = {
    tickets: 'ticket',
    ticket: 'ticket',
    circuits: 'circuit',
    circuitos: 'circuit',
    circuit: 'circuit',
    races: 'race',
    carreras: 'race',
    race: 'race',
    pilots: 'pilot',
    pilotos: 'pilot',
    pilot: 'pilot',
    escuderias: 'escuderia',
    teams: 'escuderia',
    escuderia: 'escuderia',
  };
  const values = value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  const types = values.map((item) => aliases[item]);
  if (!values.length || types.some((type) => !type)) {
    throw new AppError('type contiene un tipo de catálogo no válido', 400);
  }
  return [...new Set(types)];
};

const normalizeQuery = (query) => {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new AppError('Los parámetros de búsqueda no son válidos', 400);
  }
  const search = scalarParam(query.search, 'search');
  if (search?.length > 100) throw new AppError('search no puede superar 100 caracteres', 400);

  const params = {
    search,
    types: parseTypes(scalarParam(query.type, 'type')),
    limit: integerParam(query.limit, 'limit', 20, 100),
    offset: integerParam(query.offset, 'offset', 0),
    minPrice: priceParam(query.minPrice, 'minPrice'),
    maxPrice: priceParam(query.maxPrice, 'maxPrice'),
  };

  if (params.limit < 1) throw new AppError('limit debe estar entre 1 y 100', 400);
  if (params.minPrice !== undefined && params.maxPrice !== undefined
    && params.minPrice > params.maxPrice) {
    throw new AppError('minPrice no puede superar maxPrice', 400);
  }

  const aliases = {
    category: ['category', 'categories', 'categoria', 'categorias'],
    location: ['location', 'locations'],
    localizacion: ['localizacion', 'localizaciones'],
    circuit: ['circuit', 'circuits', 'circuito', 'circuitos'],
    race: ['race', 'races', 'carrera', 'carreras'],
    pilot: ['pilot', 'pilots', 'piloto', 'pilotos'],
    escuderia: ['escuderia', 'escuderias', 'team', 'teams'],
    ticket: ['ticket', 'tickets'],
  };
  for (const [key, names] of Object.entries(aliases)) {
    const values = names
      .filter((name) => query[name] !== undefined)
      .map((name) => scalarParam(query[name], name));
    params[key] = values.length ? values.join(',') : undefined;
  }
  return params;
};

class ShopService {
  async obtenerHome(resource) {
    const getResource = HOME_RESOURCES[resource];
    if (!getResource) throw new AppError('Recurso de Home no encontrado', 404);
    return getResource();
  }

  async listar(query) {
    const params = normalizeQuery(query);
    const result = await shopRepository.searchCatalog(params);
    return { ...result, limit: params.limit, offset: params.offset };
  }

  async obtenerDetalle(slug) {
    const ticket = await ticketTypeService.obtenerPorIdentificador(slug);
    const variants = await ticketTypeRepository.findAvailableByRaceAndCircuit(
      ticket.race._id,
      ticket.circuit._id
    );
    return {
      ...ticket,
      variants: await ticketAvailabilityService.withTicketAvailability(variants),
    };
  }
}

module.exports = new ShopService();
