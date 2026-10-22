const Usuario = require('../models/usuarios.model');
const CrudRepository = require('./crud.repository');

class UsuarioRepository extends CrudRepository {
  constructor() {
    super(Usuario, ['roles', 'avatar']);
  }

  async findByRole(roleId, includeDeleted = false) {
    const filter = { roles: roleId };
    if (!includeDeleted) filter.deletedAt = null;
    return Usuario.find(filter);
  }
}

module.exports = new UsuarioRepository();
