const { Router } = require('express');
const rolController = require('../controllers/rol.controller');
const validate = require('../middleware/validate');
const { idParams, identifierParams, rolCreate, rolUpdate } = require('../validators/schemas');

const router = Router();

router.get('/', rolController.obtenerTodos);
router.get('/:identifier', validate(identifierParams, 'params'), rolController.obtenerPorIdentificador);
router.post('/', validate(rolCreate), rolController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(rolUpdate), rolController.actualizar);
router.delete('/:id', validate(idParams, 'params'), rolController.eliminar);

module.exports = router;
