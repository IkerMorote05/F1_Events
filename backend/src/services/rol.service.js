const rolRepository = require('../repositories/rol.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');

class RolService {
  obtenerTodos(includeDeleted = false) {
    return rolRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(rolRepository, identifier, 'Rol');
  }

  async crearRol(payload) {
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(rolRepository, data.nombre, null, 'rol');
    return rolRepository.create(data);
  }

  async actualizarRol(id, payload) {
    const current = await this.obtenerPorIdentificador(id);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    if (data.nombre) {
      data.slug = await uniqueSlug(rolRepository, data.nombre, current._id.toString(), 'rol');
    }
    const updated = await rolRepository.update(current._id, data);
    if (!updated) throw new AppError('Rol no encontrado', 404);
    return updated;
  }

  async eliminarRol(id) {
    const role = await rolRepository.findById(id);
    if (!role) throw new AppError('Rol no encontrado', 404);
    const users = await usuarioRepository.findByRole(role._id, true);
    if (users.length) throw new AppError('No se puede eliminar el rol porque tiene usuarios asociados', 400);
    return rolRepository.softDelete(role._id);
  }
}

module.exports = new RolService();
