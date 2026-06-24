const { body } = require('express-validator');

const createEmpleadoValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no debe superar 100 caracteres'),

  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .bail()
    .isEmail()
    .withMessage('El correo debe tener un formato válido')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El correo no debe superar 100 caracteres')
    .normalizeEmail(),

  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .bail()
    .isLength({ min: 6, max: 255 })
    .withMessage('La contraseña debe tener entre 6 y 255 caracteres'),
];

const updateEmpleadoValidator = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no debe superar 100 caracteres'),

  body('correo')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El correo debe tener un formato válido')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El correo no debe superar 100 caracteres')
    .normalizeEmail(),

  body('contrasena')
    .optional()
    .isLength({ min: 6, max: 255 })
    .withMessage('La contraseña debe tener entre 6 y 255 caracteres'),
];

module.exports = {
  createEmpleadoValidator,
  updateEmpleadoValidator,
};
