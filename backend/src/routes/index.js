const { Router } = require('express');
const pilotoRoutes = require('./piloto.routes');
const clasificacionRoutes = require('./clasificacion.routes');
const escuderiaRoutes = require('./escuderia.routes');
const circuitoRoutes = require('./circuito.routes');
const carreraRoutes = require('./carrera.routes');
const ticketTypeRoutes = require('./ticket-type.routes');
const imageRoutes = require('./image.routes');
const locationRoutes = require('./location.routes');
const variantRoutes = require('./variant.routes');
const usuarioRoutes = require('./usuario.routes');
const rolRoutes = require('./rol.routes');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const categoriaGlobalRoutes = require('./categoria-global.routes');
const categoriaCircuitosRoutes = require('./categoria-circuitos.routes');
const AppError = require('../utils/appError');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/clasificacion', clasificacionRoutes);
router.use('/usuarios', usuarioRoutes);
const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
router.use((req, res, next) => {
  if (!writeMethods.has(req.method)) return next();
  return authenticate(req, res, (error) => {
    if (error) return next(error);
    return authorize('Admin')(req, res, next);
  });
});

router.use('/pilotos', pilotoRoutes);
router.use('/escuderias', escuderiaRoutes);
router.use('/circuitos', circuitoRoutes);
router.use('/carreras', carreraRoutes);
router.use('/ticket-types', ticketTypeRoutes);
router.use('/images', imageRoutes);
router.use('/locations', locationRoutes);
router.use('/variants', variantRoutes);
router.use('/roles', rolRoutes);
router.use('/categorias-globales', categoriaGlobalRoutes);
router.use('/categorias-circuitos', categoriaCircuitosRoutes);

router.use((req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
});

module.exports = router;