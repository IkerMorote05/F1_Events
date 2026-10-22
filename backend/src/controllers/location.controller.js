const locationService = require('../services/location.service');

class LocationController {
  async obtenerTodas(req, res, next) {
    try {
      const locations = await locationService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: locations });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const location = await locationService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: location });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const location = await locationService.crearLocation(req.body);
      res.status(201).json({ status: 'success', data: location });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const location = await locationService.actualizarLocation(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: location });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const location = await locationService.eliminarLocation(req.params.id);
      res.status(200).json({ status: 'success', data: location });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();
