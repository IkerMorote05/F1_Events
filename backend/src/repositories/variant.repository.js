const Variant = require('../models/variant.model');
const TicketType = require('../models/ticket-type.model');
const CrudRepository = require('./crud.repository');

class VariantRepository extends CrudRepository {
  constructor() {
    super(Variant);
  }

  populate(query) {
    return query
      .populate('categoriaEntrada', 'categoriaEntrada slug')
      .populate('categoriaGrada', 'categoriaGrada slug');
  }

  findBySku(sku) {
    return this.populate(Variant.findOne({ sku }));
  }

  isReferencedByTicketType(id) {
    return TicketType.exists({ category: id, deletedAt: null });
  }
}

module.exports = new VariantRepository();
