const express = require('express');

const empleadoController = require('../controllers/empleadoController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { createEmpleadoValidator, updateEmpleadoValidator } = require('../validators/empleadoValidators');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), empleadoController.getAll);
router.get('/:id', authenticate, authorize('admin'), empleadoController.getById);
router.post('/', authenticate, authorize('admin'), createEmpleadoValidator, validateRequest, empleadoController.create);
router.put('/:id', authenticate, authorize('admin'), updateEmpleadoValidator, validateRequest, empleadoController.update);
router.delete('/:id', authenticate, authorize('admin'), empleadoController.remove);

module.exports = router;
