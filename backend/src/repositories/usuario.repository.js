const Usuario = require('../models/usuarios.model');
const CrudRepository = require('./crud.repository');

class UsuarioRepository extends CrudRepository {
  constructor() {
    super(Usuario, [
      'roles',
      { path: 'profile', populate: { path: 'avatar' } },
      'images',
    ]);
  }

  async findAll(includeDeleted = false) {
    const filter = includeDeleted ? {} : { deletedAt: null };
    return this.Model.find(filter)
      .populate('roles')
      .populate({ path: 'profile', populate: { path: 'avatar' } });
  }

  async create(data) {
    return this.Model.create(data);
  }

  async findByRole(roleId, includeDeleted = false) {
    const filter = { roles: roleId };
    if (!includeDeleted) filter.deletedAt = null;
    return Usuario.find(filter);
  }
}

module.exports = new UsuarioRepository();
