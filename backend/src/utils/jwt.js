const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    {
      pk_usuario: user.pk_usuario,
      correo: user.correo,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
