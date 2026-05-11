const express = require('express');
const usersController = require('./users.controller');

const router = express.Router();

router.post('/', usersController.create);
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

module.exports = router;
