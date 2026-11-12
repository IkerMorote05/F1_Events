const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authRegister, authLogin } = require('../validators/schemas');

const router = Router();

router.post('/register', validate(authRegister), authController.registrar);
router.post('/login', validate(authLogin), authController.iniciarSesion);

module.exports = router;
