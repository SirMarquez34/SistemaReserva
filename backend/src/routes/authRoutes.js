const express = require('express');

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  registerValidator,
  loginValidator,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authenticate, authorize('admin'), registerValidator, validateRequest, authController.register);
router.post('/login', loginLimiter, loginValidator, validateRequest, authController.login);
router.get('/profile', authenticate, authController.profile);

module.exports = router;
