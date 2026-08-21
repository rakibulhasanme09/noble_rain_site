import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductGrid = ({ products, emptyMessage = 'No products found.' }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const addToWishlist = async (productId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`/api/users/wishlist/${productId}`, {}, config);
            toast.success('Added to wishlist!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    if (products.length === 0) {
        return <p style={{ textAlign: 'center' }}>{emptyMessage}</p>;
    }

    return (
        <div className="product-grid" style={styles.productGrid}>
            {products.map((product) => {
                const outOfStock = !product.countInStock || product.countInStock <= 0;
                const image = product.image || (product.images && product.images[0]);
                const onSale = product.discountPercentage > 0;
                const discountedPrice = onSale ? Math.round(product.price * (1 - product.discountPercentage / 100)) : product.price;
                const saveAmount = product.price - discountedPrice;
                return (
                    <div key={product._id} style={styles.productCard}>
                        <Link to={`/product/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
                            <div style={styles.imageWrapper}>
                                <img src={image} alt={product.name} style={{ ...styles.productImage, ...(outOfStock ? { opacity: 0.5 } : {}) }} />
                                {onSale && !outOfStock && (
                                    <div style={styles.saveBadge}>Save ৳{saveAmount.toFixed(0)}</div>
                                )}
                                {outOfStock ? (
                                    <div style={styles.stockOutBadge}>Stock Out</div>
                                ) : onSale && (
                                    <div style={styles.discountBadge}>-{product.discountPercentage}%</div>
                                )}
                            </div>
                            <div style={styles.productInfo}>
                                <h3 style={styles.productName}>{product.name}</h3>
                                {onSale ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ ...styles.productPrice, color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: '0.9rem' }}>৳{product.price}</p>
                                        <p style={styles.productPrice}>৳{discountedPrice}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <p style={styles.productPrice}>৳{product.price}</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                        <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem 1rem 0.5rem' }}>
                            {outOfStock && user ? (
                                <button
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderColor: '#c09f6e', color: '#c09f6e' }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToWishlist(product._id); }}
                                >
                                    Add to Wishlist
                                </button>
                            ) : (
                                <button
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderColor: '#c09f6e', color: '#c09f6e', ...(outOfStock ? styles.disabledBtn : {}) }}
                                    disabled={outOfStock}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); toast.success('Added to cart!'); }}
                                >
                                    {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', ...(outOfStock ? styles.disabledBtn : {}) }}
                                disabled={outOfStock}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); navigate('/checkout'); }}
                            >
                                {outOfStock ? 'Out of Stock' : 'Buy Now'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const styles = {
    productGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2.5rem',
    },
    productCard: {
        display: 'block',
    },
    imageWrapper: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        backgroundColor: 'var(--color-bg-subtle)',
        aspectRatio: '4/5',
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    productInfo: {
        padding: '1.5rem 0.5rem 0.5rem 0.5rem',
        textAlign: 'center',
    },
    productName: {
        fontSize: '1.1rem',
        color: 'var(--color-text-main)',
        marginBottom: '0.5rem',
    },
    productPrice: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#c09f6e',
    },
    stockOutBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '0.25rem 0.7rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        letterSpacing: '0.03em',
        zIndex: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    discountBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        zIndex: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    saveBadge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        zIndex: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    disabledBtn: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};

export default ProductGrid;
