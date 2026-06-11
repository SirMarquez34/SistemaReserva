const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

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

module.exports = {
  register,
  login,
  getProfile,
};
