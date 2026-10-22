const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Recurso no encontrado. ID inválido: ${err.value}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((el) => el.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un recurso con esos datos';
  }

  res.status(statusCode).json({
    status: err.status || (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'),
    message,
  });
};

module.exports = errorHandler;