const CategoriaGlobal = require('../models/categoria-global.model');
const CrudRepository = require('./crud.repository');
const Circuito = require('../models/circuito.model');
const Escuderia = require('../models/escuderia.model');
const Piloto = require('../models/piloto.model');

class CategoriaGlobalRepository extends CrudRepository {
  constructor() {
    super(CategoriaGlobal);
  }

  findByCompeticion(competicion) {
    return CategoriaGlobal.findOne({ competicion });
  }

  async isReferenced(id) {
    const [circuito, escuderia, piloto] = await Promise.all([
      Circuito.exists({ categoria: id }),
      Escuderia.exists({ categoria: id }),
      Piloto.exists({ categoria: id }),
    ]);
    return Boolean(circuito || escuderia || piloto);
  }
}

module.exports = new CategoriaGlobalRepository();
