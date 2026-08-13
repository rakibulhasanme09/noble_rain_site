const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, updateOrderToPaid, updateOrderStatus, updateOrderDetails, updateOrderPaymentStatus, updateOrderAmount, getMyOrders, getOrders, deleteOrder, getRevenueStats, dispatchOrder, steadfastWebhook, trackOrder } = require('../controllers/orderController');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

router.route('/').post(optionalProtect, addOrderItems).get(protect, admin, getOrders);
router.route('/revenue').get(protect, admin, getRevenueStats);
router.route('/myorders').get(protect, getMyOrders);
router.route('/steadfast/webhook').post(steadfastWebhook);
router.route('/:id').get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/details').put(protect, admin, updateOrderDetails);
router.route('/:id/payment-status').put(protect, admin, updateOrderPaymentStatus);
router.route('/:id/amount').put(protect, admin, updateOrderAmount);
router.route('/:id/dispatch').post(protect, admin, dispatchOrder);
router.route('/:id/track').get(protect, admin, trackOrder);

module.exports = router;
