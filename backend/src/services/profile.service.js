const Usuario = require('../models/usuarios.model');
const Profile = require('../models/profile.model');
const usuarioRepository = require('../repositories/usuario.repository');
const imageRepository = require('../repositories/image.repository');
const AppError = require('../utils/appError');
const { uniqueSlug } = require('./crud.helpers');

class ProfileService {
  async obtenerPerfil(userId) {
    const user = await Usuario.findOne({
      _id: userId,
      isActive: true,
      deletedAt: null,
    })
      .select('email roles')
      .populate('roles')
      .populate({ path: 'profile', populate: { path: 'avatar' } });

    if (!user) throw new AppError('Usuario no encontrado', 404);
    return {
      _id: user._id,
      email: user.email,
      role: user.roles?.nombre,
      profile: user.profile,
    };
  }

  async actualizarPerfil(userId, payload) {
    const user = await Usuario.findOne({
      _id: userId,
      isActive: true,
      deletedAt: null,
    }).select('_id');
    if (!user) throw new AppError('Usuario no encontrado', 404);
    const currentProfile = await Profile.findOne({ user: user._id });
    if (!currentProfile) throw new AppError('Perfil no encontrado', 404);

    if (payload.avatar && !(await imageRepository.findById(payload.avatar))) {
      throw new AppError('La imagen de avatar proporcionada no existe', 400);
    }

    const profile = await Profile.findByIdAndUpdate(
      currentProfile._id,
      payload,
      { new: true, runValidators: true }
    );
    if (!profile) throw new AppError('Perfil no encontrado', 404);
    if (payload.nombre || payload.apellidos) {
      const slug = await uniqueSlug(
        usuarioRepository,
        `${profile.nombre}-${profile.apellidos}`,
        user._id.toString(),
        'usuario'
      );
      await usuarioRepository.update(user._id, { slug });
    }
    return this.obtenerPerfil(userId);
  }
}

module.exports = new ProfileService();
