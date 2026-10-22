const { Router } = require('express');
const pilotoController = require('../controllers/piloto.controller');
const validate = require('../middleware/validate');
const {
  slugParams,
  idParams,
  pilotoCreate,
  pilotoUpdate,
  isActiveBody,
  statusBody,
} = require('../validators/schemas');

const router = Router();

router.get('/', pilotoController.obtenerTodos);
router.patch('/:slug/soft-delete', validate(slugParams, 'params'), pilotoController.softDelete);
router.patch(
  '/:slug/is-active',
  validate(slugParams, 'params'),
  validate(isActiveBody),
  pilotoController.actualizarIsActive
);
router.patch(
  '/:slug/status',
  validate(slugParams, 'params'),
  validate(statusBody),
  pilotoController.cambiarStatus
);
router.patch('/:slug/restore-delete', validate(slugParams, 'params'), pilotoController.restoreDelete);
router.get('/:slug', validate(slugParams, 'params'), pilotoController.obtenerPorSlug);
router.post('/', validate(pilotoCreate), pilotoController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(pilotoUpdate), pilotoController.actualizar);
router.delete('/:id', validate(idParams, 'params'), pilotoController.eliminar);

module.exports = router;