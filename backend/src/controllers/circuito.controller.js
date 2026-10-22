const circuitoService = require('../services/circuito.service');

class CircuitoController {
  async obtenerTodos(req, res, next) {
    try {
      const circuitos = await circuitoService.obtenerTodos(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: circuitos });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const circuito = await circuitoService.obtenerPorId(req.params.id);
      res.status(200).json({ status: 'success', data: circuito });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorSlug(req, res, next) {
    try {
      const circuito = await circuitoService.obtenerPorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: circuito });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const nuevoCircuito = await circuitoService.crearCircuito(req.body);
      res.status(201).json({ status: 'success', data: nuevoCircuito });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const circuitoActualizado = await circuitoService.actualizarCircuito(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: circuitoActualizado });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await circuitoService.eliminarCircuito(req.params.id);
      res.status(200).json({ status: 'success', message: 'Circuito eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const circuito = await circuitoService.softDeletePorSlug(req.params.slug);
      res.status(200).json({ status: 'success', data: circuito });
    } catch (error) {
      next(error);
    }
  }

  async actualizarIsActive(req, res, next) {
    try {
      const circuito = await circuitoService.actualizarIsActive(req.params.slug, req.body.isActive);
      res.status(200).json({ status: 'success', data: circuito });
    } catch (error) {
      next(error);
    }
  }

  async cambiarStatus(req, res, next) {
    try {
      const circuito = await circuitoService.cambiarStatus(req.params.slug, req.body.status);
      res.status(200).json({ status: 'success', data: circuito });
    } catch (error) {
      next(error);
    }
  }

  async restoreDelete(req, res, next) {
    try {
      const circuito = await circuitoService.restaurarEliminacion(req.params.slug);
      res.status(200).json({ status: 'success', data: circuito });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CircuitoController();
