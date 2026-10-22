const variantService = require('../services/variant.service');

class VariantController {
  async obtenerTodas(req, res, next) {
    try {
      const variants = await variantService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: variants });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const variant = await variantService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const variant = await variantService.crearVariant(req.body);
      res.status(201).json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const variant = await variantService.actualizarVariant(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const variant = await variantService.eliminarVariant(req.params.id);
      res.status(200).json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VariantController();
