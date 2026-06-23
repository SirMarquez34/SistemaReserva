const db = require('../config/db');

async function getAll({ limit, offset }) {
  const result = await db.query(
    `SELECT id, dia_semana, hora_inicio, hora_fin, disponible,
            COUNT(*) OVER() AS total
     FROM horarios
     ORDER BY id DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
  const rows = result.rows.map(({ total: _, ...row }) => row);
  return { rows, total };
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

async function findCovering({ dia_semana, hora_inicio, hora_fin }) {
  const result = await db.query(
    `SELECT id FROM horarios
     WHERE dia_semana = $1
       AND disponible = true
       AND hora_inicio <= $2
       AND hora_fin >= $3
     LIMIT 1`,
    [dia_semana, hora_inicio, hora_fin]
  );
  return result.rows[0] || null;
}

async function findByDia(dia_semana) {
  const result = await db.query(
    `SELECT id, hora_inicio, hora_fin FROM horarios
     WHERE dia_semana = $1 AND disponible = true
     LIMIT 1`,
    [dia_semana]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAll,
  getById,
  findByDia,
  create,
  update,
  remove,
  findCovering,
};

