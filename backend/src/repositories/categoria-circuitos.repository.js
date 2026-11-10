const CategoriaCircuitos = require('../models/categoria-circuitos.model');
const Circuito = require('../models/circuito.model');
const Variant = require('../models/variant.model');
const CrudRepository = require('./crud.repository');

class CategoriaCircuitosRepository extends CrudRepository {
  constructor() {
    super(CategoriaCircuitos);
  }

  findByTipo(tipo) {
    return CategoriaCircuitos.findOne({ tipo, deletedAt: null });
  }

  findByDesgaste(desgaste) {
    return CategoriaCircuitos.findOne({ desgaste, deletedAt: null });
  }

  findByCategoriaEntrada(categoriaEntrada) {
    return CategoriaCircuitos.findOne({ categoriaEntrada, deletedAt: null });
  }

  findByCategoriaGrada(categoriaGrada) {
    return CategoriaCircuitos.findOne({ categoriaGrada, deletedAt: null });
  }

  async isReferencedBy(field, id) {
    const [circuit, variant] = await Promise.all([
      Circuito.exists({ [field]: id }),
      Variant.exists({
        $or: [{ categoriaEntrada: id }, { categoriaGrada: id }],
        deletedAt: null,
      }),
    ]);
    return Boolean(circuit || variant);
  }
}

module.exports = new CategoriaCircuitosRepository();
