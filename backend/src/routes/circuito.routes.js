const { Router } = require('express');
const circuitoController = require('../controllers/circuito.controller');
const validate = require('../middleware/validate');
const {
  slugParams,
  idParams,
  circuitoCreate,
  circuitoUpdate,
  isActiveBody,
  statusBody,
} = require('../validators/schemas');

const router = Router();

router.get('/', circuitoController.obtenerTodos);
router.patch('/:slug/soft-delete', validate(slugParams, 'params'), circuitoController.softDelete);
router.patch(
  '/:slug/is-active',
  validate(slugParams, 'params'),
  validate(isActiveBody),
  circuitoController.actualizarIsActive
);
router.patch(
  '/:slug/status',
  validate(slugParams, 'params'),
  validate(statusBody),
  circuitoController.cambiarStatus
);
router.patch('/:slug/restore-delete', validate(slugParams, 'params'), circuitoController.restoreDelete);
router.get('/:slug', validate(slugParams, 'params'), circuitoController.obtenerPorSlug);
router.post('/', validate(circuitoCreate), circuitoController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(circuitoUpdate), circuitoController.actualizar);
router.delete('/:id', validate(idParams, 'params'), circuitoController.eliminar);

module.exports = router;
