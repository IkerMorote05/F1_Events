const profileService = require('../services/profile.service');

class ProfileController {
  async obtener(req, res, next) {
    try {
      const profile = await profileService.obtenerPerfil(req.user.id);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const profile = await profileService.actualizarPerfil(req.user.id, req.body);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
