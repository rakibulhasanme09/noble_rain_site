const PDFDocument = require('pdfkit');

// Builds a simple PDF invoice buffer for an order, mirroring the sections of
// frontend/src/components/InvoiceDocument.jsx (not pixel-identical, just the
// same information: header, billed-to/shipped-to, item table, totals).
const buildInvoicePdf = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const orderId = order._id.toString().substring(0, 8).toUpperCase();

        doc.fontSize(20).text('Noble Rain', { continued: false });
        doc.fontSize(10).fillColor('#555')
            .text('Basundhara R/A, Block C, Dhaka, Bangladesh, 1212')
            .text('Email: info.noblerain@gmail.com | Phone: +880 1886-120751');
        doc.moveDown();

        doc.fillColor('#000').fontSize(16).text('INVOICE', { align: 'right' });
        doc.fontSize(10)
            .text(`Order ID: ${orderId}`, { align: 'right' })
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(1.5);

        doc.fontSize(12).fillColor('#000').text('Billed To:', { underline: true });
        doc.fontSize(10)
            .text(`Name: ${order.guestName || (order.user && order.user.name) || 'Guest'}`)
            .text(`Email: ${order.guestEmail || (order.user && order.user.email) || 'N/A'}`)
            .text(`Phone: ${order.guestPhone || 'N/A'}`);
        doc.moveDown();

        doc.fontSize(12).text('Shipped To:', { underline: true });
        doc.fontSize(10)
            .text(order.shippingAddress.address)
            .text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode || ''}`)
            .text(order.shippingAddress.country);
        doc.moveDown(1.5);

        const tableTop = doc.y;
        doc.fontSize(11).fillColor('#fff');
        doc.rect(50, tableTop, 495, 20).fill('#333');
        doc.fillColor('#fff')
            .text('Item', 58, tableTop + 5, { width: 250 })
            .text('Qty', 320, tableTop + 5, { width: 60 })
            .text('Price', 390, tableTop + 5, { width: 70 })
            .text('Total', 470, tableTop + 5, { width: 70 });

        let rowY = tableTop + 25;
        doc.fillColor('#000').fontSize(10);
        order.orderItems.forEach((item) => {
            doc.text(item.name, 58, rowY, { width: 250 })
                .text(String(item.qty), 320, rowY, { width: 60 })
                .text(`Tk ${item.price}`, 390, rowY, { width: 70 })
                .text(`Tk ${(item.qty * item.price).toFixed(2)}`, 470, rowY, { width: 70 });
            rowY += 20;
        });

        doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#ccc').stroke();
        rowY += 15;

        const discountAmount = order.discountAmount || 0;
        doc.fontSize(10)
            .text(`Subtotal: Tk ${order.itemsPrice.toFixed(2)}`, 350, rowY, { width: 195, align: 'right' });
        rowY += 15;
        doc.text(`Shipping: Tk ${order.shippingPrice.toFixed(2)}`, 350, rowY, { width: 195, align: 'right' });
        rowY += 15;
        if (discountAmount > 0) {
            doc.text(`Discount: -Tk ${discountAmount.toFixed(2)}`, 350, rowY, { width: 195, align: 'right' });
            rowY += 15;
        }
        doc.fontSize(13).text(`Total: Tk ${order.totalPrice.toFixed(2)}`, 350, rowY, { width: 195, align: 'right' });

        doc.end();
    });
};

module.exports = { buildInvoicePdf };
