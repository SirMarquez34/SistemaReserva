const horarioModel = require('../models/horarioModel');

async function getAll() {
  return horarioModel.getAll();
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

async function update(id, payload) {
  const existing = await horarioModel.getById(id);
  if (!existing) {
    const error = new Error('Horario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const updated = await horarioModel.update(id, payload);
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

