const mongoose = require('mongoose');
const TicketType = require('../models/ticket-type.model');
const CrudRepository = require('./crud.repository');

class TicketTypeRepository extends CrudRepository {
  constructor() {
    super(TicketType);
  }

  populate(query) {
    return query
      .populate('circuit', 'nombre slug location')
      .populate('race', 'nombre slug fecha circuito capacidad')
      .populate({
        path: 'category',
        select: 'sku slug price descripcion percentage categoriaEntrada categoriaGrada',
        populate: [
          { path: 'categoriaEntrada', select: 'categoriaEntrada slug' },
          { path: 'categoriaGrada', select: 'categoriaGrada slug' },
        ],
      });
  }

  findBySku(sku, includeDeleted = false) {
    const filter = { sku };
    if (!includeDeleted) filter.deletedAt = null;
    return this.populate(TicketType.findOne(filter));
  }

  isReferencedByRace(id) {
    return TicketType.exists({ race: id });
  }

  async findByIdentifier(identifier) {
    const bySku = await this.findBySku(identifier);
    if (bySku) return bySku;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      return this.findById(identifier);
    }
    return null;
  }
}

module.exports = new TicketTypeRepository();
