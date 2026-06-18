const express = require('express');

const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createReservationValidator,
  updateReservationValidator,
} = require('../validators/reservationValidators');

const router = express.Router();

router.get('/', authenticate, reservationController.getAll);
router.get('/:id', authenticate, reservationController.getById);
router.post('/', authenticate, createReservationValidator, validateRequest, reservationController.create);
router.put('/:id', authenticate, updateReservationValidator, validateRequest, reservationController.update);
router.delete('/:id', authenticate, reservationController.remove);

module.exports = router;

