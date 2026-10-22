const { Router } = require('express');
const variantController = require('../controllers/variant.controller');
const validate = require('../middleware/validate');
const { idParams, identifierParams, variantCreate, variantUpdate } = require('../validators/schemas');

const router = Router();

router.get('/', variantController.obtenerTodas);
router.get('/:identifier', validate(identifierParams, 'params'), variantController.obtenerPorIdentificador);
router.post('/', validate(variantCreate), variantController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(variantUpdate), variantController.actualizar);
router.delete('/:id', validate(idParams, 'params'), variantController.eliminar);

module.exports = router;
