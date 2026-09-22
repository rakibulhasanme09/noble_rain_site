const PDFDocument = require('pdfkit');

const buildInvoicePdf = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const orderId = order._id.toString().substring(0, 8).toUpperCase();

        // Top Header Row
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#000').text('Noble Rain', 50, 50);
        
        doc.fontSize(28).font('Helvetica-Bold').fillColor('#333').text('INVOICE', 350, 48, { width: 195, align: 'right' });
        
        // Address info under Noble Rain
        doc.fontSize(10).font('Helvetica').fillColor('#555')
            .text('Basundhara R/A, Block C, Dhaka, Bangladesh, 1212', 50, 78)
            .text('Email: info.noblerain@gmail.com | Phone: +880 1886-120751', 50, 93);
            
        // Order Info under INVOICE
        doc.fontSize(10).font('Helvetica').fillColor('#000')
            .text(`Order ID: ${orderId}`, 350, 82, { width: 195, align: 'right' })
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 97, { width: 195, align: 'right' });

        // Line separator
        doc.moveTo(50, 120).lineTo(545, 120).lineWidth(2).strokeColor('#333').stroke();
        doc.lineWidth(1); // reset

        // Billed To & Shipped To Row
        const billingY = 140;
        doc.fontSize(12).font('Helvetica-Bold').text('Billed To:', 50, billingY);
        doc.fontSize(10).font('Helvetica')
            .text(`Name: ${order.guestName || (order.user && order.user.name) || 'Guest'}`, 50, billingY + 20)
            .text(`Email: ${order.guestEmail || (order.user && order.user.email) || 'N/A'}`, 50, billingY + 35)
            .text(`Phone: ${order.guestPhone || 'N/A'}`, 50, billingY + 50);

        doc.fontSize(12).font('Helvetica-Bold').text('Shipped To:', 300, billingY);
        doc.fontSize(10).font('Helvetica')
            .text(order.shippingAddress.address, 300, billingY + 20)
            .text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode || ''}`, 300, billingY + 35)
            .text(order.shippingAddress.country, 300, billingY + 50);

        // Table Header
        const tableTop = 230;
        doc.rect(50, tableTop, 495, 25).fill('#333');
        doc.fillColor('#fff').font('Helvetica-Bold').fontSize(10)
            .text('Item', 60, tableTop + 8, { width: 230 })
            .text('Quantity', 300, tableTop + 8, { width: 60 })
            .text('Price', 380, tableTop + 8, { width: 70 })
            .text('Total', 460, tableTop + 8, { width: 70 });

        // Table Rows
        let rowY = tableTop + 30;
        doc.fillColor('#000').font('Helvetica');
        order.orderItems.forEach((item) => {
            doc.text(item.name, 60, rowY, { width: 230 })
                .text(String(item.qty), 300, rowY, { width: 60 })
                .text(`Tk ${item.price}`, 380, rowY, { width: 70 })
                .text(`Tk ${(item.qty * item.price).toFixed(2)}`, 460, rowY, { width: 70 });
            rowY += 20;
            doc.moveTo(50, rowY - 5).lineTo(545, rowY - 5).strokeColor('#eee').stroke();
        });

        // Summary Section
        const summaryY = rowY + 15;
        const discountAmount = order.discountAmount || 0;
        
        // Payment Details (Left)
        doc.fontSize(11).font('Helvetica-Bold').text('Payment Details:', 50, summaryY);
        doc.moveTo(50, summaryY + 15).lineTo(250, summaryY + 15).strokeColor('#ccc').stroke();
        
        doc.fontSize(10).font('Helvetica')
            .text(`Method: ${order.paymentMethod}`, 50, summaryY + 25)
            .text(`Status: ${order.isPaid ? 'Paid' : 'Unpaid'}`, 50, summaryY + 40);
            
        let currentY = summaryY + 55;
        if (order.isPaid && order.paidAt) {
            doc.text(`Paid On: ${new Date(order.paidAt).toLocaleString()}`, 50, currentY);
            currentY += 15;
        }
        if (order.couponCode) {
            doc.text(`Coupon Applied: ${order.couponCode}`, 50, currentY);
        }

        // Totals (Right)
        let rightY = summaryY + 5;
        doc.text(`Subtotal: Tk ${order.itemsPrice.toFixed(2)}`, 350, rightY, { width: 195, align: 'right' });
        rightY += 20;
        
        doc.text(`Shipping: Tk ${order.shippingPrice.toFixed(2)}`, 350, rightY, { width: 195, align: 'right' });
        rightY += 20;
        
        if (discountAmount > 0) {
            doc.fillColor('#28a745').text(`Discount: -Tk ${discountAmount.toFixed(2)}`, 350, rightY, { width: 195, align: 'right' });
            doc.fillColor('#000'); // reset
            rightY += 20;
        }
        
        doc.moveTo(350, rightY - 5).lineTo(545, rightY - 5).strokeColor('#333').lineWidth(2).stroke();
        doc.lineWidth(1);
        doc.fontSize(14).font('Helvetica-Bold').text(`Total: Tk ${order.totalPrice.toFixed(2)}`, 350, rightY, { width: 195, align: 'right' });

        doc.end();
    });
};

module.exports = { buildInvoicePdf };
