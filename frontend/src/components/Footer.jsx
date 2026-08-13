import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PolicyModal from './PolicyModal';

const FACEBOOK_URL = 'https://www.facebook.com/share/1Dc3xYXb5c/?mibextid=wwXIfr';
const INSTAGRAM_URL = 'https://www.instagram.com/noblerain_style_in_motion?igsh=ZjhhYTNmeWp6cnN2&utm_source=qr';
const WHATSAPP_NUMBER = '8801886120751';

const Footer = () => {
    const [policyModal, setPolicyModal] = useState({ isOpen: false, type: 'shipping' });

    const openPolicy = (type) => setPolicyModal({ isOpen: true, type });
    const closePolicy = () => setPolicyModal((prev) => ({ ...prev, isOpen: false }));

    return (
        <footer style={styles.footer}>
            <div className="container">
                <div style={styles.grid}>
                    <div style={styles.brandCol}>
                        <img src="/noble_rain_logo.jpg" alt="Noble Rain" style={styles.logo} />
                        <p style={styles.tagline}>
                            Premium leather goods crafted for everyday elegance.
                        </p>
                        <div style={styles.socials}>
                            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook" style={styles.iconLink}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>
                            </a>
                            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" style={styles.iconLink}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.29-1.39a9.87 9.87 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm5.8 14.03c-.24.68-1.4 1.32-1.93 1.36-.53.05-1.03.24-3.44-.72-2.9-1.16-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1.01-2.4.27-.28.58-.35.78-.35.19 0 .39 0 .55.01.18.01.42-.07.66.5.24.58.83 2 .9 2.14.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.2.71-.83.9-1.11.19-.29.38-.24.63-.15.26.1 1.65.78 1.93.92.29.15.48.22.55.34.07.13.07.72-.17 1.4z"/></svg>
                            </a>
                            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" style={styles.iconLink}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                            </a>
                        </div>
                    </div>

                    <div style={styles.col}>
                        <h4 style={styles.colTitle}>Quick Links</h4>
                        <ul style={styles.linkList}>
                            <li><Link to="/" style={styles.link}>Shop</Link></li>
                            <li><Link to="/cart" style={styles.link}>Cart</Link></li>
                            <li><Link to="/dashboard" style={styles.link}>My Orders</Link></li>
                            <li><Link to="/login" style={styles.link}>Login</Link></li>
                        </ul>
                    </div>

                    <div style={styles.col}>
                        <h4 style={styles.colTitle}>Customer Service</h4>
                        <ul style={styles.linkList}>
                            <li><button style={styles.linkBtn} onClick={() => openPolicy('shipping')}>Shipping Policy</button></li>
                            <li><button style={styles.linkBtn} onClick={() => openPolicy('returns')}>Return &amp; Refund Policy</button></li>
                            <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={styles.link}>Order via WhatsApp</a></li>
                        </ul>
                    </div>

                    <div style={styles.col}>
                        <h4 style={styles.colTitle}>Contact</h4>
                        <ul style={styles.linkList}>
                            <li style={styles.contactItem}>Basundhara R/A, Block C, Dhaka, Bangladesh, 1212</li>
                            <li style={styles.contactItem}>
                                <a href="mailto:info.noblerain@gmail.com" style={styles.link}>info.noblerain@gmail.com</a>
                            </li>
                            <li style={styles.contactItem}>
                                <a href="tel:+8801886120751" style={styles.link}>+880 1886-120751</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} Noble Rain. All rights reserved.</p>
                </div>
            </div>

            <PolicyModal isOpen={policyModal.isOpen} type={policyModal.type} onClose={closePolicy} />
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-main)',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
        padding: '3.5rem 0 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
        gap: '2.5rem',
        paddingBottom: '2.5rem',
    },
    brandCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    logo: {
        height: '38px',
        objectFit: 'contain',
        mixBlendMode: 'multiply',
        width: 'fit-content',
    },
    tagline: {
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
        lineHeight: 1.6,
        maxWidth: '260px',
    },
    socials: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.25rem',
    },
    iconLink: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-bg-main)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-main)',
    },
    col: {
        display: 'flex',
        flexDirection: 'column',
    },
    colTitle: {
        fontSize: '0.95rem',
        marginBottom: '1.2rem',
        letterSpacing: '0.02em',
    },
    linkList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    link: {
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
    },
    linkBtn: {
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
        textAlign: 'left',
        padding: 0,
    },
    contactItem: {
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
        lineHeight: 1.6,
    },
    bottomBar: {
        borderTop: '1px solid var(--color-border)',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
    },
};

export default Footer;
