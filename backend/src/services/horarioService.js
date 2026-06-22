const horarioModel = require('../models/horarioModel');

async function getAll({ limit, offset }) {
  return horarioModel.getAll({ limit, offset });
}

async function getById(id) {
  const horario = await horarioModel.getById(id);
  if (!horario) {
    const error = new Error('Horario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return horario;
}

async function create(payload) {
  const created = await horarioModel.create(payload);
  return created;
}

function parseTimeToMinutes(hora) {
  const [h, m] = String(hora).split(':').map(Number);
  return h * 60 + m;
}

async function update(id, payload) {
  const existing = await horarioModel.getById(id);
  if (!existing) {
    const error = new Error('Horario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const merged = {
    dia_semana:  payload.dia_semana  ?? existing.dia_semana,
    hora_inicio: payload.hora_inicio ?? existing.hora_inicio,
    hora_fin:    payload.hora_fin    ?? existing.hora_fin,
    disponible:  payload.disponible  ?? existing.disponible,
  };

  if (parseTimeToMinutes(merged.hora_fin) <= parseTimeToMinutes(merged.hora_inicio)) {
    const error = new Error('La hora_fin debe ser mayor que hora_inicio');
    error.statusCode = 400;
    throw error;
  }

  const updated = await horarioModel.update(id, merged);
  return updated;
}

async function remove(id) {
  const existing = await horarioModel.getById(id);
  if (!existing) {
    const error = new Error('Horario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  await horarioModel.remove(id);
  return { id };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};

