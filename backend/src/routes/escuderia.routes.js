const { Router } = require('express');
const escuderiaController = require('../controllers/escuderia.controller');
const validate = require('../middleware/validate');
const {
  slugParams,
  idParams,
  escuderiaCreate,
  escuderiaUpdate,
  isActiveBody,
  statusBody,
} = require('../validators/schemas');

const router = Router();

router.get('/', escuderiaController.obtenerTodas);
router.patch('/:slug/soft-delete', validate(slugParams, 'params'), escuderiaController.softDelete);
router.patch(
  '/:slug/is-active',
  validate(slugParams, 'params'),
  validate(isActiveBody),
  escuderiaController.actualizarIsActive
);
router.patch(
  '/:slug/status',
  validate(slugParams, 'params'),
  validate(statusBody),
  escuderiaController.cambiarStatus
);
router.patch('/:slug/restore-delete', validate(slugParams, 'params'), escuderiaController.restoreDelete);
router.get('/:slug', validate(slugParams, 'params'), escuderiaController.obtenerPorSlug);
router.post('/', validate(escuderiaCreate), escuderiaController.crear);
router.put('/:id', validate(idParams, 'params'), validate(escuderiaUpdate), escuderiaController.actualizar);
router.delete('/:id', validate(idParams, 'params'), escuderiaController.eliminar);

module.exports = router;