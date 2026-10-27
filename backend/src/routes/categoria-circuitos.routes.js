const { Router } = require('express');
const categoriaCircuitosController = require('../controllers/categoria-circuitos.controller');
const validate = require('../middleware/validate');
const {
  idParams,
  identifierParams,
  categoriaCircuitosCreate,
  categoriaCircuitosUpdate,
} = require('../validators/schemas');

const router = Router();

router.get('/', categoriaCircuitosController.obtenerTodas);
router.get(
  '/:identifier',
  validate(identifierParams, 'params'),
  categoriaCircuitosController.obtenerPorIdentificador
);
router.post('/', validate(categoriaCircuitosCreate), categoriaCircuitosController.crear);
router.patch(
  '/:id',
  validate(idParams, 'params'),
  validate(categoriaCircuitosUpdate),
  categoriaCircuitosController.actualizar
);
router.delete('/:id', validate(idParams, 'params'), categoriaCircuitosController.eliminar);

module.exports = router;
