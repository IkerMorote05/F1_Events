const usuarioRepository = require('../repositories/usuario.repository');
const rolRepository = require('../repositories/rol.repository');
const imageRepository = require('../repositories/image.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');

const usuarioSlugSource = (user) => `${user.nombre}-${user.apellidos}`;

class UsuarioService {
  obtenerTodos(includeDeleted = false) {
    return usuarioRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(usuarioRepository, identifier, 'Usuario');
  }

  async validarRelaciones(data) {
    if (data.roles && !(await rolRepository.findById(data.roles))) {
      throw new AppError('El rol proporcionado no existe', 400);
    }
    if (data.avatar && !(await imageRepository.findById(data.avatar))) {
      throw new AppError('La imagen de avatar proporcionada no existe', 400);
    }
  }

  async crearUsuario(payload) {
    await this.validarRelaciones(payload);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(usuarioRepository, usuarioSlugSource(data), null, 'usuario');
    return usuarioRepository.create(data);
  }

  async actualizarUsuario(id, payload) {
    const current = await this.obtenerPorIdentificador(id);
    await this.validarRelaciones(payload);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    if (data.nombre || data.apellidos) {
      data.slug = await uniqueSlug(
        usuarioRepository,
        usuarioSlugSource({ ...current.toObject(), ...data }),
        current._id.toString(),
        'usuario'
      );
    }
    const updated = await usuarioRepository.update(current._id, data);
    if (!updated) throw new AppError('Usuario no encontrado', 404);
    return updated;
  }

  async eliminarUsuario(id) {
    const deleted = await usuarioRepository.softDelete(id);
    if (!deleted) throw new AppError('Usuario no encontrado', 404);
    return deleted;
  }
}

module.exports = new UsuarioService();
