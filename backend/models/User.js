const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Not required: accounts created via Google Sign-In have no password.
    password: { type: String },
    googleId: { type: String, default: undefined, unique: true, sparse: true },
    isAdmin: { type: Boolean, required: true, default: false },
    phone: { type: String, default: '' },
    defaultShippingAddress: {
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: 'Bangladesh' },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isVerified: { type: Boolean, required: true, default: false },
    otp: {
        code: { type: String },
        expiresAt: { type: Date },
    },
    passwordResetOtp: {
        code: { type: String },
        expiresAt: { type: Date },
    },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
