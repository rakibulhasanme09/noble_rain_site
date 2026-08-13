const Coupon = require('../models/Coupon');

const computeDiscount = (coupon, cartTotal) => {
    if (coupon.discountType === 'percentage') {
        return Math.round((cartTotal * coupon.discountValue) / 100);
    }
    return Math.min(coupon.discountValue, cartTotal);
};

const checkCouponValidity = (coupon, cartTotal) => {
    if (!coupon || !coupon.isActive) {
        return 'Invalid or inactive coupon code';
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return 'This coupon has expired';
    }
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
        return 'This coupon has reached its usage limit';
    }
    if (cartTotal < (coupon.minPurchase || 0)) {
        return `Minimum purchase of ৳${coupon.minPurchase} required for this coupon`;
    }
    return null;
};

// @desc    Validate a coupon code against a cart total
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
        res.status(400);
        throw new Error('Coupon code and cart total are required');
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    const error = checkCouponValidity(coupon, Number(cartTotal));

    if (error) {
        res.status(400);
        throw new Error(error);
    }

    const discountAmount = computeDiscount(coupon, Number(cartTotal));

    res.json({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
    });
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    const { code, discountType, discountValue, minPurchase, usageLimit, expiryDate } = req.body;

    if (!code || !discountValue) {
        res.status(400);
        throw new Error('Coupon code and discount value are required');
    }

    const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (exists) {
        res.status(400);
        throw new Error('A coupon with this code already exists');
    }

    const coupon = await Coupon.create({
        code: code.trim().toUpperCase(),
        discountType: discountType || 'percentage',
        discountValue,
        minPurchase: minPurchase || 0,
        usageLimit: usageLimit || null,
        expiryDate: expiryDate || null,
    });

    res.status(201).json(coupon);
};

// @desc    Update a coupon (e.g. toggle active)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    const { discountType, discountValue, minPurchase, usageLimit, expiryDate, isActive } = req.body;

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    const updated = await coupon.save();
    res.json(updated);
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
};

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon, checkCouponValidity, computeDiscount };
