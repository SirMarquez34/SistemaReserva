const db = require('../config/db');

// Campos publicos del usuario. No se incluye la contrasena para evitar exponerla.
const publicUserFields = `
  pk_usuario,
  nombre,
  correo,
  rol
`;

async function findByEmail(correo) {
  const result = await db.query(
    `
      SELECT pk_usuario, nombre, correo, contrasena, rol
      FROM usuarios
      WHERE correo = $1
      LIMIT 1;
    `,
    [correo]
  );

  return result.rows[0] || null;
}

async function findById(pkUsuario) {
  const result = await db.query(
    `
      SELECT ${publicUserFields}
      FROM usuarios
      WHERE pk_usuario = $1
      LIMIT 1;
    `,
    [pkUsuario]
  );

  return result.rows[0] || null;
}

async function create({ nombre, correo, contrasena, rol }) {
  const result = await db.query(
    `
      INSERT INTO usuarios (nombre, correo, contrasena, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING ${publicUserFields};
    `,
    [nombre, correo, contrasena, rol]
  );

  return result.rows[0];
}

module.exports = {
  findByEmail,
  findById,
  create,
};
