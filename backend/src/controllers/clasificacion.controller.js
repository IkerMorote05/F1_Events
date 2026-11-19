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

  async obtenerClasificacionPublica(req, res, next) {
    try {
      const datos = await clasificacionService.obtenerClasificacionPublica();
      res.status(200).json({ status: 'success', data: datos });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClasificacionController();