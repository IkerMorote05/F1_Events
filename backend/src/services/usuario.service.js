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
    if (data.roles) {
      const role = await rolRepository.findById(data.roles);
      if (!role || !role.isActive || role.deletedAt) {
        throw new AppError('El rol proporcionado no existe o no está activo', 400);
      }
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
    try {
      await Profile.create({
        user: user._id,
        nombre,
        apellidos,
        avatar: avatar || null,
      });
    } catch (error) {
      const cleanup = await usuarioRepository.Model.deleteOne({ _id: user._id });
      if (cleanup.deletedCount !== 1) {
        throw new AppError('No se pudo asociar el perfil ni eliminar la cuenta incompleta', 500);
      }
      throw error;
    }
    const createdUser = await usuarioRepository.findById(user._id);
    if (!createdUser?.profile) {
      await Profile.deleteOne({ user: user._id });
      const cleanup = await usuarioRepository.Model.deleteOne({ _id: user._id });
      if (cleanup.deletedCount !== 1) {
        throw new AppError('No se pudo asociar el perfil ni eliminar la cuenta incompleta', 500);
      }
      throw new AppError('No se pudo asociar el perfil al usuario', 500);
    }
    return serializeUsuario(createdUser);
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
    delete data.slug;
    delete data.deletedAt;

    const profileDefaults = { user: current._id };
    for (const field of ['nombre', 'apellidos']) {
      if (!Object.prototype.hasOwnProperty.call(profileData, field)) {
        profileDefaults[field] = current[field] || current.profile?.[field];
      }
      if (!profileDefaults[field] && !profileData[field] && !current.profile) {
        throw new AppError(`No se puede sincronizar el perfil sin ${field}`, 400);
      }
    }

    if (Object.prototype.hasOwnProperty.call(profileData, 'nombre')
      || Object.prototype.hasOwnProperty.call(profileData, 'apellidos')) {
      data.slug = await uniqueSlug(
        usuarioRepository,
        usuarioSlugSource({
          nombre: profileData.nombre ?? current.nombre,
          apellidos: profileData.apellidos ?? current.apellidos,
        }),
        current._id.toString(),
        'usuario'
      );
    }

    const updated = Object.keys(data).length
      ? await usuarioRepository.update(current._id, data)
      : current;
    if (!updated) throw new AppError('Usuario no encontrado', 404);

    if (Object.keys(profileData).length || !current.profile) {
      await Profile.findOneAndUpdate(
        { user: current._id },
        { $set: profileData, $setOnInsert: profileDefaults },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }

    const synchronizedUser = await usuarioRepository.findById(current._id);
    if (!synchronizedUser?.profile) {
      throw new AppError('No se pudo sincronizar el perfil del usuario', 500);
    }
    return serializeUsuario(synchronizedUser);
  }

  async eliminarUsuario(id) {
    const deleted = await usuarioRepository.softDelete(id);
    if (!deleted) throw new AppError('Usuario no encontrado', 404);
    return serializeUsuario(deleted);
  }
}

module.exports = new UsuarioService();
