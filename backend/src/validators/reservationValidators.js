const { body, param } = require('express-validator');

const idParam = [
  param('id')
    .notEmpty()
    .withMessage('El id es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El id debe ser un entero mayor a 0'),
];

const dateValidator = body('fecha')
  .notEmpty()
  .withMessage('La fecha es obligatoria')
  .bail()
  .isISO8601({ strict: true })
  .withMessage('La fecha debe tener formato valido (YYYY-MM-DD)')
  .bail()
  .toDate()
  .withMessage('La fecha debe ser una fecha valida');

const timeValidator = body('hora_inicio')
  .notEmpty()
  .withMessage('La hora_inicio es obligatoria')
  .bail()
  .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  .withMessage('La hora_inicio debe tener formato HH:mm');

const createReservationValidator = [
  body('cliente_id')
    .notEmpty()
    .withMessage('cliente_id es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('cliente_id debe ser un entero mayor a 0'),

  body('servicio_id')
    .notEmpty()
    .withMessage('servicio_id es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('servicio_id debe ser un entero mayor a 0'),

  dateValidator,

  timeValidator,

  body('estado')
    .optional()
    .trim()
    .isString()
    .withMessage('estado debe ser texto')
    .isLength({ max: 30 })
    .withMessage('estado no debe superar 30 caracteres'),

  body('observaciones')
    .optional()
    .trim()
    .isString()
    .withMessage('observaciones debe ser texto'),

  // hora_fin se calcula, no se valida en request
  body('hora_fin').optional(),
];

const updateReservationValidator = [
  body('cliente_id')
    .optional()
    .notEmpty()
    .withMessage('cliente_id no puede estar vacio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('cliente_id debe ser un entero mayor a 0'),

  body('servicio_id')
    .optional()
    .notEmpty()
    .withMessage('servicio_id no puede estar vacio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('servicio_id debe ser un entero mayor a 0'),

  body('fecha')
    .optional()
    .notEmpty()
    .withMessage('fecha no puede estar vacia')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('La fecha debe tener formato valido (YYYY-MM-DD)'),

  body('hora_inicio')
    .optional()
    .notEmpty()
    .withMessage('hora_inicio no puede estar vacia')
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('La hora_inicio debe tener formato HH:mm'),

  body('estado')
    .optional()
    .trim()
    .isString()
    .withMessage('estado debe ser texto')
    .isLength({ max: 30 })
    .withMessage('estado no debe superar 30 caracteres'),

  body('observaciones')
    .optional()
    .trim()
    .isString()
    .withMessage('observaciones debe ser texto'),
];

const createMiReservaValidator = [
  body('servicio_id')
    .notEmpty()
    .withMessage('servicio_id es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('servicio_id debe ser un entero mayor a 0'),

  dateValidator,
  timeValidator,

  body('observaciones')
    .optional()
    .trim()
    .isString()
    .withMessage('observaciones debe ser texto'),
];

module.exports = {
  idParam,
  createReservationValidator,
  updateReservationValidator,
  createMiReservaValidator,
};

