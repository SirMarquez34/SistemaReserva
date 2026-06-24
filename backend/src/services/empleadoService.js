const bcrypt = require('bcryptjs');
const empleadoModel = require('../models/empleadoModel');

const SALT_ROUNDS = 10;

async function getAll({ limit, offset }) {
  return empleadoModel.getAll({ limit, offset });
}

async function getById(id) {
  const empleado = await empleadoModel.getById(id);
  if (!empleado) {
    const error = new Error('Empleado no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return empleado;
}

async function create({ nombre, correo, contrasena }) {
  const normalizedEmail = correo.trim().toLowerCase();
  const existing = await empleadoModel.findByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('El correo ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);
  return empleadoModel.create({
    nombre: nombre.trim(),
    correo: normalizedEmail,
    contrasena: hashedPassword,
  });
}

async function update(id, payload) {
  const existing = await empleadoModel.getById(id);
  if (!existing) {
    const error = new Error('Empleado no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (payload.correo) {
    const normalizedEmail = payload.correo.trim().toLowerCase();
    const duplicate = await empleadoModel.findByEmail(normalizedEmail);
    if (duplicate && duplicate.id !== id) {
      const error = new Error('El correo ya está en uso');
      error.statusCode = 409;
      throw error;
    }
    payload.correo = normalizedEmail;
  }

  const merged = {
    nombre: payload.nombre ?? existing.nombre,
    correo:  payload.correo  ?? existing.correo,
  };

  const updated = await empleadoModel.update(id, merged);

  if (payload.contrasena) {
    const hashed = await bcrypt.hash(payload.contrasena, SALT_ROUNDS);
    await empleadoModel.updatePassword(id, hashed);
  }

  return updated;
}

async function remove(id) {
  const existing = await empleadoModel.getById(id);
  if (!existing) {
    const error = new Error('Empleado no encontrado');
    error.statusCode = 404;
    throw error;
  }
  await empleadoModel.remove(id);
  return { id };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
