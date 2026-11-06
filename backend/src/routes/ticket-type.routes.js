const { Router } = require('express');
const ticketTypeController = require('../controllers/ticket-type.controller');
const validate = require('../middleware/validate');
const {
  idParams,
  identifierParams,
  ticketTypeCreate,
  ticketTypeUpdate,
} = require('../validators/schemas');

const router = Router();

router.get('/', ticketTypeController.obtenerTodos);
router.get('/:identifier', validate(identifierParams, 'params'), ticketTypeController.obtenerPorIdentificador);
router.post('/', validate(ticketTypeCreate), ticketTypeController.crear);
router.patch('/:id', validate(idParams, 'params'), validate(ticketTypeUpdate), ticketTypeController.actualizar);
router.delete('/:id', validate(idParams, 'params'), ticketTypeController.eliminar);

module.exports = router;
