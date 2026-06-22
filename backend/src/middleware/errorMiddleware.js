const logger = require('../utils/logger');

function notFound(req, res) {
  res.status(404).json({
    ok: false,
    message: 'No encontre la ruta que estas buscando',
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });
  } else {
    logger.warn(err.message, { path: req.path, method: req.method });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      ok: false,
      message: 'Ingresa otros datos, ya existe un registro con esos datos',
    });
  }

  return res.status(statusCode).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  });
}

module.exports = {
  notFound,
  errorHandler,
};
