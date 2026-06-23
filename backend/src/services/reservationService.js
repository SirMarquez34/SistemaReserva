const reservationModel = require('../models/reservationModel');
const clientModel = require('../models/clientModel');
const serviceModel = require('../models/serviceModel');
const horarioModel = require('../models/horarioModel');

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function getDiaSemana(fecha) {
  // El validador .toDate() puede convertir fecha a Date object; también soportamos string 'YYYY-MM-DD'
  let date;
  if (fecha instanceof Date) {
    date = fecha;
  } else {
    const [year, month, day] = String(fecha).split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  return DIAS_SEMANA[date.getDay()];
}

function parseTimeToMinutes(hora) {
  // hora esperado: 'HH:mm'
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
  const startMins = parseTimeToMinutes(hora_inicio);
  const endMins = startMins + duracion_minutos;
  return minutesToTime(endMins);
}

async function getAll({ limit, offset }) {
  return reservationModel.getAll({ limit, offset });
}

async function getAllByCliente({ clienteId, limit, offset }) {
  return reservationModel.getAllByCliente({ clienteId, limit, offset });
}

async function getSlotsDisponibles({ servicio_id, fecha }) {
  const servicio = await serviceModel.getById(servicio_id);
  if (!servicio) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const dia_semana = getDiaSemana(fecha);
  const horario = await horarioModel.findByDia(dia_semana);

  if (!horario) {
    return { slots: [], duracion: servicio.duracion_minutos, mensaje: `No hay horario disponible para el ${dia_semana}` };
  }

  const duracion = servicio.duracion_minutos;
  const aperturaMin = parseTimeToMinutes(horario.hora_inicio.slice(0, 5));
  const cierreMin = parseTimeToMinutes(horario.hora_fin.slice(0, 5));

  // Generar todos los slots posibles
  const todosSlots = [];
  for (let t = aperturaMin; t + duracion <= cierreMin; t += duracion) {
    todosSlots.push(minutesToTime(t));
  }

  // Filtrar slots que se solapan con reservas existentes
  const ocupadas = await reservationModel.getOcupadasPorFechaServicio({ servicio_id, fecha });

  const slotsDisponibles = todosSlots.filter((slot) => {
    const slotStart = parseTimeToMinutes(slot);
    const slotEnd = slotStart + duracion;
    return !ocupadas.some((r) => {
      const rStart = parseTimeToMinutes(r.hora_inicio.slice(0, 5));
      const rEnd = parseTimeToMinutes(r.hora_fin.slice(0, 5));
      return slotStart < rEnd && slotEnd > rStart;
    });
  });

  return { slots: slotsDisponibles, duracion };
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

async function validateHorarioDisponible({ fecha, hora_inicio, hora_fin }) {
  const dia_semana = getDiaSemana(fecha);
  const horario = await horarioModel.findCovering({ dia_semana, hora_inicio, hora_fin });

  if (!horario) {
    const error = new Error(
      `No existe un horario disponible para el ${dia_semana} entre ${hora_inicio} y ${hora_fin}`
    );
    error.statusCode = 422;
    throw error;
  }
}

async function validateNoOverlappingReservation({ cliente_id, servicio_id, fecha, hora_inicio, hora_fin, excludeReservationId = null }) {
  // Conflicto si el intervalo solicitado se cruza con algún intervalo existente
  const conflict = await reservationModel.existsOverlappingReservation({
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin,
    excludeReservationId,
  });

  if (conflict) {
    const error = new Error(
      'Conflicto de horario: ya existe una reserva para el mismo servicio que se traslapa con el intervalo solicitado'
    );
    error.statusCode = 409;
    throw error;
  }
}

async function create(payload) {
  const { cliente_id, servicio_id, fecha, hora_inicio, estado, observaciones } = payload;

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

  await validateHorarioDisponible({ fecha, hora_inicio, hora_fin });

  await validateNoOverlappingReservation({
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin,
  });

  const created = await reservationModel.create({
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin,
    estado: estado || 'confirmada',
    observaciones: observaciones || '',
  });

  return created;
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

  await validateHorarioDisponible({ fecha, hora_inicio, hora_fin });

  await validateNoOverlappingReservation({
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin,
    excludeReservationId: id,
  });

  const updated = await reservationModel.update(id, {
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin,
    estado,
    observaciones,
  });

  return updated;
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

