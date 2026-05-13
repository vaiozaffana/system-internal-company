const express = require('express');
const notificationController = require('./notification.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
