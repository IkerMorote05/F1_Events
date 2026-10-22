const Location = require('../models/location.model');
const CrudRepository = require('./crud.repository');

class LocationRepository extends CrudRepository {
  constructor() {
    super(Location);
  }
}

module.exports = new LocationRepository();
