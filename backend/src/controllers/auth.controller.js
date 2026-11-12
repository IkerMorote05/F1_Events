const authService = require('../services/auth.service');

class AuthController {
  async registrar(req, res, next) {
    try {
      const data = await authService.registrar(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async iniciarSesion(req, res, next) {
    try {
      const data = await authService.iniciarSesion(req.body.email, req.body.password);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
