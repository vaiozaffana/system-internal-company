const express = require('express');
const leaveController = require('./leave.controller');
const { createLeaveValidator, reviewLeaveValidator } = require('./leave.validator');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');
const validate = require('../../shared/middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(createLeaveValidator), leaveController.create);
router.get('/me', leaveController.getMyRequests);
router.delete('/:id', leaveController.cancel);

router.get('/', requireAdmin, leaveController.getAll);
router.put('/:id/review', requireAdmin, validate(reviewLeaveValidator), leaveController.review);

module.exports = router;
