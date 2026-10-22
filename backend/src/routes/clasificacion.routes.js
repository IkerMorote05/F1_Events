const { Router } = require('express');
const clasificacionController = require('../controllers/clasificacion.controller');

const router = Router();

router.get('/', clasificacionController.obtenerTabla);

module.exports = router;