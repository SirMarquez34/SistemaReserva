const db = require('../config/db');

async function getAll({ empleado_id, limit, offset }) {
  const params = [limit, offset];
  let where = '';
  if (empleado_id) {
    params.unshift(empleado_id);
    where = `WHERE h.usuario_id = $1`;
  }
  const offsetIdx = empleado_id ? 3 : 1;
  const limitIdx  = empleado_id ? 2 : 1;

  // Rebuild with correct param indices
  const sql = empleado_id
    ? `SELECT h.id, h.dia_semana, h.hora_inicio, h.hora_fin, h.disponible, h.usuario_id,
              u.nombre AS empleado_nombre,
              COUNT(*) OVER() AS total
       FROM horarios h
       LEFT JOIN usuarios u ON u.pk_usuario = h.usuario_id
       WHERE h.usuario_id = $1
       ORDER BY h.id DESC
       LIMIT $2 OFFSET $3`
    : `SELECT h.id, h.dia_semana, h.hora_inicio, h.hora_fin, h.disponible, h.usuario_id,
              u.nombre AS empleado_nombre,
              COUNT(*) OVER() AS total
       FROM horarios h
       LEFT JOIN usuarios u ON u.pk_usuario = h.usuario_id
       ORDER BY h.id DESC
       LIMIT $1 OFFSET $2`;

  const result = await db.query(sql, params);
  const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
  const rows = result.rows.map(({ total: _, ...row }) => row);
  return { rows, total };
}

async function getById(id) {
  const result = await db.query(
    `SELECT h.id, h.dia_semana, h.hora_inicio, h.hora_fin, h.disponible, h.usuario_id,
            u.nombre AS empleado_nombre
     FROM horarios h
     LEFT JOIN usuarios u ON u.pk_usuario = h.usuario_id
     WHERE h.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getByEmpleado(empleado_id) {
  const result = await db.query(
    `SELECT id, dia_semana, hora_inicio, hora_fin, disponible, usuario_id
     FROM horarios
     WHERE usuario_id = $1
     ORDER BY id ASC`,
    [empleado_id]
  );
  return result.rows;
}

async function create({ dia_semana, hora_inicio, hora_fin, disponible, usuario_id }) {
  const result = await db.query(
    `INSERT INTO horarios (dia_semana, hora_inicio, hora_fin, disponible, usuario_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, dia_semana, hora_inicio, hora_fin, disponible, usuario_id`,
    [dia_semana, hora_inicio, hora_fin, disponible ?? true, usuario_id]
  );
  return result.rows[0];
}

async function update(id, { dia_semana, hora_inicio, hora_fin, disponible, usuario_id }) {
  const result = await db.query(
    `UPDATE horarios
     SET dia_semana  = $1,
         hora_inicio = $2,
         hora_fin    = $3,
         disponible  = $4,
         usuario_id  = $5
     WHERE id = $6
     RETURNING id, dia_semana, hora_inicio, hora_fin, disponible, usuario_id`,
    [dia_semana, hora_inicio, hora_fin, disponible, usuario_id, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM horarios WHERE id = $1
     RETURNING id, dia_semana, hora_inicio, hora_fin, disponible`,
    [id]
  );
  return result.rows[0] || null;
}

async function findCovering({ dia_semana, hora_inicio, hora_fin, empleado_id }) {
  const params = [dia_semana, hora_inicio, hora_fin];
  let sql = `SELECT id FROM horarios
             WHERE dia_semana = $1
               AND disponible = true
               AND hora_inicio <= $2
               AND hora_fin >= $3`;
  if (empleado_id) {
    params.push(empleado_id);
    sql += ` AND usuario_id = $4`;
  }
  sql += ` LIMIT 1`;
  const result = await db.query(sql, params);
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

async function findByDiaAndEmpleado(dia_semana, empleado_id) {
  const result = await db.query(
    `SELECT id, hora_inicio, hora_fin FROM horarios
     WHERE dia_semana = $1 AND disponible = true AND usuario_id = $2
     LIMIT 1`,
    [dia_semana, empleado_id]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAll,
  getById,
  getByEmpleado,
  findByDia,
  findByDiaAndEmpleado,
  create,
  update,
  remove,
  findCovering,
};
