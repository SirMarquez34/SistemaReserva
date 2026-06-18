const reservationModel = require('../models/reservationModel');
const clientModel = require('../models/clientModel');
const serviceModel = require('../models/serviceModel');

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

async function getAll() {
  return reservationModel.getAll();
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

  const duplicate = await reservationModel.existsExactDuplicate({
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
  });

  if (duplicate) {
    const error = new Error('Ya existe una reserva exactamente en la misma hora para ese cliente y servicio');
    error.statusCode = 409;
    throw error;
  }

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

  const duplicate = await reservationModel.existsExactDuplicate({
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
    excludeReservationId: id,
  });

  if (duplicate) {
    const error = new Error('Ya existe una reserva exactamente en la misma hora para ese cliente y servicio');
    error.statusCode = 409;
    throw error;
  }

  const updated = await reservationModel.update(id, {
    cliente_id,
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin,
    estado: estado || existing.estado,
    observaciones: observaciones ?? existing.observaciones,
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
  getById,
  create,
  update,
  remove,
};

