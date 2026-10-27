const categoriaCircuitosService = require('../services/categoria-circuitos.service');

class CategoriaCircuitosController {
  async obtenerTodas(req, res, next) {
    try {
      const categorias = await categoriaCircuitosService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: categorias });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const categoria = await categoriaCircuitosService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const categoria = await categoriaCircuitosService.crearCategoriaCircuitos(req.body);
      res.status(201).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const categoria = await categoriaCircuitosService.actualizarCategoriaCircuitos(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const categoria = await categoriaCircuitosService.eliminarCategoriaCircuitos(req.params.id);
      res.status(200).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoriaCircuitosController();
