const express = require('express');

const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createServiceValidator,
  updateServiceValidator,
} = require('../validators/serviceValidators');

const router = express.Router();

router.get('/', authenticate, serviceController.getAll);
router.get('/:id', authenticate, serviceController.getById);
router.post('/', authenticate, createServiceValidator, validateRequest, serviceController.create);
router.put('/:id', authenticate, updateServiceValidator, validateRequest, serviceController.update);
router.delete('/:id', authenticate, serviceController.remove);

module.exports = router;

