const Location = require('../models/location.model');
const CrudRepository = require('./crud.repository');
const Circuito = require('../models/circuito.model');

class LocationRepository extends CrudRepository {
  constructor() {
    super(Location, ['images']);
  }

  isReferencedByCircuit(id) {
    return Circuito.exists({ location: id });
  }
}

module.exports = new LocationRepository();
