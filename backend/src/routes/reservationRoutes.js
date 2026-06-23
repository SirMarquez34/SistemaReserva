const express = require('express');

const reservationController = require('../controllers/reservationController');
const { authenticate, authenticateCliente } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createReservationValidator,
  updateReservationValidator,
} = require('../validators/reservationValidators');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'empleado'), reservationController.getAll);
router.get('/:id', authenticate, authorize('admin', 'empleado'), reservationController.getById);
router.post('/', authenticate, authorize('admin', 'empleado'), createReservationValidator, validateRequest, reservationController.create);
router.put('/:id', authenticate, authorize('admin', 'empleado'), updateReservationValidator, validateRequest, reservationController.update);
router.delete('/:id', authenticate, authorize('admin'), reservationController.remove);

// Rutas para clientes autenticados
router.get('/mis-reservas', authenticateCliente, reservationController.getMisReservas);
router.post('/mis-reservas', authenticateCliente, createReservationValidator, validateRequest, reservationController.createMiReserva);

module.exports = router;

