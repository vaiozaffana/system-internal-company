const express = require('express');
const authController = require('./auth.controller');
const { loginValidator } = require('./auth.validator');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const validate = require('../../shared/middlewares/validate.middleware');
const { authLimiter } = require('../../shared/middlewares/rateLimitter.middleware');

const router = express.Router();

router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
