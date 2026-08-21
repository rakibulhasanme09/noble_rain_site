const { google } = require('googleapis');
const Order = require('../models/Order');
const { getGoogleOAuth2Client } = require('./googleClient');

// Builds a sales report as a new Google Sheet in GOOGLE_SENDER_EMAIL's Drive,
// one row per sold item across delivered orders in [startDate, endDate].
const createSalesReport = async (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
        status: 'Delivered',
        deliveredAt: { $gte: start, $lte: end },
    });

    const rows = [['Product Name', 'Customer Name', 'Customer Phone', 'Selling Date', 'Selling Time', 'Selling Price', 'Total Cost', 'Benefit']];

    let totalSellingPrice = 0;
    let totalCost = 0;
    let totalBenefit = 0;

    orders.forEach((order) => {
        const soldAt = new Date(order.deliveredAt);
        const customerName = order.guestName || 'N/A';
        const customerPhone = order.guestPhone || 'N/A';

        order.orderItems.forEach((item) => {
            const itemSellingPrice = item.price * item.qty;
            const itemCost = (item.costPrice || 0) * item.qty;
            const benefit = itemSellingPrice - itemCost;

            totalSellingPrice += itemSellingPrice;
            totalCost += itemCost;
            totalBenefit += benefit;

            rows.push([
                item.name,
                customerName,
                customerPhone,
                soldAt.toLocaleDateString(),
                soldAt.toLocaleTimeString(),
                itemSellingPrice,
                itemCost,
                benefit,
            ]);
        });
    });

    rows.push(['', '', '', '', 'Total:', totalSellingPrice, totalCost, totalBenefit]);

    const auth = getGoogleOAuth2Client();
    const sheets = google.sheets({ version: 'v4', auth });

    const formatDate = (d) => d.toISOString().split('T')[0];
    const { data: spreadsheet } = await sheets.spreadsheets.create({
        requestBody: {
            properties: { title: `Noble Rain Sales Report - ${formatDate(start)} to ${formatDate(end)}` },
        },
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet.spreadsheetId,
        range: 'A1',
        valueInputOption: 'RAW',
        requestBody: { values: rows },
    });

    return spreadsheet.spreadsheetUrl;
};

module.exports = { createSalesReport };
