const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.isOperational && err.message
    ? err.message
    : 'Error interno del servidor';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'El valor proporcionado no es válido';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {}).map((el) => el.message).join(', ')
      || 'Los datos proporcionados no son válidos';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un recurso con esos datos';
  }

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'El cuerpo de la solicitud contiene JSON no válido';
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'El cuerpo de la solicitud es demasiado grande';
  }

  res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    message,
  });
};

module.exports = errorHandler;