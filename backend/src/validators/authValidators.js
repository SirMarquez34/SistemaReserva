const { body } = require('express-validator');

const registerValidator = [
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
    .withMessage('El correo debe tener un formato valido')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El correo no debe superar 100 caracteres')
    .normalizeEmail(),

  body('contrasena')
    .notEmpty()
    .withMessage('La contrasena es obligatoria')
    .bail()
    .isLength({ min: 6, max: 255 })
    .withMessage('La contrasena debe tener entre 6 y 255 caracteres'),

  body('rol')
    .trim()
    .notEmpty()
    .withMessage('El rol es obligatorio')
    .bail()
    .isIn(['admin', 'empleado'])
    .withMessage('El rol debe ser admin o empleado'),
];

const loginValidator = [
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .bail()
    .isEmail()
    .withMessage('El correo debe tener un formato valido')
    .normalizeEmail(),

  body('contrasena')
    .notEmpty()
    .withMessage('La contrasena es obligatoria'),
];

const changePasswordValidator = [
  body('contrasena_actual')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),

  body('contrasena_nueva')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria')
    .bail()
    .isLength({ min: 6, max: 255 })
    .withMessage('La nueva contraseña debe tener entre 6 y 255 caracteres'),
];

const registerClienteValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio').isLength({ max: 20 }),
  body('email')
    .trim().notEmpty().withMessage('El email es obligatorio')
    .bail().isEmail().withMessage('El email debe tener un formato válido')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .bail().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const loginClienteValidator = [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),
];

const loginUnificadoValidator = [
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .bail()
    .isEmail()
    .withMessage('El correo debe tener un formato válido')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  registerClienteValidator,
  loginClienteValidator,
  loginUnificadoValidator,
};
