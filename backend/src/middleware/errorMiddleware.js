function notFound(req, res) {
  res.status(404).json({
    ok: false,
    message: 'No encontre la ruta que estas buscando',
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') {
    return res.status(409).json({
      ok: false,
      message: 'Ingresa otros datos, ya existe un registro con esos datos',
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  });
}

module.exports = {
  notFound,
  errorHandler,
};
