const { Router } = require('express');
const imageController = require('../controllers/image.controller');
const validate = require('../middleware/validate');
const {
  idParams,
  identifierParams,
  imageCreate,
  imageUpdate,
  imageEntityParams,
} = require('../validators/schemas');

const router = Router();

router.get('/', imageController.obtenerTodos);
router.get(
  '/entity/:entityType/:entityId',
  validate(imageEntityParams, 'params'),
  imageController.obtenerPorEntidad
);
router.get('/:identifier', validate(identifierParams, 'params'), imageController.obtenerPorIdentificador);
router.post('/', validate(imageCreate), imageController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(imageUpdate), imageController.actualizar);
router.delete('/:id', validate(idParams, 'params'), imageController.eliminar);

module.exports = router;
