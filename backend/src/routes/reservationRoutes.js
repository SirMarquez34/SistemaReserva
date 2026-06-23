const express = require('express');

const reservationController = require('../controllers/reservationController');
const { authenticate, authenticateCliente } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createReservationValidator,
  updateReservationValidator,
  createMiReservaValidator,
} = require('../validators/reservationValidators');

const router = express.Router();

// Rutas de clientes primero para evitar colisión con /:id
router.get('/slots-disponibles', authenticateCliente, reservationController.getSlotsDisponibles);
router.get('/mis-reservas', authenticateCliente, reservationController.getMisReservas);
router.post('/mis-reservas', authenticateCliente, createMiReservaValidator, validateRequest, reservationController.createMiReserva);

router.get('/', authenticate, authorize('admin', 'empleado'), reservationController.getAll);
router.get('/:id', authenticate, authorize('admin', 'empleado'), reservationController.getById);
router.post('/', authenticate, authorize('admin', 'empleado'), createReservationValidator, validateRequest, reservationController.create);
router.put('/:id', authenticate, authorize('admin', 'empleado'), updateReservationValidator, validateRequest, reservationController.update);
router.delete('/:id', authenticate, authorize('admin'), reservationController.remove);

module.exports = router;

