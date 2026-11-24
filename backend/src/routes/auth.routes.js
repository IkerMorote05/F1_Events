const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { authRegister, authLogin } = require('../validators/schemas');

const router = Router();

router.post('/register', authenticate, authorize('Admin'), validate(authRegister), authController.registrar);
router.post('/login', validate(authLogin), authController.iniciarSesion);
router.post('/logout', authenticate, authorize('Admin'), authController.cerrarSesion);

module.exports = router;
