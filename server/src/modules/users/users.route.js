const express = require('express');
const usersController = require('./users.controller');
const { createUserValidator, updateUserValidator } = require('./users.validator');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');
const validate = require('../../shared/middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.post('/', validate(createUserValidator), usersController.create);
router.get('/count', usersController.count);
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id', validate(updateUserValidator), usersController.update);
router.delete('/:id', usersController.delete);
router.put('/:id/reset-password', usersController.resetPassword);

module.exports = router;
