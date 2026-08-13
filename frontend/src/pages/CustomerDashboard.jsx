import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const CustomerDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login?redirect=dashboard');
            return;
        }

        const fetchOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, authLoading, navigate]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Delivered': return styles.statusDelivered;
            case 'On the way': return styles.statusOnTheWay;
            case 'Processing': return styles.statusProcessing;
            default: return styles.statusPending;
        }
    };

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Order Status</h1>
            </div>
            
            <div style={styles.content}>
                <h2 style={styles.sectionTitle}>Order History & Tracking</h2>
                
                {loading ? (
                    <p>Loading your orders...</p>
                ) : orders.length === 0 ? (
                    <p>You haven't placed any orders yet.</p>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>ORDER ID</th>
                                    <th>ITEM</th>
                                    <th>DATE</th>
                                    <th>TOTAL</th>
                                    <th>PAYMENT</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td style={{fontWeight: '500'}}>{order._id.substring(0,8).toUpperCase()}</td>
                                        <td>
                                            {order.orderItems && order.orderItems.length > 0 && (
                                                <img src={order.orderItems[0].image} alt="Item" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} />
                                            )}
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>৳{order.totalPrice}</td>
                                        <td>{order.paymentMethod} ({order.isPaid ? 'Paid' : 'Unpaid'})</td>
                                        <td>
                                            <span style={{...styles.badge, ...getStatusStyle(order.status || 'Pending')}}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        padding: '3rem 1rem',
        minHeight: '80vh',
    },
    header: {
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '1rem',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
    },
    content: {
        backgroundColor: 'var(--color-bg-main)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        border: '1px solid var(--color-border)',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    badge: {
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    statusPending: {
        backgroundColor: '#fff3cd',
        color: '#856404',
    },
    statusProcessing: {
        backgroundColor: '#cce5ff',
        color: '#004085',
    },
    statusOnTheWay: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    statusDelivered: {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
    }
};

export default CustomerDashboard;
