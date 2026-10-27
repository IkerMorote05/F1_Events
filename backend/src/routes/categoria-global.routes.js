const { Router } = require('express');
const categoriaGlobalController = require('../controllers/categoria-global.controller');
const validate = require('../middleware/validate');
const {
  idParams,
  identifierParams,
  categoriaGlobalCreate,
  categoriaGlobalUpdate,
} = require('../validators/schemas');

const router = Router();

router.get('/', categoriaGlobalController.obtenerTodas);
router.get('/:identifier', validate(identifierParams, 'params'), categoriaGlobalController.obtenerPorIdentificador);
router.post('/', validate(categoriaGlobalCreate), categoriaGlobalController.crear);
router.patch(
  '/:id',
  validate(idParams, 'params'),
  validate(categoriaGlobalUpdate),
  categoriaGlobalController.actualizar
);
router.delete('/:id', validate(idParams, 'params'), categoriaGlobalController.eliminar);

module.exports = router;
