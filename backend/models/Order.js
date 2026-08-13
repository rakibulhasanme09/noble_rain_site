const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
    guestName: { type: String, required: false },
    guestEmail: { type: String, required: false },
    guestPhone: { type: String, required: false },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            costPrice: { type: Number, required: true, default: 0 },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
            weight: { type: Number, default: 0.5 },
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String },
        country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'COD' },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    totalWeight: { type: Number, required: true, default: 0.5 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'On the way', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    courierService: { type: String, enum: ['Steadfast', 'Pathao', null], default: null },
    trackingCode: { type: String },
    consignmentId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
