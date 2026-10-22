const { Router } = require('express');
const carreraController = require('../controllers/carrera.controller');
const validate = require('../middleware/validate');
const {
  slugParams,
  idParams,
  carreraCreate,
  carreraUpdate,
  isActiveBody,
  statusBody,
} = require('../validators/schemas');

const router = Router();

router.get('/', carreraController.obtenerTodas);
router.patch('/:slug/soft-delete', validate(slugParams, 'params'), carreraController.softDelete);
router.patch(
  '/:slug/is-active',
  validate(slugParams, 'params'),
  validate(isActiveBody),
  carreraController.actualizarIsActive
);
router.patch(
  '/:slug/status',
  validate(slugParams, 'params'),
  validate(statusBody),
  carreraController.cambiarStatus
);
router.patch('/:slug/restore-delete', validate(slugParams, 'params'), carreraController.restoreDelete);
router.get('/:slug', validate(slugParams, 'params'), carreraController.obtenerPorSlug);
router.post('/', validate(carreraCreate), carreraController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(carreraUpdate), carreraController.actualizar);
router.delete('/:id', validate(idParams, 'params'), carreraController.eliminar);

module.exports = router;
