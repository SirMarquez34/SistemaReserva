const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token invalido o expirado',
    });
  }
}

module.exports = {
  authenticate,
};
