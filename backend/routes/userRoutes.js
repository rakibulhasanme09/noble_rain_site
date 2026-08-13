const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id', protect, admin, updateUser);

module.exports = router;
