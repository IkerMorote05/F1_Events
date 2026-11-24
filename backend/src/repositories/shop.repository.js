const mongoose = require('mongoose');
const CategoriaGlobal = require('../models/categoria-global.model');
const Carrera = require('../models/carrera.model');
const Circuito = require('../models/circuito.model');
const Escuderia = require('../models/escuderia.model');
const Location = require('../models/location.model');
const Piloto = require('../models/piloto.model');
const TicketType = require('../models/ticket-type.model');
const Variant = require('../models/variant.model');
const CategoriaCircuitos = require('../models/categoria-circuitos.model');

const sources = [
  {
    type: 'ticket',
    Model: TicketType,
    lookups: [
      ['circuit', Circuito, '_shopCircuit', 'circuit'],
      ['race', Carrera, '_shopRace', 'race'],
      ['category', Variant, '_shopVariant', 'category'],
    ],
    additions: [
      ['circuit.categoria', CategoriaGlobal, '_shopCategory'],
      ['circuit.location', Location, '_shopLocation'],
      ['category.categoriaEntrada', CategoriaCircuitos, '_shopEntryCategory'],
      ['category.categoriaGrada', CategoriaCircuitos, '_shopStandCategory'],
    ],
    categoryPaths: ['circuit.categoria', 'category.categoriaEntrada', 'category.categoriaGrada'],
    locationPaths: ['circuit.location'],
    circuitPaths: ['circuit'],
    racePaths: ['race'],
    pilotPaths: [],
    escuderiaPaths: [],
    searchPaths: [
      'sku', 'circuit.nombre', 'race.nombre', 'category.sku',
      'category.descripcion', 'circuit.location.ciudad', 'circuit.location.pais',
    ],
  },
  {
    type: 'circuit',
    Model: Circuito,
    lookups: [
      ['categoria', CategoriaGlobal, '_shopCategory', 'categoria'],
      ['location', Location, '_shopLocation', 'location'],
    ],
    additions: [],
    categoryPaths: ['categoria'],
    locationPaths: ['location'],
    circuitPaths: ['self'],
    racePaths: [],
    pilotPaths: [],
    escuderiaPaths: [],
    searchPaths: ['nombre', 'location.pais', 'location.ciudad', 'categoria.competicion'],
  },
  {
    type: 'race',
    Model: Carrera,
    lookups: [['circuito', Circuito, '_shopCircuit', 'circuito']],
    additions: [
      ['circuito.categoria', CategoriaGlobal, '_shopCategory'],
      ['circuito.location', Location, '_shopLocation'],
    ],
    categoryPaths: ['circuito.categoria'],
    locationPaths: ['circuito.location'],
    circuitPaths: ['circuito'],
    racePaths: ['self'],
    pilotPaths: [],
    escuderiaPaths: [],
    searchPaths: [
      'nombre', 'circuito.nombre', 'circuito.location.pais',
      'circuito.location.ciudad', 'circuito.categoria.competicion',
    ],
  },
  {
    type: 'pilot',
    Model: Piloto,
    lookups: [
      ['categoria', CategoriaGlobal, '_shopCategory', 'categoria'],
      ['escuderia', Escuderia, '_shopEscuderia', 'escuderia'],
    ],
    additions: [],
    categoryPaths: ['categoria'],
    locationPaths: [],
    circuitPaths: [],
    racePaths: [],
    pilotPaths: ['self'],
    escuderiaPaths: ['escuderia'],
    searchPaths: ['nombre', 'nacionalidad', 'escuderia.nombre', 'categoria.competicion'],
  },
  {
    type: 'escuderia',
    Model: Escuderia,
    lookups: [['categoria', CategoriaGlobal, '_shopCategory', 'categoria']],
    additions: [],
    categoryPaths: ['categoria'],
    locationPaths: [],
    circuitPaths: [],
    racePaths: [],
    pilotPaths: [],
    escuderiaPaths: ['self'],
    searchPaths: ['nombre', 'pais', 'motor', 'siglas', 'categoria.competicion'],
  },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseValues = (value) => (Array.isArray(value) ? value : [value])
  .flatMap((item) => typeof item === 'string' ? item.split(',') : [])
  .map((item) => item.trim())
  .filter(Boolean);

const lookup = (localField, Model, as) => ({
  $lookup: {
    from: Model.collection.name,
    localField,
    foreignField: '_id',
    as,
  },
});

const getRelationPaths = (paths) => paths.map((path) => {
  if (path === 'self') {
    return { id: '_id', slug: 'slug', names: ['nombre', 'sku'] };
  }
  const prefix = path;
  return {
    id: `${prefix}._id`,
    slug: `${prefix}.slug`,
    names: ['nombre', 'competicion', 'ciudad', 'pais', 'capital', 'sku'].map((field) => `${prefix}.${field}`),
  };
});

const matchesValues = (paths, values) => {
  if (!paths.length) return { _id: { $exists: false } };
  const terms = [];
  const ids = values.filter((value) => /^[\da-f]{24}$/i.test(value));
  if (ids.length) {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    paths.forEach(({ id }) => terms.push({ [id]: { $in: objectIds } }));
  }
  const patterns = values.map((value) => new RegExp(`^${escapeRegex(value)}$`, 'i'));
  paths.forEach(({ slug, names }) => {
    terms.push({ [slug]: { $in: patterns } });
    names.forEach((name) => terms.push({ [name]: { $in: patterns } }));
  });
  return { $or: terms };
};

const buildMatch = (source, params) => {
  const match = {
    deletedAt: null,
    isActive: { $ne: false },
  };
  const filters = [];
  const filterPaths = [
    ['category', source.categoryPaths],
    ['location', source.locationPaths],
    ['localizacion', source.locationPaths],
    ['circuit', source.circuitPaths],
    ['race', source.racePaths],
    ['pilot', source.pilotPaths],
    ['escuderia', source.escuderiaPaths],
    ['ticket', source.type === 'ticket' ? ['self'] : []],
  ];

  filterPaths.forEach(([key, configuredPaths]) => {
    const values = parseValues(params[key]);
    if (!values.length) return;
    filters.push(matchesValues(getRelationPaths(configuredPaths), values));
  });

  if (params.search) {
    const pattern = new RegExp(escapeRegex(params.search), 'i');
    filters.push({
      $or: source.searchPaths.map((path) => ({ [path]: pattern })),
    });
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    if (source.type !== 'ticket') return null;
    match.price = {};
    if (params.minPrice !== undefined) match.price.$gte = params.minPrice;
    if (params.maxPrice !== undefined) match.price.$lte = params.maxPrice;
  }

  if (source.type === 'ticket') match.estado = 'Disponible';
  if (filters.length) match.$and = filters;
  return match;
};

const buildPipeline = (source, params, offset = 0, limit = 0) => {
  const match = buildMatch(source, params);
  if (!match) return null;
  const stages = source.lookups.map(([field, Model, as]) => lookup(field, Model, as));
  source.additions.forEach(([field, Model, as]) => stages.push(lookup(field, Model, as)));

  source.lookups.forEach(([, , as, output]) => {
    stages.push({ $set: { [output]: { $arrayElemAt: [`$${as}`, 0] } } });
  });

  source.additions.forEach(([field, , as]) => {
    const outputPath = field.split('.').slice(0, -1).join('.');
    const relationField = field.split('.').at(-1);
    stages.push({
      $set: {
        [`${outputPath}.${relationField}`]: { $arrayElemAt: [`$${as}`, 0] },
      },
    });
  });

  stages.push({ $match: match });
  if (limit > 0) {
    stages.push({ $sort: { nombre: 1, sku: 1, _id: 1 } }, { $skip: offset }, { $limit: limit });
  } else {
    stages.push({ $count: 'total' });
  }

  if (limit > 0) {
    stages.push({
      $set: {
        type: { $literal: source.type },
        title: source.type === 'ticket' ? '$sku' : '$nombre',
      },
    });
    stages.push({
      $unset: source.lookups.map(([, , as]) => as).concat(
        source.additions.map(([, , as]) => as)
      ),
    });
  }
  return stages;
};

class ShopRepository {
  async searchCatalog(params) {
    const selected = sources.filter((source) => !params.types || params.types.includes(source.type));
    const counts = await Promise.all(selected.map(async (source) => {
      const pipeline = buildPipeline(source, params);
      if (!pipeline) return 0;
      const [result] = await source.Model.aggregate(pipeline);
      return result?.total || 0;
    }));

    let remainingOffset = params.offset;
    let remainingLimit = params.limit;
    const ranges = selected.map((source, index) => {
      const total = counts[index];
      const skipped = Math.min(remainingOffset, total);
      remainingOffset -= skipped;
      const take = Math.min(remainingLimit, total - skipped);
      remainingLimit -= take;
      return { source, skipped, take };
    });
    const pages = await Promise.all(ranges.map(({ source, skipped, take }) => {
      if (!take) return [];
      return source.Model.aggregate(buildPipeline(source, params, skipped, take));
    }));

    return {
      items: pages.flat(),
      total: counts.reduce((sum, count) => sum + count, 0),
    };
  }

  async findCircuitLocations() {
    const locationIds = await Circuito.distinct('location', {
      deletedAt: null,
      isActive: { $ne: false },
    });
    return Location.find({ _id: { $in: locationIds }, deletedAt: null })
      .sort({ pais: 1, ciudad: 1 });
  }
}

module.exports = new ShopRepository();
