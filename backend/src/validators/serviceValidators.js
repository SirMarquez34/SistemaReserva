const { body } = require('express-validator');

const createServiceValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isLength({ max: 120 })
    .withMessage('El nombre no debe superar 120 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .isString()
    .withMessage('La descripcion debe ser texto'),

  body('duracion_minutos')
    .notEmpty()
    .withMessage('La duracion_minutos es obligatoria')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('La duracion_minutos debe ser un entero mayor a 0'),

  body('precio')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser booleano'),
];

const updateServiceValidator = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .bail()
    .isLength({ max: 120 })
    .withMessage('El nombre no debe superar 120 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .isString()
    .withMessage('La descripcion debe ser texto'),

  body('duracion_minutos')
    .optional()
    .notEmpty()
    .withMessage('La duracion_minutos no puede estar vacia')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('La duracion_minutos debe ser un entero mayor a 0'),

  body('precio')
    .optional()
    .notEmpty()
    .withMessage('El precio no puede estar vacio')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser booleano'),
];

module.exports = {
  createServiceValidator,
  updateServiceValidator,
};

