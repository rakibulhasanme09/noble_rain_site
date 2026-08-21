import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChangePasswordForm from '../components/ChangePasswordForm';

const TABS = ['My Profile', 'Change Password', 'My Orders', 'Wishlist'];

const CustomerDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('My Profile');

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login?redirect=dashboard');
        }
    }, [user, authLoading, navigate]);

    if (!user) return null;

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Account</h1>
            </div>

            <div style={styles.tabBar}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={styles.content}>
                {activeTab === 'My Profile' && <ProfileTab />}
                {activeTab === 'Change Password' && <ChangePasswordForm />}
                {activeTab === 'My Orders' && <OrdersTab user={user} />}
                {activeTab === 'Wishlist' && <WishlistTab user={user} />}
            </div>
        </div>
    );
};

const ProfileTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Bangladesh',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/users/profile', config);
                setForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.defaultShippingAddress?.address || '',
                    city: data.defaultShippingAddress?.city || '',
                    postalCode: data.defaultShippingAddress?.postalCode || '',
                    country: data.defaultShippingAddress?.country || 'Bangladesh',
                });
            } catch (error) {
                toast.error('Failed to load profile');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user.token]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('/api/users/profile', {
                name: form.name,
                phone: form.phone,
                defaultShippingAddress: {
                    address: form.address,
                    city: form.city,
                    postalCode: form.postalCode,
                    country: form.country,
                },
            }, config);
            updateUser(data);
            toast.success('Profile updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
        setSaving(false);
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <form onSubmit={submitHandler} style={{ maxWidth: '480px' }}>
            <h2 style={styles.sectionTitle}>Edit Profile</h2>
            <div className="input-group">
                <label>Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="input-group">
                <label>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="017XXXXXXX" />
            </div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>Default Shipping Address</h3>
            <div className="input-group">
                <label>Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House No, Road No, Area" />
            </div>
            <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label>City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dhaka" />
                </div>
                <div style={{ flex: 1 }}>
                    <label>Postal Code</label>
                    <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                </div>
            </div>
            <div className="input-group">
                <label>Country</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
};

const OrdersTab = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders', error);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [user.token]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return styles.statusDelivered;
            case 'On the way': return styles.statusOnTheWay;
            case 'Processing': return styles.statusProcessing;
            default: return styles.statusPending;
        }
    };

    return (
        <>
            <h2 style={styles.sectionTitle}>Order History &amp; Tracking</h2>
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
                                    <td style={{ fontWeight: '500' }}>{order._id.substring(0, 8).toUpperCase()}</td>
                                    <td>
                                        {order.orderItems && order.orderItems.length > 0 && (
                                            <img src={order.orderItems[0].image} alt="Item" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>৳{order.totalPrice}</td>
                                    <td>{order.paymentMethod} ({order.isPaid ? 'Paid' : 'Unpaid'})</td>
                                    <td>
                                        <span style={{ ...styles.badge, ...getStatusStyle(order.status || 'Pending') }}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

const WishlistTab = ({ user }) => {
    const { addToCart } = useContext(CartContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const { data } = await axios.get('/api/users/wishlist', config);
                setItems(data);
            } catch (error) {
                toast.error('Failed to load wishlist');
            }
            setLoading(false);
        };
        fetchWishlist();
    }, [user.token]);

    const removeItem = async (productId) => {
        try {
            const { data } = await axios.delete(`/api/users/wishlist/${productId}`, config);
            setItems(data);
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    return (
        <>
            <h2 style={styles.sectionTitle}>Wishlist</h2>
            {loading ? (
                <p>Loading wishlist...</p>
            ) : items.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div style={styles.wishlistGrid}>
                    {items.map((product) => (
                        <div key={product._id} style={styles.wishlistCard}>
                            <img src={product.image} alt={product.name} style={styles.wishlistImage} />
                            <div style={{ padding: '0.75rem' }}>
                                <p style={{ fontWeight: '500', marginBottom: '0.4rem' }}>{product.name}</p>
                                <p style={{ color: '#c09f6e', fontWeight: '600', marginBottom: '0.75rem' }}>৳{product.price}</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
                                        disabled={!product.countInStock}
                                        onClick={() => { addToCart(product, 1); toast.success('Added to cart!'); }}
                                    >
                                        {product.countInStock ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
                                        onClick={() => removeItem(product._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

const styles = {
    page: {
        padding: '3rem 1rem',
        minHeight: '80vh',
    },
    header: {
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '1rem',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
    },
    tabBar: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    tabBtn: {
        padding: '0.6rem 1.2rem',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-main)',
        cursor: 'pointer',
        fontWeight: '500',
    },
    tabBtnActive: {
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
        border: '1px solid var(--color-accent)',
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
    },
    wishlistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    wishlistCard: {
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    wishlistImage: {
        width: '100%',
        height: '160px',
        objectFit: 'cover',
    },
};

export default CustomerDashboard;
