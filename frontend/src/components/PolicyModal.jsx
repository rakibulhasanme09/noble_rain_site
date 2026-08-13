import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TITLES = {
    shipping: 'Shipping Policy',
    returns: 'Return & Refund Policy',
};

const PolicyModal = ({ isOpen, onClose, type = 'shipping' }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        setLoading(true);

        axios.get('/api/settings/policies')
            .then(({ data }) => {
                if (cancelled) return;
                setText(type === 'returns' ? data.returnPolicy : data.shippingPolicy);
            })
            .catch(() => {
                if (!cancelled) setText('Unable to load this policy right now. Please try again later.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [isOpen, type]);

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{TITLES[type] || TITLES.shipping}</h2>
                    <button onClick={onClose} style={styles.closeBtn} aria-label="Close">&times;</button>
                </div>
                <div style={styles.body}>
                    {loading ? (
                        <p style={styles.paragraph}>Loading...</p>
                    ) : (
                        text.split('\n').filter(Boolean).map((para, i) => (
                            <p key={i} style={styles.paragraph}>{para}</p>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
    },
    modal: {
        backgroundColor: 'var(--color-bg-main)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 1.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
    },
    title: {
        fontSize: '1.3rem',
    },
    closeBtn: {
        fontSize: '1.5rem',
        lineHeight: 1,
        color: 'var(--color-text-muted)',
        padding: '0.25rem 0.5rem',
    },
    body: {
        padding: '1.5rem',
    },
    paragraph: {
        marginBottom: '1rem',
        color: 'var(--color-text-muted)',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
    },
};

export default PolicyModal;
