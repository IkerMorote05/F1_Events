const categoriaGlobalService = require('../services/categoria-global.service');

class CategoriaGlobalController {
  async obtenerTodas(req, res, next) {
    try {
      const categorias = await categoriaGlobalService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: categorias });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const categoria = await categoriaGlobalService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const categoria = await categoriaGlobalService.crearCategoriaGlobal(req.body);
      res.status(201).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const categoria = await categoriaGlobalService.actualizarCategoriaGlobal(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const categoria = await categoriaGlobalService.eliminarCategoriaGlobal(req.params.id);
      res.status(200).json({ status: 'success', data: categoria });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoriaGlobalController();
