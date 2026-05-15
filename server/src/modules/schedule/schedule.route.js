const express = require('express');
const scheduleController = require('./schedule.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', scheduleController.getAll);
router.put('/:date', requireAdmin, scheduleController.upsertDay);

module.exports = router;
