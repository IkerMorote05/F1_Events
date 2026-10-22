const rolService = require('../services/rol.service');

class RolController {
  async obtenerTodos(req, res, next) {
    try {
      const roles = await rolService.obtenerTodos(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: roles });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const rol = await rolService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: rol });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const rol = await rolService.crearRol(req.body);
      res.status(201).json({ status: 'success', data: rol });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const rol = await rolService.actualizarRol(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: rol });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const rol = await rolService.eliminarRol(req.params.id);
      res.status(200).json({ status: 'success', data: rol });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RolController();
