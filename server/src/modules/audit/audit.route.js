const express = require('express');
const auditController = require('./audit.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/', auditController.getAll);

module.exports = router;
