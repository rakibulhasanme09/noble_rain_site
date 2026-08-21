const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user admin status
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    if (req.params.id === req.user._id.toString() && req.body.isAdmin === false) {
        res.status(400);
        throw new Error("You can't remove your own admin status");
    }

    const user = await User.findById(req.params.id);

    if (user) {
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json(user);
};

// @desc    Update logged-in user's profile (name, phone, default shipping address)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { name, phone, defaultShippingAddress } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (defaultShippingAddress !== undefined) {
        user.defaultShippingAddress = {
            ...user.defaultShippingAddress,
            ...defaultShippingAddress,
        };
    }

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        phone: updatedUser.phone,
        defaultShippingAddress: updatedUser.defaultShippingAddress,
    });
};

// @desc    Change logged-in user's password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
};

// @desc    Get logged-in user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json(user.wishlist);
};

// @desc    Add a product to the logged-in user's wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { productId } = req.params;
    if (!user.wishlist.some((id) => id.toString() === productId)) {
        user.wishlist.push(productId);
        await user.save();
    }

    const updated = await User.findById(req.user._id).populate('wishlist');
    res.json(updated.wishlist);
};

// @desc    Remove a product from the logged-in user's wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { productId } = req.params;
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const updated = await User.findById(req.user._id).populate('wishlist');
    res.json(updated.wishlist);
};

module.exports = {
    getUsers,
    deleteUser,
    updateUser,
    getProfile,
    updateProfile,
    changePassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
