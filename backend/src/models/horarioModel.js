const db = require('../config/db');

async function getAll() {
  const result = await db.query(
    `SELECT id, dia_semana, hora_inicio, hora_fin, disponible
     FROM horarios
     ORDER BY id DESC`
  );
  return result.rows;
}

async function getById(id) {
  const result = await db.query(
    `SELECT id, dia_semana, hora_inicio, hora_fin, disponible
     FROM horarios
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ dia_semana, hora_inicio, hora_fin, disponible }) {
  const result = await db.query(
    `INSERT INTO horarios (dia_semana, hora_inicio, hora_fin, disponible)
     VALUES ($1, $2, $3, $4)
     RETURNING id, dia_semana, hora_inicio, hora_fin, disponible`,
    [dia_semana, hora_inicio, hora_fin, disponible]
  );

  return result.rows[0];
}

async function update(id, { dia_semana, hora_inicio, hora_fin, disponible }) {
  const result = await db.query(
    `UPDATE horarios
     SET dia_semana = $1,
         hora_inicio = $2,
         hora_fin = $3,
         disponible = $4
     WHERE id = $5
     RETURNING id, dia_semana, hora_inicio, hora_fin, disponible`,
    [dia_semana, hora_inicio, hora_fin, disponible, id]
  );

  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM horarios
     WHERE id = $1
     RETURNING id, dia_semana, hora_inicio, hora_fin, disponible`,
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

