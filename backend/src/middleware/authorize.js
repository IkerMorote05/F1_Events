const AppError = require('../utils/appError');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Se requiere autenticación', 401));
  }

  const allowedRoles = roles.map((role) => role.toLowerCase());
  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return next(new AppError('No tienes permisos para realizar esta acción', 403));
  }

  return next();
};

module.exports = authorize;
