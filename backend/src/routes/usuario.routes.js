const { Router } = require('express');
const usuarioController = require('../controllers/usuario.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { idParams, identifierParams, usuarioCreate, usuarioUpdate } = require('../validators/schemas');

const router = Router();

router.use(authenticate, authorize('Admin'));

router.get('/', usuarioController.obtenerTodos);
router.get('/:identifier', validate(identifierParams, 'params'), usuarioController.obtenerPorIdentificador);
router.post('/', validate(usuarioCreate), usuarioController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(usuarioUpdate), usuarioController.actualizar);
router.delete('/:id', validate(idParams, 'params'), usuarioController.eliminar);

module.exports = router;
