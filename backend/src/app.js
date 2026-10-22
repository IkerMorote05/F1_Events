const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./utils/errorHandler');
const setupSwagger = require('./config/swagger');
require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

setupSwagger(app);

app.use('/api', helmet());
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;