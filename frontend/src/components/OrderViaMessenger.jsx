import React from 'react';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/share/1EvcRU5cvU/?mibextid=wwXIfr';
const WHATSAPP_NUMBER = '8801886120751';

const OrderViaMessenger = ({ product }) => {
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = product
        ? `Hi! I'd like to order "${product.name}" (${productUrl})`
        : "Hi! I'd like to place an order.";

    const messengerUrl = FACEBOOK_PAGE_URL;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    return (
        <div style={styles.row}>
            <a href={messengerUrl} target="_blank" rel="noreferrer" style={{ ...styles.btn, ...styles.messenger }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                    <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.91 1.44 5.5 3.7 7.19V22l3.38-1.86c.9.25 1.87.38 2.92.38 5.52 0 10-4.15 10-9.27C22 6.15 17.52 2 12 2zm1.02 12.49-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"/>
                </svg>
                Order via Messenger
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ ...styles.btn, ...styles.whatsapp }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.29-1.39a9.87 9.87 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2z"/>
                </svg>
                Order via WhatsApp
            </a>
        </div>
    );
};

const styles = {
    row: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '1rem',
        marginBottom: '2rem',
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minWidth: '200px',
        padding: '0.9rem 1.2rem',
        borderRadius: '6px',
        fontWeight: '600',
        color: '#fff',
    },
    messenger: {
        background: 'linear-gradient(90deg, #00B2FF, #006AFF)',
    },
    whatsapp: {
        backgroundColor: '#25D366',
    },
};

export default OrderViaMessenger;
