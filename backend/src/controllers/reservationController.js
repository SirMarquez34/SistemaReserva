const reservationService = require('../services/reservationService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const empleado_id = req.user.rol === 'empleado' ? req.user.pk_usuario : null;
    const { rows, total } = await reservationService.getAll({ limit, offset, empleado_id });
    res.json({
      ok: true,
      message: 'Reservas obtenidas correctamente',
      data: rows,
      pagination: buildPaginationMeta({ total, page, limit }),
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const reserva = await reservationService.getById(Number(id));

    res.json({
      ok: true,
      message: 'Reserva obtenida correctamente',
      data: reserva,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await reservationService.create(req.body);

    res.status(201).json({
      ok: true,
      message: 'Reserva creada correctamente',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await reservationService.update(Number(id), req.body);

    res.json({
      ok: true,
      message: 'Reserva actualizada correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await reservationService.remove(Number(id));

    res.json({
      ok: true,
      message: 'Reserva eliminada correctamente',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
}

async function getSlotsDisponibles(req, res, next) {
  try {
    const { servicio_id, fecha, empleado_id } = req.query;
    if (!servicio_id || !fecha || !empleado_id) {
      return res.status(400).json({ ok: false, message: 'servicio_id, fecha y empleado_id son requeridos' });
    }
    const result = await reservationService.getSlotsDisponibles({
      servicio_id: Number(servicio_id),
      fecha,
      empleado_id: Number(empleado_id),
    });
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getMisReservas(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await reservationService.getAllByCliente({ clienteId: req.cliente.cliente_id, limit, offset });
    res.json({
      ok: true,
      message: 'Reservas obtenidas correctamente',
      data: rows,
      pagination: buildPaginationMeta({ total, page, limit }),
    });
  } catch (error) {
    next(error);
  }
}

async function createMiReserva(req, res, next) {
  try {
    const created = await reservationService.create({
      ...req.body,
      cliente_id: req.cliente.cliente_id,
    });
    res.status(201).json({ ok: true, message: 'Reserva creada correctamente', data: created });
  } catch (error) {
    next(error);
  }
}

async function marcarAsistencia(req, res, next) {
  try {
    const { id } = req.params;
    const { asistio } = req.body;
    if (typeof asistio !== 'boolean') {
      return res.status(400).json({ ok: false, message: 'El campo asistio debe ser un booleano' });
    }
    const updated = await reservationService.marcarAsistencia(Number(id), asistio);
    res.json({ ok: true, message: 'Asistencia registrada correctamente', data: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getSlotsDisponibles,
  getMisReservas,
  createMiReserva,
  marcarAsistencia,
};

