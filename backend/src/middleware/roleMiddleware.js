function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`,
      });
    }

    return next();
  };
}

module.exports = { authorize };
