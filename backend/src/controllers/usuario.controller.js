const usuarioService = require('../services/usuario.service');

class UsuarioController {
  async obtenerTodos(req, res, next) {
    try {
      const usuarios = await usuarioService.obtenerTodos(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: usuarios });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const usuario = await usuarioService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const usuario = await usuarioService.crearUsuario(req.body);
      res.status(201).json({ status: 'success', data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const usuario = await usuarioService.eliminarUsuario(req.params.id);
      res.status(200).json({ status: 'success', data: usuario });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();
