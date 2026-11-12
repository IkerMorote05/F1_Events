const { Router } = require('express');
const profileController = require('../controllers/profile.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { profileUpdate } = require('../validators/schemas');

const router = Router();

router.use(authenticate);
router.get('/me', profileController.obtener);
router.patch('/me', validate(profileUpdate), profileController.actualizar);

module.exports = router;
