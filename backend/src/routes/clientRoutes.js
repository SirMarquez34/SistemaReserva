const express = require('express');

const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createClientValidator,
  updateClientValidator,
} = require('../validators/clientValidators');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'empleado'), clientController.getAll);
router.get('/:id', authenticate, authorize('admin', 'empleado'), clientController.getById);
router.post('/', authenticate, authorize('admin'), createClientValidator, validateRequest, clientController.create);
router.put('/:id', authenticate, authorize('admin'), updateClientValidator, validateRequest, clientController.update);
router.delete('/:id', authenticate, authorize('admin'), clientController.remove);

module.exports = router;

