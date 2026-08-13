const mongoose = require('mongoose');

const DEFAULT_SHIPPING_POLICY = [
    'We currently deliver across Bangladesh. Orders inside Dhaka are typically delivered within 1-3 business days, and outside Dhaka within 3-5 business days.',
    'Shipping charges are calculated at checkout based on your delivery location.',
    'You will receive a tracking code via SMS/email once your order is dispatched with our courier partner.',
].join('\n');

const DEFAULT_RETURN_POLICY = [
    'If you receive a damaged, defective, or incorrect item, please contact us within 3 days of delivery.',
    'Items must be unused, in original packaging, with all tags attached to be eligible for return.',
    'Refunds are processed within 7-10 business days after the returned item is received and inspected.',
].join('\n');

// Singleton document holding site-wide editable content.
const siteSettingsSchema = new mongoose.Schema({
    shippingPolicy: { type: String, default: DEFAULT_SHIPPING_POLICY },
    returnPolicy: { type: String, default: DEFAULT_RETURN_POLICY },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
