const db = require('../config/db');

async function getAll({ limit, offset, empleado_id = null }) {
  const params = empleado_id ? [empleado_id, limit, offset] : [limit, offset];
  const where = empleado_id ? 'WHERE r.empleado_id = $1' : '';
  const p = empleado_id ? ['$2', '$3'] : ['$1', '$2'];

  const result = await db.query(
    `SELECT r.id,
            r.cliente_id,
            r.servicio_id,
            r.empleado_id,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.estado,
            r.observaciones,
            r.created_at,
            c.nombre  AS cliente_nombre,
            s.nombre  AS servicio_nombre,
            u.nombre  AS empleado_nombre,
            COUNT(*) OVER() AS total
     FROM reservas r
     INNER JOIN clientes  c ON c.id         = r.cliente_id
     INNER JOIN servicios s ON s.id         = r.servicio_id
     LEFT  JOIN usuarios  u ON u.pk_usuario = r.empleado_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT ${p[0]} OFFSET ${p[1]}`,
    params
  );
  const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
  const rows = result.rows.map(({ total: _, ...row }) => row);
  return { rows, total };
}

async function getAllByCliente({ clienteId, limit, offset }) {
  const result = await db.query(
    `SELECT r.id,
            r.cliente_id,
            r.servicio_id,
            r.empleado_id,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.estado,
            r.observaciones,
            r.created_at,
            c.nombre  AS cliente_nombre,
            s.nombre  AS servicio_nombre,
            u.nombre  AS empleado_nombre,
            COUNT(*) OVER() AS total
     FROM reservas r
     INNER JOIN clientes  c ON c.id         = r.cliente_id
     INNER JOIN servicios s ON s.id         = r.servicio_id
     LEFT  JOIN usuarios  u ON u.pk_usuario = r.empleado_id
     WHERE r.cliente_id = $1
     ORDER BY r.fecha DESC, r.hora_inicio DESC
     LIMIT $2 OFFSET $3`,
    [clienteId, limit, offset]
  );
  const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
  const rows = result.rows.map(({ total: _, ...row }) => row);
  return { rows, total };
}

async function getById(id) {
  const result = await db.query(
    `SELECT r.id,
            r.cliente_id,
            r.servicio_id,
            r.empleado_id,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.estado,
            r.observaciones,
            r.created_at,
            c.nombre  AS cliente_nombre,
            s.nombre  AS servicio_nombre,
            u.nombre  AS empleado_nombre
     FROM reservas r
     INNER JOIN clientes  c ON c.id         = r.cliente_id
     INNER JOIN servicios s ON s.id         = r.servicio_id
     LEFT  JOIN usuarios  u ON u.pk_usuario = r.empleado_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ cliente_id, servicio_id, empleado_id, fecha, hora_inicio, hora_fin, estado, observaciones }) {
  const result = await db.query(
    `INSERT INTO reservas (
        cliente_id, servicio_id, empleado_id,
        fecha, hora_inicio, hora_fin, estado, observaciones
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, cliente_id, servicio_id, empleado_id,
               fecha, hora_inicio, hora_fin, estado, observaciones, created_at`,
    [cliente_id, servicio_id, empleado_id || null, fecha, hora_inicio, hora_fin, estado, observaciones]
  );
  return result.rows[0];
}

async function update(id, { cliente_id, servicio_id, empleado_id, fecha, hora_inicio, hora_fin, estado, observaciones }) {
  const result = await db.query(
    `UPDATE reservas
     SET cliente_id  = $1,
         servicio_id = $2,
         empleado_id = $3,
         fecha       = $4,
         hora_inicio = $5,
         hora_fin    = $6,
         estado      = $7,
         observaciones = $8
     WHERE id = $9
     RETURNING id, cliente_id, servicio_id, empleado_id,
               fecha, hora_inicio, hora_fin, estado, observaciones, created_at`,
    [cliente_id, servicio_id, empleado_id || null, fecha, hora_inicio, hora_fin, estado, observaciones, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM reservas WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

async function getOcupadasPorFechaEmpleado({ empleado_id, fecha }) {
  const result = await db.query(
    `SELECT hora_inicio, hora_fin FROM reservas
     WHERE empleado_id = $1 AND fecha = $2 AND estado <> 'cancelada'`,
    [empleado_id, fecha]
  );
  return result.rows;
}

async function existsOverlappingReservationEmpleado({ empleado_id, fecha, hora_inicio, hora_fin, excludeReservationId = null }) {
  const params = [empleado_id, fecha, hora_inicio, hora_fin];
  let sql = `SELECT 1 FROM reservas
             WHERE empleado_id = $1 AND fecha = $2
               AND $3 < hora_fin AND $4 > hora_inicio
               AND estado <> 'cancelada'`;
  if (excludeReservationId) {
    params.push(excludeReservationId);
    sql += ` AND id <> $5`;
  }
  const result = await db.query(sql, params);
  return result.rowCount > 0;
}

async function updateEstado(id, estado) {
  const result = await db.query(
    `UPDATE reservas SET estado = $1 WHERE id = $2
     RETURNING id, cliente_id, servicio_id, empleado_id,
               fecha, hora_inicio, hora_fin, estado, observaciones, created_at`,
    [estado, id]
  );
  return result.rows[0] || null;
}

async function existsExactDuplicate({ cliente_id, servicio_id, fecha, hora_inicio, excludeReservationId = null }) {
  const params = [cliente_id, servicio_id, fecha, hora_inicio];
  let sql = `SELECT 1 FROM reservas
             WHERE cliente_id = $1 AND servicio_id = $2
               AND fecha = $3 AND hora_inicio = $4`;
  if (excludeReservationId) {
    params.push(excludeReservationId);
    sql += ` AND id <> $5`;
  }
  const result = await db.query(sql, params);
  return result.rowCount > 0;
}

async function marcarNoAsistioVencidas() {
  const result = await db.query(
    `UPDATE reservas
     SET estado = 'no_asistio'
     WHERE estado = 'confirmada'
       AND (fecha + hora_fin) < NOW()
     RETURNING id`
  );
  return result.rowCount;
}

module.exports = {
  getAll,
  getAllByCliente,
  getById,
  create,
  update,
  updateEstado,
  remove,
  getOcupadasPorFechaEmpleado,
  existsOverlappingReservationEmpleado,
  existsExactDuplicate,
  marcarNoAsistioVencidas,
};
