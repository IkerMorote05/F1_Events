const usuarioRepository = require('../repositories/usuario.repository');
const rolRepository = require('../repositories/rol.repository');
const imageRepository = require('../repositories/image.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');
const Profile = require('../models/profile.model');
const { hashPassword } = require('../utils/password');

const usuarioSlugSource = (user) => `${user.nombre}-${user.apellidos}`;

const serializeUsuario = (usuario) => {
  const data = usuario.toObject({ virtuals: true });
  const profile = data.profile;
  if (profile && typeof profile === 'object') delete profile.settings;
  return {
    ...data,
    nombre: profile?.nombre,
    apellidos: profile?.apellidos,
    avatar: profile?.avatar ?? null,
  };
};

class UsuarioService {
  async obtenerTodos(includeDeleted = false) {
    const usuarios = await usuarioRepository.findAll(includeDeleted);
    return usuarios.map(serializeUsuario);
  }

  async obtenerPorIdentificador(identifier) {
    return serializeUsuario(await findByIdentifier(usuarioRepository, identifier, 'Usuario'));
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
    const { nombre, apellidos, avatar, password } = data;
    delete data.nombre;
    delete data.apellidos;
    delete data.avatar;
    delete data.profile;
    data.password = await hashPassword(password);
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(usuarioRepository, usuarioSlugSource({ nombre, apellidos }), null, 'usuario');
    const user = await usuarioRepository.create(data);
    await Profile.create({
      user: user._id,
      nombre,
      apellidos,
      avatar: avatar || null,
    });
    return serializeUsuario(await usuarioRepository.findById(user._id));
  }

  async actualizarUsuario(id, payload) {
    const current = await this.obtenerPorIdentificador(id);
    await this.validarRelaciones(payload);
    const data = { ...payload };
    const profileData = {};
    for (const field of ['nombre', 'apellidos', 'avatar']) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        profileData[field] = field === 'avatar' && !data[field] ? null : data[field];
        delete data[field];
      }
    }
    delete data.profile;
    if (data.password) data.password = await hashPassword(data.password);
    const profileId = current.profile?._id || current.profile;
    if (Object.keys(profileData).length) {
      const profile = await Profile.findByIdAndUpdate(
        profileId,
        profileData,
        { new: true, runValidators: true }
      );
      if (!profile) throw new AppError('Perfil de usuario no encontrado', 404);
    }
    delete data.slug;
    delete data.deletedAt;
    if (profileData.nombre || profileData.apellidos) {
      data.slug = await uniqueSlug(
        usuarioRepository,
        usuarioSlugSource({
          nombre: profileData.nombre || current.nombre,
          apellidos: profileData.apellidos || current.apellidos,
        }),
        current._id.toString(),
        'usuario'
      );
    }
    const updated = await usuarioRepository.update(current._id, data);
    if (!updated) throw new AppError('Usuario no encontrado', 404);
    return serializeUsuario(updated);
  }

  async eliminarUsuario(id) {
    const deleted = await usuarioRepository.softDelete(id);
    if (!deleted) throw new AppError('Usuario no encontrado', 404);
    return serializeUsuario(deleted);
  }
}

module.exports = new UsuarioService();
