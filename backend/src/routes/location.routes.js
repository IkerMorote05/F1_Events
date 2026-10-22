const { Router } = require('express');
const locationController = require('../controllers/location.controller');
const validate = require('../middleware/validate');
const { idParams, identifierParams, locationCreate, locationUpdate } = require('../validators/schemas');

const router = Router();

router.get('/', locationController.obtenerTodas);
router.get('/:identifier', validate(identifierParams, 'params'), locationController.obtenerPorIdentificador);
router.post('/', validate(locationCreate), locationController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(locationUpdate), locationController.actualizar);
router.delete('/:id', validate(idParams, 'params'), locationController.eliminar);

module.exports = router;
