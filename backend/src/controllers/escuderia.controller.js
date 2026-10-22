const escuderiaService = require('../services/escuderia.service');

class EscuderiaController {
  async obtenerTodas(req, res, next) {
    try {
      const escuderias = await escuderiaService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: escuderias });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const escuderia = await escuderiaService.obtenerPorId(req.params.id);
      res.status(200).json({ status: 'success', data: escuderia });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorSlug(req, res, next) {
    try {
      const escuderia = await escuderiaService.obtenerPorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: escuderia });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const nuevaEscuderia = await escuderiaService.crearEscuderia(req.body);
      res.status(201).json({ status: 'success', data: nuevaEscuderia });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const escuderiaActualizada = await escuderiaService.actualizarEscuderia(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: escuderiaActualizada });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await escuderiaService.eliminarEscuderia(req.params.id);
      res.status(200).json({ status: 'success', message: 'Escudería eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const escuderia = await escuderiaService.softDeletePorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: escuderia });
    } catch (error) {
      next(error);
    }
  }

  async actualizarIsActive(req, res, next) {
    try {
      const escuderia = await escuderiaService.actualizarIsActive(req.params.slug, req.body.isActive);
      res.status(200).json({ status: 'success', data: escuderia });
    } catch (error) {
      next(error);
    }
  }

  async cambiarStatus(req, res, next) {
    try {
      const escuderia = await escuderiaService.cambiarStatus(req.params.slug, req.body.status);
      res.status(200).json({ status: 'success', data: escuderia });
    } catch (error) {
      next(error);
    }
  }

  async restoreDelete(req, res, next) {
    try {
      const escuderia = await escuderiaService.restaurarEliminacion(req.params.slug);
      res.status(200).json({ status: 'success', data: escuderia });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EscuderiaController();