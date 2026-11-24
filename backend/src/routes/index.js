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
const shopRoutes = require('./shop.routes');
const AppError = require('../utils/appError');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const router = Router();

router.use('/auth', authRoutes);

const publicGetPaths = [
  '/clasificacion',
  '/pilotos',
  '/escuderias',
  '/circuitos',
  '/carreras',
  '/ticket-types',
  '/locations',
  '/variants',
  '/categorias-globales',
  '/categorias-circuitos',
  '/shop',
];
router.use((req, res, next) => {
  const isPublicGet = req.method === 'GET'
    && publicGetPaths.some((path) => req.path === path || req.path.startsWith(`${path}/`));

  if (isPublicGet) return next();

  return authenticate(req, res, (error) => {
    if (error) return next(error);
    return authorize('Admin')(req, res, next);
  });
});

router.use('/profile', profileRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clasificacion', clasificacionRoutes);
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
router.use('/shop', shopRoutes);

router.use((req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
});

module.exports = router;