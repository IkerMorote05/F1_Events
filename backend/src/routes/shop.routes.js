const { Router } = require('express');
const shopController = require('../controllers/shop.controller');

const router = Router();

router.get('/home/:resource', shopController.home);
router.get('/', shopController.listar);
router.get('/:slug', shopController.detalle);

module.exports = router;
