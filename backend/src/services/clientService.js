const clientModel = require('../models/clientModel');

async function getAll({ limit, offset }) {
  return clientModel.getAll({ limit, offset });
}

async function getById(id) {
  const client = await clientModel.getById(id);
  if (!client) {
    const error = new Error('Cliente no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return client;
}

async function create(payload) {
  const created = await clientModel.create(payload);
  return created;
}

async function update(id, payload) {
  const existing = await clientModel.getById(id);
  if (!existing) {
    const error = new Error('Cliente no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const merged = {
    nombre:   payload.nombre   ?? existing.nombre,
    telefono: payload.telefono ?? existing.telefono,
    email:    payload.email    ?? existing.email,
  };

  const updated = await clientModel.update(id, merged);
  return updated;
}

async function remove(id) {
  const existing = await clientModel.getById(id);
  if (!existing) {
    const error = new Error('Cliente no encontrado');
    error.statusCode = 404;
    throw error;
  }

  await clientModel.remove(id);
  return { id };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};

