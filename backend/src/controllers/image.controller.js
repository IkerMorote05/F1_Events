const imageService = require('../services/image.service');

class ImageController {
  async obtenerTodos(req, res, next) {
    try {
      const images = await imageService.obtenerTodas(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: images });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const image = await imageService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: image });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorEntidad(req, res, next) {
    try {
      const images = await imageService.obtenerPorEntidad(
        req.params.entityType,
        req.params.entityId,
        req.query.includeDeleted === 'true'
      );
      res.status(200).json({ status: 'success', data: images });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const image = await imageService.crearImage(req.body);
      res.status(201).json({ status: 'success', data: image });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const image = await imageService.actualizarImage(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: image });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const image = await imageService.eliminarImage(req.params.id);
      res.status(200).json({ status: 'success', data: image });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ImageController();
