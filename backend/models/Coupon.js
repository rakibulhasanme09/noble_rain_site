const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true, default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
