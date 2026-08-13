const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { checkCouponValidity, computeDiscount } = require('./couponController');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, guestName, guestEmail, guestPhone, couponCode } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        let coupon = null;
        let discountAmount = 0;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
            const error = checkCouponValidity(coupon, Number(itemsPrice));
            if (error) {
                res.status(400);
                throw new Error(error);
            }
            discountAmount = computeDiscount(coupon, Number(itemsPrice));
        }

        let calculatedTotalWeight = 0;
        const orderItemsWithCost = await Promise.all(orderItems.map(async (item) => {
            const product = await Product.findById(item.product);
            const itemWeight = product ? product.weight || 0.5 : 0.5;
            calculatedTotalWeight += itemWeight * item.qty;
            return {
                ...item,
                costPrice: product ? product.costPrice : 0,
                weight: itemWeight,
            };
        }));

        const order = new Order({
            orderItems: orderItemsWithCost,
            user: req.user ? req.user._id : undefined,
            guestName,
            guestEmail,
            guestPhone,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            couponCode: coupon ? coupon.code : undefined,
            discountAmount,
            totalPrice: Math.max(0, Number(itemsPrice) + Number(shippingPrice) - discountAmount),
            totalWeight: calculatedTotalWeight,
        });

        const createdOrder = await order.save();

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock = Math.max(0, product.countInStock - item.qty);
                await product.save();
            }
        }

        if (coupon) {
            coupon.usedCount += 1;
            await coupon.save();
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    const result = order.toObject();
    if (!req.user.isAdmin) {
        result.orderItems = result.orderItems.map(({ costPrice, ...item }) => item);
    }

    res.json(result);
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const isOwner = order.user && order.user.toString() === req.user._id.toString();
        if (!isOwner && !req.user.isAdmin) {
            res.status(403);
            throw new Error('Not authorized to update this order');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Edit full order details: items, quantities, customer info, address
// @route   PUT /api/orders/:id/details
// @access  Private/Admin
const updateOrderDetails = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const { orderItems, shippingAddress, guestName, guestEmail, guestPhone, shippingPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('An order must have at least one item');
    }

    const oldQtyByProduct = {};
    for (const item of order.orderItems) {
        oldQtyByProduct[item.product.toString()] = (oldQtyByProduct[item.product.toString()] || 0) + item.qty;
    }

    const newQtyByProduct = {};
    for (const item of orderItems) {
        if (!item.product || !item.qty || item.qty < 1) {
            res.status(400);
            throw new Error('Each order item needs a valid product and quantity');
        }
        newQtyByProduct[item.product] = (newQtyByProduct[item.product] || 0) + Number(item.qty);
    }

    const affectedProductIds = new Set([...Object.keys(oldQtyByProduct), ...Object.keys(newQtyByProduct)]);
    for (const productId of affectedProductIds) {
        const oldQty = oldQtyByProduct[productId] || 0;
        const newQty = newQtyByProduct[productId] || 0;
        const delta = oldQty - newQty; // positive delta => stock should increase
        if (delta === 0) continue;

        const product = await Product.findById(productId);
        if (product) {
            product.countInStock = Math.max(0, product.countInStock + delta);
            await product.save();
        }
    }

    let calculatedTotalWeight = 0;
    const rebuiltItems = await Promise.all(orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        const weight = product ? product.weight || 0.5 : 0.5;
        calculatedTotalWeight += weight * item.qty;
        return {
            product: item.product,
            name: item.name,
            image: item.image,
            price: Number(item.price),
            qty: Number(item.qty),
            costPrice: product ? product.costPrice : (item.costPrice || 0),
            weight,
        };
    }));

    order.orderItems = rebuiltItems;
    order.totalWeight = calculatedTotalWeight;

    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (guestName !== undefined) order.guestName = guestName;
    if (guestEmail !== undefined) order.guestEmail = guestEmail;
    if (guestPhone !== undefined) order.guestPhone = guestPhone;
    if (shippingPrice !== undefined) order.shippingPrice = Number(shippingPrice);

    const itemsPrice = rebuiltItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    order.itemsPrice = itemsPrice;
    order.totalPrice = Math.max(0, itemsPrice + order.shippingPrice - (order.discountAmount || 0));

    const updatedOrder = await order.save();
    res.json(updatedOrder);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        const newStatus = req.body.status;
        
        order.status = newStatus;
        
        if (newStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        } else {
            order.isDelivered = false;
        }

        if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock += item.qty;
                    await product.save();
                }
            }
        } else if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock = Math.max(0, product.countInStock - item.qty);
                    await product.save();
                }
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order payment status manually
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
const updateOrderPaymentStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = req.body.isPaid;
        if (order.isPaid) {
            order.paidAt = Date.now();
        } else {
            order.paidAt = null;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order total amount
// @route   PUT /api/orders/:id/amount
// @access  Private/Admin
const updateOrderAmount = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (req.body.totalPrice !== undefined) {
            order.totalPrice = Number(req.body.totalPrice);
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    const sanitized = orders.map((order) => {
        const obj = order.toObject();
        obj.orderItems = obj.orderItems.map(({ costPrice, ...item }) => item);
        return obj;
    });
    res.json(sanitized);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Optionally, if the order wasn't cancelled, we might want to restore stock before deleting.
        // But if they are just deleting it, they might just want it gone.
        // We'll restore stock if it wasn't cancelled.
        if (order.status !== 'Cancelled') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock += item.qty;
                    await product.save();
                }
            }
        }
        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get revenue stats
