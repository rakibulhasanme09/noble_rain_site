import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import InvoiceDocument from '../components/InvoiceDocument';

const InvoicePage = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const invoiceRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
                setLoading(false);
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchOrder();
        }
    }, [id, user, authLoading, navigate]);

    if (authLoading || loading) return <div style={styles.center}>Loading invoice...</div>;
    if (error) return <div style={styles.center}>Error: {error}</div>;
    if (!order) return null;

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        const opt = {
            margin:       0.5,
            filename:     `invoice_${order._id.substring(0, 8).toUpperCase()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div style={styles.container}>
            <div className="no-print" style={styles.actionContainer}>
                <button className="btn btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
                <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => window.print()}>Print Invoice</button>
                <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => navigate(-1)}>Back</button>
            </div>

            <InvoiceDocument order={order} ref={invoiceRef} />

            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .main-content, .container {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    div[style*="max-width: 800px"] * {
                        visibility: visible;
                    }
                    div[style*="max-width: 800px"] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem 1rem',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    actionContainer: {
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem',
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        fontSize: '1.5rem',
    },
};

export default InvoicePage;
