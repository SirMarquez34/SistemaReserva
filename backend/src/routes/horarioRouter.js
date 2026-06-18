const express = require('express');

const horarioController = require('../controllers/horarioController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createHorarioValidator,
  updateHorarioValidator,
} = require('../validators/horarioValidator');

const router = express.Router();

router.get('/', authenticate, horarioController.getAll);
router.get('/:id', authenticate, horarioController.getById);
router.post('/', authenticate, createHorarioValidator, validateRequest, horarioController.create);
router.put('/:id', authenticate, updateHorarioValidator, validateRequest, horarioController.update);
router.delete('/:id', authenticate, horarioController.remove);

module.exports = router;

