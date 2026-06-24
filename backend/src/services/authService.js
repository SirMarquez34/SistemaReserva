const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const clientModel = require('../models/clientModel');
const { generateToken, generateClienteToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

function normalizeEmail(correo) {
  return correo.trim().toLowerCase();
}

async function register({ nombre, correo, contrasena, rol }) {
  const normalizedEmail = normalizeEmail(correo);
  const existingUser = await userModel.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error('El correo ya esta registrado');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);

  const user = await userModel.create({
    nombre: nombre.trim(),
    correo: normalizedEmail,
    contrasena: hashedPassword,
    rol: rol.trim(),
  });

  const token = generateToken(user);

  return {
    user,
    token,
  };
}

async function login({ correo, contrasena }) {
  const normalizedEmail = normalizeEmail(correo);
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }

  const passwordIsValid = await bcrypt.compare(contrasena, user.contrasena);

  if (!passwordIsValid) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }

  const publicUser = {
    pk_usuario: user.pk_usuario,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  };

  const token = generateToken(publicUser);

  return {
    user: publicUser,
    token,
  };
}

async function getProfile(pkUsuario) {
  const user = await userModel.findById(pkUsuario);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function changePassword(pkUsuario, { contrasena_actual, contrasena_nueva }) {
  const user = await userModel.findByIdWithPassword(pkUsuario);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const isValid = await bcrypt.compare(contrasena_actual, user.contrasena);
  if (!isValid) {
    const error = new Error('La contraseña actual es incorrecta');
    error.statusCode = 401;
    throw error;
  }

  const hashed = await bcrypt.hash(contrasena_nueva, SALT_ROUNDS);
  await userModel.updatePassword(pkUsuario, hashed);
}

async function registerCliente({ nombre, telefono, email, contrasena }) {
  const existing = await clientModel.findByEmail(email.trim().toLowerCase());
  if (existing) {
    const error = new Error('El correo ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);
  const cliente = await clientModel.createWithPassword({
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    email: email.trim().toLowerCase(),
    contrasena: hashedPassword,
  });

  const token = generateClienteToken(cliente);
  return { cliente, token };
}

async function loginCliente({ email, contrasena }) {
  const cliente = await clientModel.findByEmail(email.trim().toLowerCase());

  if (!cliente || !cliente.contrasena) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(contrasena, cliente.contrasena);
  if (!valid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const publicCliente = {
    id: cliente.id,
    nombre: cliente.nombre,
    email: cliente.email,
  };

  const token = generateClienteToken(cliente);
  return { cliente: publicCliente, token };
}

async function loginUnificado({ correo, contrasena }) {
  const email = normalizeEmail(correo);

  const user = await userModel.findByEmail(email);
  if (user) {
    const passwordIsValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordIsValid) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }
    const publicUser = {
      pk_usuario: user.pk_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    };
    const token = generateToken(publicUser);
    return { tipo: user.rol, user: publicUser, token };
  }

  const cliente = await clientModel.findByEmail(email);
  if (cliente && cliente.contrasena) {
    const valid = await bcrypt.compare(contrasena, cliente.contrasena);
    if (!valid) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }
    const publicCliente = {
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
    };
    const token = generateClienteToken(cliente);
    return { tipo: 'cliente', cliente: publicCliente, token };
  }

  const error = new Error('Credenciales inválidas');
  error.statusCode = 401;
  throw error;
}

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  registerCliente,
  loginCliente,
  loginUnificado,
};
