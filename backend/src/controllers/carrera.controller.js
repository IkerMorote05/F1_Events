const carreraService = require('../services/carrera.service');

class CarreraController {
  async obtenerTodas(req, res, next) {
    try {
      const carreras = await carreraService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: carreras });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const carrera = await carreraService.obtenerPorId(req.params.id);
      res.status(200).json({ status: 'success', data: carrera });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorSlug(req, res, next) {
    try {
      const carrera = await carreraService.obtenerPorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: carrera });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const nuevaCarrera = await carreraService.crearCarrera(req.body);
      res.status(201).json({ status: 'success', data: nuevaCarrera });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const carreraActualizada = await carreraService.actualizarCarrera(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: carreraActualizada });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await carreraService.eliminarCarrera(req.params.id);
      res.status(200).json({ status: 'success', message: 'Carrera eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const carrera = await carreraService.softDeletePorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: carrera });
    } catch (error) {
      next(error);
    }
  }

  async actualizarIsActive(req, res, next) {
    try {
      const carrera = await carreraService.actualizarIsActive(req.params.slug, req.body.isActive);
      res.status(200).json({ status: 'success', data: carrera });
    } catch (error) {
      next(error);
    }
  }

  async cambiarStatus(req, res, next) {
    try {
      const carrera = await carreraService.cambiarStatus(req.params.slug, req.body.status);
      res.status(200).json({ status: 'success', data: carrera });
    } catch (error) {
      next(error);
    }
  }

  async restoreDelete(req, res, next) {
    try {
      const carrera = await carreraService.restaurarEliminacion(req.params.slug);
      res.status(200).json({ status: 'success', data: carrera });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CarreraController();
