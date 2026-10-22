const Rol = require('../models/roles.model');
const CrudRepository = require('./crud.repository');

class RolRepository extends CrudRepository {
  constructor() {
    super(Rol);
  }
}

module.exports = new RolRepository();
