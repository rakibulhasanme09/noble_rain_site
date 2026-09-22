import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { AuthContext } from '../context/AuthContext';
import InvoiceDocument from '../components/InvoiceDocument';

const OrderConfirmationPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);

    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState(null);
    const invoiceRef = useRef(null);

    useEffect(() => {
        if (location.state?.order) {
            sessionStorage.setItem(`order_${id}`, JSON.stringify(location.state.order));
            return;
        }

        const cached = sessionStorage.getItem(`order_${id}`);
        if (cached) {
            setOrder(JSON.parse(cached));
            setLoading(false);
            return;
        }

        if (authLoading) return;

        if (!user) {
            setLoading(false);
            setError('not-found');
            return;
        }

        const fetchOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'not-found');
            }
            setLoading(false);
        };

        fetchOrder();
    }, [id, location.state, user, authLoading]);

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        const opt = {
            margin: 0.5,
            filename: `invoice_${order._id.substring(0, 8).toUpperCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (loading || authLoading) {
        return <div className="container" style={styles.center}>Loading your order...</div>;
    }

    if (!order) {
        return (
            <div className="container" style={styles.center}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem' }}>We couldn't find that order confirmation here.</p>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        {user ? 'Check your orders in the dashboard.' : 'Log in to view your order history.'}
                    </p>
                    <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary">
                        {user ? 'Go to My Orders' : 'Log In'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div className="no-print" style={styles.successBanner}>
                <div style={styles.checkCircle}>✓</div>
                <h1 style={styles.title}>Thank you! Your order has been placed.</h1>
                <p style={styles.subtitle}>
                    Order <strong>#{order._id.substring(0, 8).toUpperCase()}</strong> — we'll notify you as it progresses.
                </p>
                <div style={styles.actionContainer}>
                    <button className="btn btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
                    <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => window.print()}>Print Invoice</button>
                    <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => navigate('/')}>Continue Shopping</button>
                </div>
            </div>

            <InvoiceDocument order={order} ref={invoiceRef} />

            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    .no-print, header, footer { display: none !important; }
                    .main-content { padding: 0 !important; margin: 0 !important; }
                    div[style*="max-width: 800px"] * { visibility: visible; }
                    div[style*="max-width: 800px"] {
                        position: absolute; left: 0; top: 0; width: 100%;
                        box-shadow: none !important; border: none !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    page: {
        padding: '3rem 1rem',
        minHeight: '80vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    center: {
        padding: '5rem 1rem',
        textAlign: 'center',
        minHeight: '60vh',
    },
    successBanner: {
        textAlign: 'center',
        marginBottom: '2rem',
        width: '100%',
        maxWidth: '800px',
    },
    checkCircle: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-success)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.8rem',
        margin: '0 auto 1rem',
    },
    title: {
        fontSize: '1.8rem',
        marginBottom: '0.5rem',
        color: '#111',
    },
    subtitle: {
        color: '#666',
    },
    actionContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1.5rem',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
};

export default OrderConfirmationPage;
