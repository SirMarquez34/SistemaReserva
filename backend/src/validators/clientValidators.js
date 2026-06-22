const { body } = require('express-validator');

const createClientValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no debe superar 100 caracteres'),

  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El telefono es obligatorio')
    .bail()
    .isLength({ max: 20 })
    .withMessage('El telefono no debe superar 20 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .bail()
    .isEmail()
    .withMessage('El email debe tener un formato valido')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El email no debe superar 100 caracteres')
    .normalizeEmail(),
];

const updateClientValidator = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no debe superar 100 caracteres'),

  body('telefono')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El telefono no puede estar vacio')
    .bail()
    .isLength({ max: 20 })
    .withMessage('El telefono no debe superar 20 caracteres'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El email no puede estar vacio')
    .bail()
    .isEmail()
    .withMessage('El email debe tener un formato valido')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El email no debe superar 100 caracteres')
    .normalizeEmail(),
];

const idParamValidator = [
  body('id') // placeholder (no se usa)
];

module.exports = {
  createClientValidator,
  updateClientValidator,
};

