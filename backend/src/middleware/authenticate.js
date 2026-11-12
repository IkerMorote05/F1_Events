const Usuario = require('../models/usuarios.model');
const AppError = require('../utils/appError');
const { verifyToken } = require('../utils/jwt');

const tokenErrors = new Set(['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError']);

const authenticate = async (req, res, next) => {
  const authorization = req.get('authorization');
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return next(new AppError('Se requiere un token de autenticación', 401));
  }

  let payload;
  try {
    payload = verifyToken(match[1]);
  } catch (error) {
    if (tokenErrors.has(error.name)) {
      return next(new AppError('Token inválido o expirado', 401));
    }
    return next(error);
  }

  try {
    const user = await Usuario.findOne({
      _id: payload.sub,
      isActive: true,
      deletedAt: null,
    }).populate('roles');

    if (!user || !user.roles?.isActive || typeof payload.role !== 'string'
      || typeof user.roles.nombre !== 'string'
      || user.roles.nombre.toLowerCase() !== payload.role.toLowerCase()) {
      return next(new AppError('La cuenta no está autorizada o el token ha quedado obsoleto', 401));
    }

    req.user = {
      id: user._id.toString(),
      role: user.roles.nombre,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
