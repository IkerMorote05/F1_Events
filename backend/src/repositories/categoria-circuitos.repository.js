const CategoriaCircuitos = require('../models/categoria-circuitos.model');
const Circuito = require('../models/circuito.model');
const CrudRepository = require('./crud.repository');

class CategoriaCircuitosRepository extends CrudRepository {
  constructor() {
    super(CategoriaCircuitos);
  }

  findByTipo(tipo) {
    return CategoriaCircuitos.findOne({ tipo });
  }

  findByDesgaste(desgaste) {
    return CategoriaCircuitos.findOne({ desgaste });
  }

  isReferencedBy(field, id) {
    return Circuito.exists({ [field]: id });
  }
}

module.exports = new CategoriaCircuitosRepository();
