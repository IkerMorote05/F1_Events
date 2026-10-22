const Variant = require('../models/variant.model');
const CrudRepository = require('./crud.repository');

class VariantRepository extends CrudRepository {
  constructor() {
    super(Variant);
  }
}

module.exports = new VariantRepository();
