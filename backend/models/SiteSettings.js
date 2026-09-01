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

// Lines starting "N. " are rendered as section headings on the Privacy
// Policy / Terms of Service pages - everything else renders as a paragraph.
const DEFAULT_PRIVACY_POLICY = [
    '1. Information We Collect',
    'When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, delivery address, and order details. If you sign in with Google, we receive your name and email address from your Google account.',
    '2. How We Use Your Information',
    'We use your information to process and deliver orders, send order confirmations and account verification codes by email, respond to customer service requests, and improve our products and website. We do not sell your personal information to third parties.',
    '3. Sharing Your Information',
    "We share order and delivery details with our courier partners (such as Steadfast and Pathao) solely to deliver your order. We use Google's infrastructure to send transactional emails. We do not share your information with any other third party for marketing purposes.",
    '4. Payment Information',
    'We currently accept Cash on Delivery. We do not collect or store card, mobile banking, or other payment credentials on our servers.',
    '5. Cookies and Local Storage',
    "We use your browser's local storage to remember your shopping cart and keep you signed in. This data stays on your device and is not used for third-party advertising or tracking.",
    '6. Data Security',
    'We take reasonable technical measures, including encrypted password storage and secure account verification, to protect your personal information. However, no method of transmission over the internet is completely secure.',
    '7. Your Rights',
    'You may access, update, or request deletion of your account information at any time by contacting us. You can review and update your profile and shipping address from your account dashboard.',
    '8. Contact Us',
    'If you have any questions about this Privacy Policy, please contact us at info.noblerain@gmail.com.',
].join('\n');

const DEFAULT_TERMS_OF_SERVICE = [
    '1. About Noble Rain',
    'Noble Rain sells leather goods through this website to customers primarily in Bangladesh. By using this website or placing an order, you agree to these Terms of Service.',
    '2. Accounts',
    'You may browse and purchase as a guest, or create an account for order tracking and faster checkout. You are responsible for keeping your account credentials confidential and for all activity under your account.',
    '3. Orders and Pricing',
    'All prices are listed in Bangladeshi Taka (৳) and are subject to change without notice. Placing an order is an offer to purchase; we reserve the right to cancel or refuse any order, including in cases of pricing errors, suspected fraud, or stock unavailability.',
    '4. Payment',
    'We currently accept Cash on Delivery (COD). Payment is due to our courier partner upon delivery of your order.',
    '5. Shipping and Delivery',
    'Orders are delivered via our courier partners across Bangladesh. Estimated delivery times and shipping charges are provided at checkout and in our Shipping Policy. Delivery times are estimates and not guaranteed.',
    '6. Returns and Refunds',
    'Returns, exchanges, and refunds are handled according to our Return & Refund Policy, available in the footer of this website.',
    '7. Product Information',
    'We aim to display product images, descriptions, and stock levels accurately, but slight variations in color or finish may occur due to the natural material and photography. We do not guarantee that product descriptions are error-free.',
    '8. Reviews',
    'Customers who have created an account may submit product reviews. Reviews must be honest, relevant, and free of offensive or unlawful content. We reserve the right to remove reviews that violate these terms.',
    '9. Limitation of Liability',
    'Noble Rain is not liable for indirect or incidental damages arising from the use of this website or its products, to the fullest extent permitted by applicable law.',
    '10. Changes to These Terms',
    'We may update these Terms of Service from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.',
    '11. Contact Us',
    'Questions about these terms can be sent to info.noblerain@gmail.com.',
].join('\n');

// Singleton document holding site-wide editable content.
const siteSettingsSchema = new mongoose.Schema({
    shippingPolicy: { type: String, default: DEFAULT_SHIPPING_POLICY },
    returnPolicy: { type: String, default: DEFAULT_RETURN_POLICY },
    privacyPolicy: { type: String, default: DEFAULT_PRIVACY_POLICY },
    termsOfService: { type: String, default: DEFAULT_TERMS_OF_SERVICE },
    heroVideo: { type: String, default: '/hero-video.mp4' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
