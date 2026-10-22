const pilotoService = require('../services/piloto.service');

class PilotoController {
  async obtenerTodos(req, res, next) {
    try {
      const pilotos = await pilotoService.obtenerTodos(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: pilotos });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const piloto = await pilotoService.obtenerPorId(req.params.id);
      res.status(200).json({ status: 'success', data: piloto });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorSlug(req, res, next) {
    try {
      const piloto = await pilotoService.obtenerPorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: piloto });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const nuevoPiloto = await pilotoService.crearPiloto(req.body);
      res.status(201).json({ status: 'success', data: nuevoPiloto });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const pilotoActualizado = await pilotoService.actualizarPiloto(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: pilotoActualizado });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await pilotoService.eliminarPiloto(req.params.id);
      res.status(200).json({ status: 'success', message: 'Piloto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const piloto = await pilotoService.softDeletePorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: piloto });
    } catch (error) {
      next(error);
    }
  }

  async actualizarIsActive(req, res, next) {
    try {
      const piloto = await pilotoService.actualizarIsActive(req.params.slug, req.body.isActive);
      res.status(200).json({ status: 'success', data: piloto });
    } catch (error) {
      next(error);
    }
  }

  async cambiarStatus(req, res, next) {
    try {
      const piloto = await pilotoService.cambiarStatus(req.params.slug, req.body.status);
      res.status(200).json({ status: 'success', data: piloto });
    } catch (error) {
      next(error);
    }
  }

  async restoreDelete(req, res, next) {
    try {
      const piloto = await pilotoService.restaurarEliminacion(req.params.slug);
      res.status(200).json({ status: 'success', data: piloto });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PilotoController();