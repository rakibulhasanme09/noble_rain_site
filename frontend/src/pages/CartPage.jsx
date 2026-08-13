import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const CartPage = () => {
    const { cartItems, removeFromCart, addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const checkoutHandler = () => {
        navigate('/checkout');
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <h1 style={styles.title}>Shopping Cart</h1>
            
            {cartItems.length === 0 ? (
                <div style={styles.emptyCart}>
                    <p>Your cart is currently empty.</p>
                    <Link to="/" className="btn btn-primary" style={{marginTop: '1rem'}}>Return to Shop</Link>
                </div>
            ) : (
                <div className="cart-grid" style={styles.grid}>
                    <div style={styles.cartItems}>
                        {cartItems.map(item => (
                            <div key={item.product} style={styles.itemRow}>
                                <div style={styles.itemImageWrapper}>
                                    <img src={item.image} alt={item.name} style={styles.itemImage} />
                                </div>
                                <div style={styles.itemDetails}>
                                    <Link to={`/product/${item.product}`} style={styles.itemName}>{item.name}</Link>
                                    <p style={styles.itemPrice}>৳{item.price}</p>
                                </div>
                                <div style={styles.itemAction}>
                                    <select 
                                        value={item.qty} 
                                        onChange={(e) => addToCart(item, Number(e.target.value) - item.qty)}
                                        style={styles.select}
                                    >
                                        {[...Array(10).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        style={styles.removeBtn} 
                                        onClick={() => removeFromCart(item.product)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={styles.summary}>
                        <h2 style={styles.summaryTitle}>Order Summary</h2>
                        <div style={styles.summaryRow}>
                            <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                            <span style={{fontWeight: 'bold'}}>৳{subtotal.toFixed(2)}</span>
                        </div>
                        <p style={{fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '2rem'}}>
                            Shipping & taxes calculated at checkout.
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{width: '100%'}} 
                            onClick={checkoutHandler}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
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
    emptyCart: {
        textAlign: 'center',
        padding: '4rem 0',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '3rem',
        alignItems: 'start',
    },
    cartItems: {
        borderTop: '1px solid var(--color-border)',
    },
    itemRow: {
        display: 'flex',
        padding: '1.5rem 0',
        borderBottom: '1px solid var(--color-border)',
        gap: '1.5rem',
        alignItems: 'center',
    },
    itemImageWrapper: {
        width: '100px',
        height: '100px',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        display: 'block',
        fontSize: '1.1rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        color: 'var(--color-text-main)',
    },
    itemPrice: {
        color: '#c09f6e',
        fontWeight: '600',
    },
    itemAction: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1rem',
    },
    select: {
        padding: '0.5rem',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
    },
    removeBtn: {
        color: '#dc3545',
        textDecoration: 'underline',
        fontSize: '0.9rem',
    },
    summary: {
        backgroundColor: 'var(--color-bg-subtle)',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
    },
    summaryTitle: {
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '1rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        fontSize: '1.1rem',
    }
};

export default CartPage;
