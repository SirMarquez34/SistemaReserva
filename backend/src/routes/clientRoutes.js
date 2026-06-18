const express = require('express');

const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createClientValidator,
  updateClientValidator,
} = require('../validators/clientValidators');

const router = express.Router();

router.get('/', authenticate, clientController.getAll);
router.get('/:id', authenticate, clientController.getById);
router.post('/', authenticate, createClientValidator, validateRequest, clientController.create);
router.put('/:id', authenticate, updateClientValidator, validateRequest, clientController.update);
router.delete('/:id', authenticate, clientController.remove);

module.exports = router;

