import React, { forwardRef } from 'react';

const InvoiceDocument = forwardRef(({ order }, ref) => {
    const discountAmount = order.discountAmount || 0;

    return (
        <div ref={ref} style={styles.invoiceBox} className="invoice-doc">
            <style>{invoiceResponsiveCSS}</style>
            <div style={styles.header} className="invoice-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/noble_rain_logo.jpg" alt="Noble Rain" style={styles.logo} />
                    <div>
                        <h1 style={styles.storeName} className="invoice-store-name">Noble Rain</h1>
                        <p>Basundhara R/A, Block C, Dhaka, Bangladesh, 1212</p>
                        <p>Email: info.noblerain@gmail.com | Phone: +880 1886-120751</p>
                    </div>
                </div>
                <div style={styles.titleBox} className="invoice-title-box">
                    <h2 style={styles.invoiceTitle} className="invoice-title">INVOICE</h2>
                    <p><strong>Order ID:</strong> {order._id.substring(0, 8).toUpperCase()}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div style={styles.customerInfo} className="invoice-customer-info">
                <div style={styles.infoBlock}>
                    <h3 style={styles.infoTitle}>Billed To:</h3>
                    <p><strong>Name:</strong> {order.user?.name || order.guestName || 'Guest'}</p>
                    <p><strong>Email:</strong> {order.user?.email || order.guestEmail || 'N/A'}</p>
                    <p><strong>Phone:</strong> {order.guestPhone || 'N/A'}</p>
                </div>
                <div style={styles.infoBlock}>
                    <h3 style={styles.infoTitle}>Shipped To:</h3>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                </div>
            </div>

            <div className="invoice-table-wrapper" style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Item</th>
                            <th style={styles.th}>Quantity</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td style={styles.td}>{item.name}</td>
                                <td style={styles.td}>{item.qty}</td>
                                <td style={styles.td}>৳{item.price}</td>
                                <td style={styles.td}>৳{(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.summaryContainer} className="invoice-summary">
                <div style={styles.paymentInfo}>
                    <h3 style={styles.infoTitle}>Payment Details:</h3>
                    <p><strong>Method:</strong> {order.paymentMethod}</p>
                    <p>
                        <strong>Status:</strong>{' '}
                        <span style={{ color: order.isPaid ? 'green' : 'red', fontWeight: 'bold' }}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                    </p>
                    {order.isPaid && order.paidAt && (
                        <p><strong>Paid On:</strong> {new Date(order.paidAt).toLocaleString()}</p>
                    )}
                    {order.couponCode && (
                        <p><strong>Coupon Applied:</strong> {order.couponCode}</p>
                    )}
                </div>
                <div style={styles.totals} className="invoice-totals">
                    <div style={styles.totalRow}>
                        <span>Subtotal:</span>
                        <span>৳{order.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div style={styles.totalRow}>
                        <span>Shipping:</span>
                        <span>৳{order.shippingPrice.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div style={{ ...styles.totalRow, color: '#28a745' }}>
                            <span>Discount:</span>
                            <span>-৳{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{ ...styles.totalRow, ...styles.grandTotal }}>
                        <span>Total:</span>
                        <span>৳{order.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

const invoiceResponsiveCSS = `
@media (max-width: 640px) {
    .invoice-doc { padding: 1.25rem !important; }
    .invoice-header { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
    .invoice-title-box { text-align: left !important; }
    .invoice-store-name { font-size: 1.4rem !important; }
    .invoice-title { font-size: 1.6rem !important; }
    .invoice-customer-info { flex-direction: column; gap: 1.5rem; }
    .invoice-summary { flex-direction: column; gap: 1.5rem; }
    .invoice-totals { width: 100% !important; }
}
`;

const styles = {
    invoiceBox: {
        width: '100%',
        maxWidth: '800px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        color: '#111',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '2px solid #333',
        paddingBottom: '1rem',
        marginBottom: '2rem',
    },
    logo: {
        height: '48px',
        objectFit: 'contain',
        mixBlendMode: 'multiply',
    },
    storeName: {
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: '0 0 0.5rem 0',
    },
    titleBox: {
        textAlign: 'right',
    },
    invoiceTitle: {
        fontSize: '2.5rem',
        color: '#333',
        margin: '0 0 0.5rem 0',
        letterSpacing: '2px',
    },
    customerInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem',
    },
    infoBlock: {
        flex: 1,
    },
    infoTitle: {
        fontSize: '1.2rem',
        borderBottom: '1px solid #ccc',
        paddingBottom: '0.5rem',
        marginBottom: '0.5rem',
        color: '#555',
    },
    tableWrapper: {
        width: '100%',
        overflowX: 'auto',
        marginBottom: '2rem',
    },
    table: {
        width: '100%',
        minWidth: '480px',
        borderCollapse: 'collapse',
    },
    th: {
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px',
        textAlign: 'left',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #eee',
    },
    summaryContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    paymentInfo: {
        flex: 1,
        paddingRight: '2rem',
    },
    totals: {
        width: '300px',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #eee',
    },
    grandTotal: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        borderBottom: 'none',
        borderTop: '2px solid #333',
        paddingTop: '0.5rem',
    },
};

export default InvoiceDocument;
