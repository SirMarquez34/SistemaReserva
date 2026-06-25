const reservationModel = require('../models/reservationModel');
const clientModel    = require('../models/clientModel');
const serviceModel   = require('../models/serviceModel');
const horarioModel   = require('../models/horarioModel');
const { getDiaSemana } = require('../utils/date');

function parseTimeToMinutes(hora) {
  const [h, m] = String(hora).split(':').map((x) => Number(x));
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(normalized / 60)).padStart(2, '0');
  const mm = String(normalized % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function calculateHoraFin({ hora_inicio, duracion_minutos }) {
  return minutesToTime(parseTimeToMinutes(hora_inicio) + duracion_minutos);
}

async function getAll({ limit, offset }) {
  return reservationModel.getAll({ limit, offset });
}

async function getAllByCliente({ clienteId, limit, offset }) {
  return reservationModel.getAllByCliente({ clienteId, limit, offset });
}

async function getSlotsDisponibles({ servicio_id, fecha, empleado_id }) {
  if (!empleado_id) {
    return { slots: [], duracion: 0, mensaje: 'Debes seleccionar un empleado' };
  }

  const servicio = await serviceModel.getById(servicio_id);
  if (!servicio) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const dia_semana = getDiaSemana(fecha);
  const horario = await horarioModel.findByDiaAndEmpleado(dia_semana, Number(empleado_id));

  if (!horario) {
    return {
      slots: [],
      duracion: servicio.duracion_minutos,
      mensaje: `El empleado no trabaja el ${dia_semana}`,
    };
  }

  const duracion = servicio.duracion_minutos;
  const aperturaMin = parseTimeToMinutes(horario.hora_inicio.slice(0, 5));
  const cierreMin   = parseTimeToMinutes(horario.hora_fin.slice(0, 5));

  const todosSlots = [];
  for (let t = aperturaMin; t + duracion <= cierreMin; t += duracion) {
    todosSlots.push(minutesToTime(t));
  }

  const ocupadas = await reservationModel.getOcupadasPorFechaEmpleado({
    empleado_id: Number(empleado_id),
    fecha,
  });

  const slots = todosSlots.map((hora) => {
    const slotStart = parseTimeToMinutes(hora);
    const slotEnd   = slotStart + duracion;
    const ocupado = ocupadas.some((r) => {
      const rStart = parseTimeToMinutes(r.hora_inicio.slice(0, 5));
      const rEnd   = parseTimeToMinutes(r.hora_fin.slice(0, 5));
      return slotStart < rEnd && slotEnd > rStart;
    });
    return { hora, disponible: !ocupado };
  });

  return { slots, duracion };
}

async function getById(id) {
  const reserva = await reservationModel.getById(id);
  if (!reserva) {
    const error = new Error('Reserva no encontrada');
    error.statusCode = 404;
    throw error;
  }
  return reserva;
}

async function validateHorarioDisponible({ fecha, hora_inicio, hora_fin, empleado_id }) {
  if (!empleado_id) return;
  const dia_semana = getDiaSemana(fecha);
  const horario = await horarioModel.findCovering({ dia_semana, hora_inicio, hora_fin, empleado_id });
  if (!horario) {
    const error = new Error(
      `El empleado no tiene horario disponible para el ${dia_semana} entre ${hora_inicio} y ${hora_fin}`
    );
    error.statusCode = 422;
    throw error;
  }
}

async function validateNoOverlappingReservation({ empleado_id, fecha, hora_inicio, hora_fin, excludeReservationId = null }) {
  if (!empleado_id) return;
  const conflict = await reservationModel.existsOverlappingReservationEmpleado({
    empleado_id,
    fecha,
    hora_inicio,
    hora_fin,
    excludeReservationId,
  });
  if (conflict) {
    const error = new Error('El empleado ya tiene una reserva asignada en ese horario');
    error.statusCode = 409;
    throw error;
  }
}

async function create(payload) {
  const { cliente_id, servicio_id, empleado_id, fecha, hora_inicio, estado, observaciones } = payload;

  const cliente = await clientModel.getById(cliente_id);
  if (!cliente) {
    const error = new Error('Cliente no existe');
    error.statusCode = 400;
    throw error;
  }

  const servicio = await serviceModel.getById(servicio_id);
  if (!servicio) {
    const error = new Error('Servicio no existe');
    error.statusCode = 400;
    throw error;
  }

  const hora_fin = calculateHoraFin({ hora_inicio, duracion_minutos: servicio.duracion_minutos });

  await validateHorarioDisponible({ fecha, hora_inicio, hora_fin, empleado_id });
  await validateNoOverlappingReservation({ empleado_id, fecha, hora_inicio, hora_fin });

  return reservationModel.create({
    cliente_id,
    servicio_id,
    empleado_id: empleado_id || null,
    fecha,
    hora_inicio,
    hora_fin,
    estado: estado || 'confirmada',
    observaciones: observaciones || '',
  });
}

async function update(id, payload) {
  const existing = await reservationModel.getById(id);
  if (!existing) {
    const error = new Error('Reserva no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const cliente_id    = payload.cliente_id    ?? existing.cliente_id;
  const servicio_id   = payload.servicio_id   ?? existing.servicio_id;
  const empleado_id   = payload.empleado_id   ?? existing.empleado_id;
  const fecha         = payload.fecha         ?? existing.fecha;
  const hora_inicio   = payload.hora_inicio   ?? existing.hora_inicio;
  const estado        = payload.estado        ?? existing.estado;
  const observaciones = payload.observaciones ?? existing.observaciones;

  const cliente = await clientModel.getById(cliente_id);
  if (!cliente) {
    const error = new Error('Cliente no existe');
    error.statusCode = 400;
    throw error;
  }

  const servicio = await serviceModel.getById(servicio_id);
  if (!servicio) {
    const error = new Error('Servicio no existe');
    error.statusCode = 400;
    throw error;
  }

  const hora_fin = calculateHoraFin({ hora_inicio, duracion_minutos: servicio.duracion_minutos });

  await validateHorarioDisponible({ fecha, hora_inicio, hora_fin, empleado_id });
  await validateNoOverlappingReservation({ empleado_id, fecha, hora_inicio, hora_fin, excludeReservationId: id });

  return reservationModel.update(id, {
    cliente_id,
    servicio_id,
    empleado_id: empleado_id || null,
    fecha,
    hora_inicio,
    hora_fin,
    estado,
    observaciones,
  });
}

async function remove(id) {
  const existing = await reservationModel.getById(id);
  if (!existing) {
    const error = new Error('Reserva no encontrada');
    error.statusCode = 404;
    throw error;
  }
  await reservationModel.remove(id);
  return { id };
}

module.exports = {
  getAll,
  getAllByCliente,
  getSlotsDisponibles,
  getById,
  create,
  update,
  remove,
};
