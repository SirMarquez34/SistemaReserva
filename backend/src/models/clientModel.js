const db = require('../config/db');

async function getAll({ limit, offset }) {
  const result = await db.query(
    `SELECT id, nombre, telefono, email, created_at,
            COUNT(*) OVER() AS total
     FROM clientes
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
    `SELECT id, nombre, telefono, email, created_at
     FROM clientes
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ nombre, telefono, email }) {
  const result = await db.query(
    `INSERT INTO clientes (nombre, telefono, email)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, telefono, email, created_at`,
    [nombre, telefono, email]
  );
  return result.rows[0];
}

async function update(id, { nombre, telefono, email }) {
  const result = await db.query(
    `UPDATE clientes
     SET nombre = $1,
         telefono = $2,
         email = $3
     WHERE id = $4
     RETURNING id, nombre, telefono, email, created_at`,
    [nombre, telefono, email, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM clientes
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

