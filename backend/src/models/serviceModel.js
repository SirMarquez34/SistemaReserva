const db = require('../config/db');

async function getAll({ limit, offset }) {
  const result = await db.query(
    `SELECT id, nombre, descripcion, duracion_minutos, precio, activo, created_at,
            COUNT(*) OVER() AS total
     FROM servicios
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
  const rows = result.rows.map(({ total: _, ...row }) => row);
  return { rows, total };
}

async function getById(id) {
  const result = await db.query(
    `SELECT id, nombre, descripcion, duracion_minutos, precio, activo, created_at
     FROM servicios
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ nombre, descripcion, duracion_minutos, precio, activo }) {
  const result = await db.query(
    `INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, descripcion, duracion_minutos, precio, activo, created_at`,
    [nombre, descripcion, duracion_minutos, precio, activo]
  );
  return result.rows[0];
}

async function update(id, { nombre, descripcion, duracion_minutos, precio, activo }) {
  const result = await db.query(
    `UPDATE servicios
     SET nombre = $1,
         descripcion = $2,
         duracion_minutos = $3,
         precio = $4,
         activo = $5
     WHERE id = $6
     RETURNING id, nombre, descripcion, duracion_minutos, precio, activo, created_at`,
    [nombre, descripcion, duracion_minutos, precio, activo, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM servicios
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};

