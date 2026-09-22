const otpEmail = (name, code) => ({
    subject: 'Verify your Noble Rain account',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Hi ${name},</h2>
            <p>Use the code below to verify your Noble Rain account. It expires in 10 minutes.</p>
            <p style="font-size: 2rem; font-weight: bold; letter-spacing: 0.3em; text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 8px;">${code}</p>
            <p>If you didn't create a Noble Rain account, you can ignore this email.</p>
        </div>
    `,
});

const passwordResetEmail = (name, code) => ({
    subject: 'Reset your Noble Rain password',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Hi ${name},</h2>
            <p>Use the code below to reset your Noble Rain password. It expires in 10 minutes.</p>
            <p style="font-size: 2rem; font-weight: bold; letter-spacing: 0.3em; text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 8px;">${code}</p>
            <p>If you didn't request a password reset, you can safely ignore this email &mdash; your password will not be changed.</p>
        </div>
    `,
});

const welcomeEmail = (name) => ({
    subject: 'Welcome to Noble Rain!',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for verifying your account and joining Noble Rain. We're glad to have you with us.</p>
            <p>Browse our latest collection and enjoy shopping!</p>
        </div>
    `,
});

const orderConfirmationEmail = (order) => ({
    subject: `Your Noble Rain order ${order._id.toString().substring(0, 8).toUpperCase()} is confirmed`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
            <h2>Thank you for your order, ${order.guestName || (order.user && order.user.name) || 'there'}!</h2>
            <p>Order ID: <strong>${order._id.toString().substring(0, 8).toUpperCase()}</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background: #333; color: #fff;">
                        <th style="padding: 8px; text-align: left;">Item</th>
                        <th style="padding: 8px; text-align: left;">Qty</th>
                        <th style="padding: 8px; text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(item => `
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.qty}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">৳${item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 1rem;">
                <p style="margin: 0.2rem 0;">Subtotal: ৳${order.itemsPrice.toFixed(2)}</p>
                <p style="margin: 0.2rem 0;">Shipping: ৳${order.shippingPrice.toFixed(2)}</p>
                ${(order.discountAmount || 0) > 0 ? `<p style="margin: 0.2rem 0; color: #28a745;">Discount: -৳${order.discountAmount.toFixed(2)}</p>` : ''}
                <p style="font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0;">Total: ৳${order.totalPrice.toFixed(2)}</p>
            </div>
            <p>Your detailed invoice is attached as a PDF. We'll notify you as your order ships.</p>
        </div>
    `,
});

module.exports = { otpEmail, welcomeEmail, orderConfirmationEmail, passwordResetEmail };
