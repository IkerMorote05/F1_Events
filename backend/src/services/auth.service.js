const Usuario = require('../models/usuarios.model');
const Rol = require('../models/roles.model');
const AppError = require('../utils/appError');
const usuarioService = require('./usuario.service');
const { verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  role: user.roles.nombre,
  profile: user.profile,
});

class AuthService {
  async registrar(payload) {
    const role = await Rol.findOne({
      nombre: 'Usuario',
      isActive: true,
      deletedAt: null,
    });
    if (!role) {
      throw new AppError('No está configurado el rol Usuario para el registro', 503);
    }

    const user = await usuarioService.crearUsuario({ ...payload, roles: role._id });
    const roleName = user.roles?.nombre || role.nombre;
    return {
      token: signToken(user._id, roleName),
      user: {
        _id: user._id,
        email: user.email,
        role: roleName,
        profile: user.profile,
      },
    };
  }

  async iniciarSesion(email, password) {
    const user = await Usuario.findOne({
      email: email.toLowerCase(),
      isActive: true,
      deletedAt: null,
    })
      .select('+password')
      .populate('roles')
      .populate({ path: 'profile', populate: { path: 'avatar' } });

    if (!user || !user.roles?.isActive || !(await verifyPassword(password, user.password))) {
      throw new AppError('Email o contraseña incorrectos', 401);
    }

    const role = user.roles.nombre;
    return {
      token: signToken(user._id, role),
      user: publicUser(user),
    };
  }
}

module.exports = new AuthService();
