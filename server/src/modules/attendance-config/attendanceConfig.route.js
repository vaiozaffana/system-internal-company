const express = require('express');
const attendanceConfigController = require('./attendanceConfig.controller');
const { updateConfigValidator } = require('./attendanceConfig.validator');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');
const validate = require('../../shared/middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', attendanceConfigController.get);
router.put('/', requireAdmin, validate(updateConfigValidator), attendanceConfigController.update);

module.exports = router;
