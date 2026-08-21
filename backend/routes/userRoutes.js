const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    updateUser,
    getProfile,
    updateProfile,
    changePassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Specific routes must come before the /:id admin routes below,
// otherwise Express would match e.g. PUT /profile as PUT /:id.
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id', protect, admin, updateUser);

module.exports = router;
