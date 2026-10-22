const AppError = require('../utils/appError');

const validate = (schema, property = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[property]);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || property}: ${issue.message}`)
      .join(', ');
    return next(new AppError(`Error de validación: ${message}`, 400));
  }

  req[property] = result.data;
  return next();
};

module.exports = validate;
