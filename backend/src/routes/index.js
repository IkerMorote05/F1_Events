const { Router } = require('express');
const pilotoRoutes = require('./piloto.routes');
const clasificacionRoutes = require('./clasificacion.routes');
const escuderiaRoutes = require('./escuderia.routes');
const circuitoRoutes = require('./circuito.routes');
const carreraRoutes = require('./carrera.routes');
const AppError = require('../utils/appError');
const router = Router();

router.use('/pilotos', pilotoRoutes);
router.use('/clasificacion', clasificacionRoutes);
router.use('/escuderias', escuderiaRoutes);
router.use('/circuitos', circuitoRoutes);
router.use('/carreras', carreraRoutes);

router.use((req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
});

module.exports = router;