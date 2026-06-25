const { body } = require('express-validator');

function parseTimeToMinutes(value) {
  // value esperado: "HH:MM" (TIME de PostgreSQL suele devolverlo así)
  const [hh, mm] = String(value).split(':');
  const minutes = Number(hh) * 60 + Number(mm);
  return minutes;
}

const createHorarioValidator = [
  body('usuario_id')
    .notEmpty()
    .withMessage('usuario_id es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('usuario_id debe ser un entero mayor a 0'),

  body('dia_semana')
    .trim()
    .notEmpty()
    .withMessage('El dia_semana es obligatorio'),

  body('hora_inicio')
    .notEmpty()
    .withMessage('La hora_inicio es obligatoria'),

  body('hora_fin')
    .notEmpty()
    .withMessage('La hora_fin es obligatoria')
    .bail()
    .custom((hora_fin, { req }) => {
      const hora_inicio = req.body.hora_inicio;

      const start = parseTimeToMinutes(hora_inicio);
      const end = parseTimeToMinutes(hora_fin);

      if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new Error('Formato de hora invalido (use HH:MM)');
      }

      if (end <= start) {
        throw new Error('La hora_fin debe ser mayor que hora_inicio');
      }

      return true;
    }),

  body('disponible')
    .optional()
    .isBoolean()
    .withMessage('El campo disponible debe ser booleano'),
];

const updateHorarioValidator = [
  body('dia_semana')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El dia_semana no puede estar vacio'),

  body('hora_inicio')
    .optional()
    .notEmpty()
    .withMessage('La hora_inicio no puede estar vacia'),

  body('hora_fin')
    .optional()
    .notEmpty()
    .withMessage('La hora_fin no puede estar vacia')
    .bail()
    .custom((hora_fin, { req }) => {
      const hora_inicio = req.body.hora_inicio;

      // Si no viene hora_inicio en el payload, no validamos comparacion.
      if (hora_inicio === undefined || hora_inicio === null) {
        return true;
      }

      const start = parseTimeToMinutes(hora_inicio);
      const end = parseTimeToMinutes(hora_fin);

      if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new Error('Formato de hora invalido (use HH:MM)');
      }

      if (end <= start) {
        throw new Error('La hora_fin debe ser mayor que hora_inicio');
      }

      return true;
    }),

  body('disponible')
    .optional()
    .isBoolean()
    .withMessage('El campo disponible debe ser booleano'),
];

module.exports = {
  createHorarioValidator,
  updateHorarioValidator,
};

