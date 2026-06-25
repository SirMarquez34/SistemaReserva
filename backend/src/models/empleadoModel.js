const db = require('../config/db');

async function getAll({ limit, offset }) {
  const result = await db.query(
    `SELECT pk_usuario AS id, nombre, correo,
            COUNT(*) OVER() AS total
     FROM usuarios
     WHERE rol = 'empleado'
     ORDER BY nombre ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
  const rows = result.rows.map(({ total: _, ...row }) => row);
  return { rows, total };
}

async function getById(id) {
  const result = await db.query(
    `SELECT pk_usuario AS id, nombre, correo
     FROM usuarios
     WHERE pk_usuario = $1 AND rol = 'empleado'`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByEmail(correo) {
  const result = await db.query(
    `SELECT pk_usuario AS id FROM usuarios WHERE correo = $1`,
    [correo]
  );
  return result.rows[0] || null;
}

async function create({ nombre, correo, contrasena }) {
  const result = await db.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol)
     VALUES ($1, $2, $3, 'empleado')
     RETURNING pk_usuario AS id, nombre, correo`,
    [nombre, correo, contrasena]
  );
  return result.rows[0];
}

async function update(id, { nombre, correo }) {
  const result = await db.query(
    `UPDATE usuarios
     SET nombre = $1, correo = $2
     WHERE pk_usuario = $3 AND rol = 'empleado'
     RETURNING pk_usuario AS id, nombre, correo`,
    [nombre, correo, id]
  );
  return result.rows[0] || null;
}

async function updatePassword(id, hashedPassword) {
  await db.query(
    `UPDATE usuarios SET contrasena = $1 WHERE pk_usuario = $2 AND rol = 'empleado'`,
    [hashedPassword, id]
  );
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM usuarios WHERE pk_usuario = $1 AND rol = 'empleado' RETURNING pk_usuario AS id`,
    [id]
  );
  return result.rows[0] || null;
}

async function getByDia(dia_semana) {
  const result = await db.query(
    `SELECT DISTINCT u.pk_usuario AS id, u.nombre, u.correo
     FROM usuarios u
     INNER JOIN horarios h ON h.usuario_id = u.pk_usuario
     WHERE h.dia_semana = $1 AND h.disponible = true AND u.rol = 'empleado'
     ORDER BY u.nombre ASC`,
    [dia_semana]
  );
  return result.rows;
}

module.exports = {
  getAll,
  getById,
  findByEmail,
  create,
  update,
  updatePassword,
  remove,
  getByDia,
};
