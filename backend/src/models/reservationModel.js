const db = require('../config/db');

async function getAll() {
  const result = await db.query(
    `SELECT r.id,
            r.cliente_id,
            r.servicio_id,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.estado,
            r.observaciones,
            r.created_at,
            c.nombre AS cliente_nombre,
            s.nombre AS servicio_nombre
     FROM reservas r
     INNER JOIN clientes c ON c.id = r.cliente_id
     INNER JOIN servicios s ON s.id = r.servicio_id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
}

async function getById(id) {
  const result = await db.query(
    `SELECT r.id,
            r.cliente_id,
            r.servicio_id,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.estado,
            r.observaciones,
            r.created_at,
            c.nombre AS cliente_nombre,
            s.nombre AS servicio_nombre
     FROM reservas r
     INNER JOIN clientes c ON c.id = r.cliente_id
     INNER JOIN servicios s ON s.id = r.servicio_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, observaciones }) {
  const result = await db.query(
    `INSERT INTO reservas (
        cliente_id,
        servicio_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        observaciones
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id,
               cliente_id,
               servicio_id,
               fecha,
               hora_inicio,
               hora_fin,
               estado,
               observaciones,
               created_at`,
    [cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, observaciones]
  );
  return result.rows[0];
}

async function update(id, { cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, observaciones }) {
  const result = await db.query(
    `UPDATE reservas
     SET cliente_id = $1,
         servicio_id = $2,
         fecha = $3,
         hora_inicio = $4,
         hora_fin = $5,
         estado = $6,
         observaciones = $7
     WHERE id = $8
     RETURNING id,
               cliente_id,
               servicio_id,
               fecha,
               hora_inicio,
               hora_fin,
               estado,
               observaciones,
               created_at`,
    [cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, observaciones, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM reservas
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

async function existsExactDuplicate({ cliente_id, servicio_id, fecha, hora_inicio, excludeReservationId = null }) {
  // Evita duplicados exactos: mismo cliente+servicio+fecha+hora_inicio
  // constraint UNIQUE también lo cubre, pero este check ayuda con mensaje controlado.
  const params = [cliente_id, servicio_id, fecha, hora_inicio];
  let sql = `SELECT 1
             FROM reservas
             WHERE cliente_id = $1
               AND servicio_id = $2
               AND fecha = $3
               AND hora_inicio = $4`;

  if (excludeReservationId) {
    params.push(excludeReservationId);
    sql += ` AND id <> $5`;
  }

  const result = await db.query(sql, params);
  return result.rowCount > 0;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  existsExactDuplicate,
};

