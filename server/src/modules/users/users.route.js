const express = require('express');
const usersController = require('./users.controller');
const { createUserValidator, updateUserValidator } = require('./users.validator');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');
const validate = require('../../shared/middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Accessible by all authenticated users (no requireAdmin)
router.get('/colleagues', async (req, res) => {
  try {
    const prisma = require('../../config/database');
    const users = await prisma.user.findMany({
      where: { isActive: true, role: 'user' },
      select: { id: true, fullName: true, employeeCode: true, department: true, position: true },
      orderBy: { fullName: 'asc' },
    });
    const { successResponse } = require('../../shared/utils/response.helper');
    return successResponse(res, users);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.use(requireAdmin);

router.post('/', validate(createUserValidator), usersController.create);
router.get('/count', usersController.count);
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id', validate(updateUserValidator), usersController.update);
router.delete('/:id', usersController.delete);
router.put('/:id/reset-password', usersController.resetPassword);

module.exports = router;
