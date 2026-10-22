const clasificacionService = require('../services/clasificacion.service');

class ClasificacionController {
  async obtenerTabla(req, res, next) {
    try {
      const tabla = await clasificacionService.obtenerClasificacion();
      res.status(200).json({ status: 'success', data: tabla });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClasificacionController();