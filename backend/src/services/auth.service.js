const Usuario = require('../models/usuarios.model');
const Rol = require('../models/roles.model');
const RevokedToken = require('../models/revoked-token.model');
const AppError = require('../utils/appError');
const usuarioService = require('./usuario.service');
const { verifyPassword } = require('../utils/password');
const { signToken, hashToken } = require('../utils/jwt');

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

  async cerrarSesion(token, payload) {
    if (!Number.isFinite(payload.exp)) {
      throw new AppError('El token no tiene una fecha de expiración válida', 401);
    }

    await RevokedToken.create({
      tokenHash: hashToken(token),
      expiresAt: new Date(payload.exp * 1000),
    });
  }
}

module.exports = new AuthService();
