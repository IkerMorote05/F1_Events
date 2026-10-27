const { Router } = require('express');
const pilotoRoutes = require('./piloto.routes');
const clasificacionRoutes = require('./clasificacion.routes');
const escuderiaRoutes = require('./escuderia.routes');
const circuitoRoutes = require('./circuito.routes');
const carreraRoutes = require('./carrera.routes');
const imageRoutes = require('./image.routes');
const locationRoutes = require('./location.routes');
const variantRoutes = require('./variant.routes');
const usuarioRoutes = require('./usuario.routes');
const rolRoutes = require('./rol.routes');
const categoriaGlobalRoutes = require('./categoria-global.routes');
const categoriaCircuitosRoutes = require('./categoria-circuitos.routes');
const AppError = require('../utils/appError');
const router = Router();

router.use('/pilotos', pilotoRoutes);
router.use('/clasificacion', clasificacionRoutes);
router.use('/escuderias', escuderiaRoutes);
router.use('/circuitos', circuitoRoutes);
router.use('/carreras', carreraRoutes);
router.use('/images', imageRoutes);
router.use('/locations', locationRoutes);
router.use('/variants', variantRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/roles', rolRoutes);
router.use('/categorias-globales', categoriaGlobalRoutes);
router.use('/categorias-circuitos', categoriaCircuitosRoutes);

router.use((req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
});

module.exports = router;