// @route   GET /api/orders/revenue
// @access  Private/Admin
const getRevenueStats = async (req, res) => {
    // Aggregate delivered orders
    const orders = await Order.find({ status: 'Delivered' });

    let totalRevenue = 0;
    let totalCost = 0;
    const monthlyData = {};
    const yearlyData = {};

    orders.forEach(order => {
        const orderRevenue = order.totalPrice || 0;
        totalRevenue += orderRevenue;
        let orderCost = 0;
        order.orderItems.forEach(item => {
            orderCost += (item.costPrice || 0) * item.qty;
        });
        totalCost += orderCost;

        const date = new Date(order.deliveredAt || order.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const year = `${date.getFullYear()}`;

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { revenue: 0, cost: 0, profit: 0 };
        }
        monthlyData[monthYear].revenue += orderRevenue;
        monthlyData[monthYear].cost += orderCost;
        monthlyData[monthYear].profit += (orderRevenue - orderCost);

        if (!yearlyData[year]) {
            yearlyData[year] = { revenue: 0, cost: 0, profit: 0 };
        }
        yearlyData[year].revenue += orderRevenue;
        yearlyData[year].cost += orderCost;
        yearlyData[year].profit += (orderRevenue - orderCost);
    });

    const totalProfit = totalRevenue - totalCost;

    res.json({
        totalRevenue,
        totalCost,
        totalProfit,
        monthlyData,
        yearlyData
    });
};
// @desc    Dispatch order to courier
// @route   POST /api/orders/:id/dispatch
// @access  Private/Admin
const dispatchOrder = async (req, res) => {
    const { courier } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (courier === 'Steadfast') {
        try {
            const steadfastPayload = {
                invoice: order._id.toString().substring(0, 8).toUpperCase(),
                recipient_name: order.guestName || (order.user ? order.user.name : 'Customer'),
                recipient_phone: order.guestPhone || '01000000000',
                recipient_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
                cod_amount: order.totalPrice,
                weight: order.totalWeight || 0.5,
                item_description: `Weight: ${order.totalWeight || 0.5}kg`,
                note: ""
            };

            if (process.env.STEADFAST_API_KEY && process.env.STEADFAST_SECRET_KEY) {
                const response = await fetch(`${process.env.STEADFAST_BASE_URL || 'https://api.steadfast.com.bd/v1'}/create_order`, {
                    method: 'POST',
                    headers: {
                        'Api-Key': process.env.STEADFAST_API_KEY,
                        'Secret-Key': process.env.STEADFAST_SECRET_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(steadfastPayload)
                });

                const data = await response.json();
                
                if (data.status === 200 || data.status === 'success') {
                    order.courierService = 'Steadfast';
                    order.trackingCode = data.consignment?.tracking_code || 'N/A';
                    order.consignmentId = data.consignment?.consignment_id || 'N/A';
                    order.status = 'Processing';
                } else {
                    res.status(400);
                    throw new Error(`Steadfast Error: ${JSON.stringify(data)}`);
                }
            } else {
                 // Mock behavior for testing without credentials
                 order.courierService = 'Steadfast';
                 order.trackingCode = 'STDF-' + Date.now();
                 order.status = 'Processing';
            }
            
            const updatedOrder = await order.save();
            res.json(updatedOrder);

        } catch (error) {
            console.error('Steadfast Dispatch Error:', error);
            res.status(500);
            throw new Error(error.message || 'Failed to dispatch to Steadfast');
        }
    } else if (courier === 'Pathao') {
        try {
            if (process.env.PATHAO_CLIENT_ID && process.env.PATHAO_CLIENT_SECRET) {
                 // Authentication
                 const authResponse = await fetch(`${process.env.PATHAO_BASE_URL || 'https://api-hermes.pathao.com'}/aladdin/api/v1/issue-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_id: process.env.PATHAO_CLIENT_ID,
                        client_secret: process.env.PATHAO_CLIENT_SECRET,
                        username: process.env.PATHAO_USERNAME,
                        password: process.env.PATHAO_PASSWORD,
                        grant_type: 'password'
                    })
                 });
                 const authData = await authResponse.json();
                 
                 if (authData.access_token) {
                     // Create Order
                     const pathaoPayload = {
                        store_id: process.env.PATHAO_STORE_ID,
                        merchant_order_id: order._id.toString(),
                        recipient_name: order.guestName || (order.user ? order.user.name : 'Customer'),
                        recipient_phone: order.guestPhone || '01000000000',
                        recipient_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
                        recipient_city: order.shippingAddress.city, // Need city ID normally, assuming city name for now or mock
                        amount_to_collect: order.totalPrice,
                        item_type: 2, // Parcel
                        item_quantity: 1,
                        item_weight: 1,
                     };
                     
                     const orderResponse = await fetch(`${process.env.PATHAO_BASE_URL || 'https://api-hermes.pathao.com'}/aladdin/api/v1/orders`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authData.access_token}`
                        },
                        body: JSON.stringify(pathaoPayload)
                     });
                     
                     const orderData = await orderResponse.json();
                     if (orderData.code === 200 || orderData.type === 'success') {
                         order.courierService = 'Pathao';
                         order.trackingCode = orderData.data?.consignment_id || 'N/A';
                         order.status = 'Processing';
                     } else {
                         res.status(400);
                         throw new Error(`Pathao Error: ${JSON.stringify(orderData)}`);
                     }
                 } else {
                     res.status(401);
                     throw new Error('Pathao Authentication failed');
                 }
            } else {
                 // Mock behavior for testing without credentials
                 order.courierService = 'Pathao';
                 order.trackingCode = 'PTH-' + Date.now();
                 order.status = 'Processing';
            }
            
            const updatedOrder = await order.save();
            res.json(updatedOrder);

        } catch (error) {
            console.error('Pathao Dispatch Error:', error);
            res.status(500);
            throw new Error(error.message || 'Failed to dispatch to Pathao');
        }
    } else {
        res.status(400);
        throw new Error('Invalid courier service');
    }
};

