import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import PolicyModal from '../components/PolicyModal';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [policyModal, setPolicyModal] = useState({ isOpen: false, type: 'shipping' });

    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Guest Info
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Bangladesh');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingLocation, setShippingLocation] = useState('inside');
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        if (user) {
            setGuestName(user.name);
            setGuestEmail(user.email);
        }
    }, [user]);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const shippingPrice = itemsPrice > 0 ? (shippingLocation === 'inside' ? 80 : 130) : 0;
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

    // Re-check the applied coupon if the cart total changes (e.g. qty edited on another tab)
    useEffect(() => {
        if (appliedCoupon && itemsPrice === 0) {
            setAppliedCoupon(null);
        }
    }, [itemsPrice, appliedCoupon]);

    const applyCoupon = async () => {
        if (!couponInput.trim()) return;
        setApplyingCoupon(true);
        setCouponError('');
        try {
            const { data } = await axios.post('/api/coupons/validate', {
                code: couponInput.trim(),
                cartTotal: itemsPrice,
            });
            setAppliedCoupon(data);
            toast.success(`Coupon "${data.code}" applied!`);
        } catch (error) {
            setAppliedCoupon(null);
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
        }
        setApplyingCoupon(false);
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        setCouponError('');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setPlacingOrder(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(user && { Authorization: `Bearer ${user.token}` })
                }
            };
            const { data } = await axios.post('/api/orders', {
                orderItems: cartItems,
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                guestName,
                guestEmail,
                guestPhone
            }, config);

            clearCart();
            setPlacingOrder(false);
            toast.success(`Order placed successfully! Order ID: ${data._id.substring(0, 8).toUpperCase()}`);
            navigate(`/order-confirmation/${data._id}`, { state: { order: data } });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to place order';
            console.error('Failed to place order', error.response?.data || error);
            toast.error(`Failed to place order: ${errorMsg}`);
            setPlacingOrder(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <h1 style={styles.title}>Checkout</h1>
            
            <div className="checkout-grid" style={styles.grid}>
                {/* Form Section */}
                <div>
                    <form onSubmit={submitHandler} style={styles.form}>
                        
                        <h2 style={styles.sectionTitle}>Contact Information</h2>
                        {!user && <p style={{fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem'}}>Already have an account? <a href="/login?redirect=checkout" style={{color: 'var(--color-text-main)', textDecoration: 'underline'}}>Log in</a> for a faster checkout.</p>}
                        
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" />
                        </div>
                        <div className="input-group" style={{display: 'flex', gap: '1rem'}}>
                            <div style={{flex: 1}}>
                                <label>Email (Optional)</label>
                                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="name@gmail.com" />
                            </div>
                            <div style={{flex: 1}}>
                                <label>Phone</label>
                                <input type="text" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="017XXXXXXX" />
                            </div>
                        </div>

                        <h2 style={{marginTop: '2rem', fontSize: '1.5rem', marginBottom: '1.5rem'}}>Shipping Method</h2>
                        <div style={{marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                                <input 
                                    type="radio" 
                                    value="inside" 
                                    checked={shippingLocation === 'inside'} 
                                    onChange={(e) => setShippingLocation(e.target.value)} 
                                />
                                Inside Dhaka (৳80)
                            </label>
                            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                                <input 
                                    type="radio" 
                                    value="outside" 
                                    checked={shippingLocation === 'outside'} 
                                    onChange={(e) => setShippingLocation(e.target.value)} 
                                />
                                Outside Dhaka (৳130)
                            </label>
                        </div>

                        <h2 style={{marginTop: '2rem', fontSize: '1.5rem', marginBottom: '1.5rem'}}>Shipping Address</h2>
                        <div className="input-group">
                            <label>Address</label>
                            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House No, Road No, Area" />
                        </div>
                        <div className="input-group" style={{display: 'flex', gap: '1rem'}}>
                            <div style={{flex: 1}}>
                                <label>City</label>
                                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
                            </div>
                            <div style={{flex: 1}}>
                                <label>Postal Code (Optional)</label>
                                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="1200" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Country</label>
                            <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} disabled />
                        </div>
                        
                        <h2 style={{marginTop: '2rem', fontSize: '1.5rem', marginBottom: '1.5rem'}}>Payment Method</h2>
                        <div style={{marginBottom: '2rem'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                                <input 
                                    type="radio" 
                                    value="COD" 
                                    checked={paymentMethod === 'COD'} 
                                    onChange={(e) => setPaymentMethod(e.target.value)} 
                                />
                                Cash On Delivery (COD)
                            </label>
                            <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem'}}>Pay in cash upon receiving your order.</p>
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}} disabled={placingOrder || cartItems.length === 0}>
                            {placingOrder ? 'Placing Order...' : 'Confirm Order'}
                        </button>
                    </form>
                </div>
                
                {/* Summary Section */}
                <div>
                    <div style={styles.summary}>
                        <h2 style={{...styles.sectionTitle, borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem'}}>Order Summary</h2>
                        <div style={styles.cartItems}>
                            {cartItems.map((item, index) => (
                                <div key={index} style={styles.itemRow}>
                                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '1rem'}}>
                                        <img src={item.image} alt={item.name} style={styles.itemImage} />
                                        <div style={{minWidth: 0}}>
                                            <span style={{display: 'block', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.name}</span>
                                            <span style={{fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Qty: {item.qty}</span>
                                        </div>
                                    </div>
                                    <div style={{fontWeight: '600', flexShrink: 0}}>৳{item.price * item.qty}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={styles.couponRow}>
                            {appliedCoupon ? (
                                <div style={styles.couponApplied}>
                                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                                    <button type="button" onClick={removeCoupon} style={styles.couponRemove}>Remove</button>
                                </div>
                            ) : (
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <input
                                        type="text"
                                        placeholder="Coupon code"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        style={{flex: 1, textTransform: 'uppercase'}}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={applyCoupon}
                                        disabled={applyingCoupon || !couponInput.trim()}
                                        style={{whiteSpace: 'nowrap'}}
                                    >
                                        {applyingCoupon ? 'Checking...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                            {couponError && <p style={styles.couponError}>{couponError}</p>}
                        </div>

                        <div style={{borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem'}}>
                            <div style={styles.summaryRow}>
                                <span>Items:</span>
                                <span>৳{itemsPrice.toFixed(2)}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Shipping:</span>
                                <span>৳{shippingPrice.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div style={{...styles.summaryRow, color: 'var(--color-success)'}}>
                                    <span>Discount:</span>
                                    <span>-৳{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{...styles.summaryRow, fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', borderTop: '2px solid var(--color-border)', paddingTop: '1rem'}}>
                                <span>Total:</span>
                                <span>৳{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={styles.policyLinks}>
                            <button type="button" style={styles.policyLinkBtn} onClick={() => setPolicyModal({ isOpen: true, type: 'shipping' })}>
                                Shipping Policy
                            </button>
                            <span style={{ color: 'var(--color-border)' }}>|</span>
                            <button type="button" style={styles.policyLinkBtn} onClick={() => setPolicyModal({ isOpen: true, type: 'returns' })}>
                                Return &amp; Refund Policy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PolicyModal
                isOpen={policyModal.isOpen}
                type={policyModal.type}
                onClose={() => setPolicyModal((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

const styles = {
    page: {
        padding: '3rem 1rem',
        minHeight: '80vh',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '2rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '4rem',
        alignItems: 'start',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
    },
    form: {
        backgroundColor: 'var(--color-bg-main)',
    },
    summary: {
        backgroundColor: 'var(--color-bg-subtle)',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        position: 'sticky',
        top: '100px',
    },
    cartItems: {
        maxHeight: '300px',
        overflowY: 'auto',
    },
    itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderBottom: '1px solid var(--color-border)',
    },
    itemImage: {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
    },
    couponRow: {
        marginTop: '1rem',
    },
    couponApplied: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-bg-main)',
        border: '1px solid var(--color-success)',
        borderRadius: '6px',
        fontSize: '0.9rem',
    },
    couponRemove: {
        color: 'var(--color-danger)',
        fontSize: '0.85rem',
        textDecoration: 'underline',
    },
    couponError: {
        color: 'var(--color-danger)',
        fontSize: '0.85rem',
        marginTop: '0.5rem',
    },
    policyLinks: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        marginTop: '1.5rem',
        fontSize: '0.8rem',
    },
    policyLinkBtn: {
        color: 'var(--color-text-muted)',
        textDecoration: 'underline',
    },
};

export default CheckoutPage;
