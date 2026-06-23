const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalido o expirado' });
  }
}

function authenticateCliente(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    if (payload.tipo !== 'cliente') {
      return res.status(403).json({ ok: false, message: 'Acceso denegado' });
    }
    req.cliente = payload;
    return next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalido o expirado' });
  }
}

module.exports = {
  authenticate,
  authenticateCliente,
};
