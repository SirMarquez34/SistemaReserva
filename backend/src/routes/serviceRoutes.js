const express = require('express');

const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createServiceValidator,
  updateServiceValidator,
} = require('../validators/serviceValidators');

const router = express.Router();

router.get('/', authenticate, serviceController.getAll);
router.get('/:id', authenticate, serviceController.getById);
router.post('/', authenticate, authorize('admin'), createServiceValidator, validateRequest, serviceController.create);
router.put('/:id', authenticate, authorize('admin'), updateServiceValidator, validateRequest, serviceController.update);
router.delete('/:id', authenticate, authorize('admin'), serviceController.remove);

module.exports = router;