// Maps Steadfast's delivery_status values to our internal order status enum.
const STEADFAST_STATUS_MAP = {
    pending: 'Processing',
    delivered_approval_pending: 'On the way',
    partial_delivered_approval_pending: 'On the way',
    cancelled_approval_pending: 'On the way',
    unknown_approval_pending: 'On the way',
    delivered: 'Delivered',
    partial_delivered: 'Delivered',
    cancelled: 'Cancelled',
    hold: 'On the way',
    in_review: 'On the way',
    unknown: 'On the way',
};

const applyCourierStatus = async (order, courierStatus) => {
    const mappedStatus = STEADFAST_STATUS_MAP[courierStatus];
    if (!mappedStatus || order.status === mappedStatus) return order;

    const oldStatus = order.status;
    order.status = mappedStatus;

    if (mappedStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = order.deliveredAt || Date.now();
    }

    if (mappedStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock += item.qty;
                await product.save();
            }
        }
    }

    return order.save();
};

// @desc    Receive delivery status push notifications from Steadfast
// @route   POST /api/orders/steadfast/webhook
// @access  Public (verified via shared secret)
const steadfastWebhook = async (req, res) => {
    if (process.env.STEADFAST_WEBHOOK_SECRET) {
        const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
        if (providedSecret !== process.env.STEADFAST_WEBHOOK_SECRET) {
            return res.status(401).json({ message: 'Invalid webhook secret' });
        }
    }

    const { consignment_id, invoice, tracking_code, delivery_status, status } = req.body;
    const courierStatus = delivery_status || status;

    const order = await Order.findOne({
        $or: [
            { consignmentId: consignment_id?.toString() },
            { trackingCode: tracking_code },
        ],
    });

    if (!order) {
        console.warn('Steadfast webhook: no matching order for', { consignment_id, invoice, tracking_code });
        return res.status(200).json({ message: 'No matching order, ignored' });
    }

    await applyCourierStatus(order, courierStatus);
    res.status(200).json({ message: 'Status updated' });
};

// @desc    Manually pull the latest status for an order from Steadfast
// @route   GET /api/orders/:id/track
// @access  Private/Admin
const trackOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.courierService !== 'Steadfast' || !order.consignmentId) {
        res.status(400);
        throw new Error('This order was not dispatched via Steadfast');
    }

    if (!process.env.STEADFAST_API_KEY || !process.env.STEADFAST_SECRET_KEY) {
        res.status(400);
        throw new Error('Steadfast API credentials are not configured');
    }

    const response = await fetch(`${process.env.STEADFAST_BASE_URL || 'https://api.steadfast.com.bd/v1'}/status_by_cid/${order.consignmentId}`, {
        headers: {
            'Api-Key': process.env.STEADFAST_API_KEY,
            'Secret-Key': process.env.STEADFAST_SECRET_KEY,
        },
    });

    const data = await response.json();

    if (!data.delivery_status) {
        res.status(502);
        throw new Error('Unexpected response from Steadfast');
    }

    const updatedOrder = await applyCourierStatus(order, data.delivery_status);
    res.json(updatedOrder);
};

module.exports = { addOrderItems, getOrderById, updateOrderToPaid, updateOrderStatus, updateOrderDetails, updateOrderPaymentStatus, updateOrderAmount, getMyOrders, getOrders, deleteOrder, getRevenueStats, dispatchOrder, steadfastWebhook, trackOrder };
