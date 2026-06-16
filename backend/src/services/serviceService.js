const serviceModel = require('../models/serviceModel');

async function getAll() {
  return serviceModel.getAll();
}

async function getById(id) {
  const servicio = await serviceModel.getById(id);
  if (!servicio) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return servicio;
}

async function create(payload) {
  const created = await serviceModel.create(payload);
  return created;
}

async function update(id, payload) {
  const existing = await serviceModel.getById(id);
  if (!existing) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const updated = await serviceModel.update(id, payload);
  return updated;
}

async function remove(id) {
  const existing = await serviceModel.getById(id);
  if (!existing) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  await serviceModel.remove(id);
  return { id };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};

