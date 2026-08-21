import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import ProductReviews from '../components/ProductReviews';
import OrderViaMessenger from '../components/OrderViaMessenger';
import PolicyModal from '../components/PolicyModal';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [addingToWishlist, setAddingToWishlist] = useState(false);

    const addToWishlist = async () => {
        setAddingToWishlist(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`/api/users/wishlist/${id}`, {}, config);
            toast.success('Added to wishlist!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
        setAddingToWishlist(false);
    };

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [policyModal, setPolicyModal] = useState({ isOpen: false, type: 'shipping' });
    const [selectedImage, setSelectedImage] = useState(null);

    // Placeholder data
    // const dummyProducts = [
    //     { _id: '60d5ecb54d24a04d2c88f111', name: 'Premium Leather Tote', price: 5000, image: 'https://via.placeholder.com/600x800?text=Premium+Tote', description: 'Crafted from full-grain leather, this tote is spacious enough for your essentials and elegant enough for any occasion.', countInStock: 5 },
    //     { _id: '60d5ecb54d24a04d2c88f112', name: 'Classic Office Briefcase', price: 6500, image: 'https://via.placeholder.com/600x800?text=Office+Briefcase', description: 'A sleek, professional briefcase designed to keep your documents and laptop secure while elevating your work style.', countInStock: 2 },
    //     { _id: '60d5ecb54d24a04d2c88f113', name: 'Weekend Duffle Bag', price: 4200, image: 'https://via.placeholder.com/600x800?text=Duffle+Bag', description: 'Perfect for quick getaways. Features durable canvas with leather accents and a spacious interior.', countInStock: 10 },
    //     { _id: '60d5ecb54d24a04d2c88f114', name: 'Minimalist Crossbody', price: 3200, image: 'https://via.placeholder.com/600x800?text=Crossbody', description: 'Keep your hands free with this minimalist crossbody bag. Ideal for daily commutes and casual outings.', countInStock: 0 },
    // ];

    const fetchProduct = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/products/${id}`);
            setProduct(data);
            const gallery = (data.images && data.images.length > 0) ? data.images : [data.image];
            setSelectedImage(gallery[0]);
            setLoading(false);
        } catch (error) {
            // Fallback to dummy data
            const found = dummyProducts.find(p => p._id === id);
            if (found) {
                setProduct(found);
                setSelectedImage(found.image);
            }
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, Number(qty));
            navigate('/cart');
        }
    };

    const handleBuyNow = () => {
        if (product) {
            addToCart(product, Number(qty));
            navigate('/checkout');
        }
    };

    if (loading) return <div className="container" style={{padding: '5rem 0', textAlign: 'center'}}>Loading...</div>;
    if (!product) return <div className="container" style={{padding: '5rem 0', textAlign: 'center'}}>Product not found. <Link to="/">Go Back</Link></div>;

    const gallery = (product.images && product.images.length > 0) ? product.images : [product.image];

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <Link to="/" style={styles.backLink}>&larr; Back to Shop</Link>

            <div className="product-detail-grid" style={styles.grid}>
                {/* Image Section */}
                <div style={styles.imageCol}>
                    <div style={styles.mainImageWrapper}>
                        <img src={selectedImage || product.image} alt={product.name} style={styles.image} />
                    </div>
                    {gallery.length > 1 && (
                        <div style={styles.thumbRow}>
                            {gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedImage(img)}
                                    style={{
                                        ...styles.thumbBtn,
                                        borderColor: selectedImage === img ? '#c09f6e' : 'transparent',
                                    }}
                                >
                                    <img src={img} alt={`${product.name} ${idx + 1}`} style={styles.thumbImage} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div style={{...styles.detailsCol, textAlign: 'center'}}>
                    <h1 style={styles.title}>{product.name}</h1>
                    {product.discountPercentage > 0 ? (
                        <div>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center'}}>
                                <p style={{...styles.price, color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: '1.2rem'}}>৳{product.price}</p>
                                <p style={styles.price}>৳{Math.round(product.price * (1 - product.discountPercentage / 100))}</p>
                            </div>
                            <p style={{ color: '#28a745', fontWeight: '600', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                Save ৳{(product.price - Math.round(product.price * (1 - product.discountPercentage / 100))).toFixed(0)}
                            </p>
                        </div>
                    ) : (
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <p style={styles.price}>৳{product.price}</p>
                        </div>
                    )}
                    <p style={styles.description}>{product.description}</p>
                    
                    <div style={styles.stock}>
                        Status: <span style={{color: product.countInStock > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>
                            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    {product.countInStock > 0 ? (
                        <div style={styles.actionRow}>
                            <div className="input-group" style={{marginBottom: 0, marginRight: '1rem'}}>
                                <select
                                    style={styles.select}
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                >
                                    {[...Array(product.countInStock).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="btn btn-outline"
                                onClick={handleAddToCart}
                                style={{flex: 1, marginRight: '1rem', borderColor: '#c09f6e', color: '#c09f6e'}}
                            >
                                Add to Cart
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBuyNow}
                                style={{flex: 1}}
                            >
                                Buy Now
                            </button>
                        </div>
                    ) : user && (
                        <div style={styles.actionRow}>
                            <button
                                className="btn btn-outline"
                                onClick={addToWishlist}
                                disabled={addingToWishlist}
                                style={{flex: 1, borderColor: '#c09f6e', color: '#c09f6e'}}
                            >
                                {addingToWishlist ? 'Adding...' : 'Add to Wishlist'}
                            </button>
                        </div>
                    )}

                    <OrderViaMessenger product={product} />

                    <div style={styles.policyLinks}>
                        <button style={styles.policyLinkBtn} onClick={() => setPolicyModal({ isOpen: true, type: 'shipping' })}>
                            Shipping Policy
                        </button>
                        <span style={{ color: 'var(--color-border)' }}>|</span>
                        <button style={styles.policyLinkBtn} onClick={() => setPolicyModal({ isOpen: true, type: 'returns' })}>
                            Return &amp; Refund Policy
                        </button>
                    </div>
                </div>
            </div>

            {product.reviews !== undefined && (
                <ProductReviews product={product} onReviewAdded={fetchProduct} />
            )}

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
    backLink: {
        display: 'inline-block',
        marginBottom: '2rem',
        color: '#666',
        fontWeight: '500',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '4rem',
        alignItems: 'start',
    },
    imageCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    mainImageWrapper: {
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 'auto',
        display: 'block',
    },
    thumbRow: {
        display: 'flex',
        gap: '0.6rem',
        flexWrap: 'wrap',
    },
    thumbBtn: {
        padding: 0,
        width: '64px',
        height: '64px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid transparent',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        flexShrink: 0,
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    detailsCol: {
        padding: '1rem 0',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
        color: '#1a1a1a',
    },
    price: {
        fontSize: '1.5rem',
        color: '#c09f6e',
        fontWeight: '600',
        marginBottom: '1.5rem',
    },
    description: {
        color: '#555',
        lineHeight: '1.8',
        marginBottom: '2rem',
        fontSize: '1.1rem',
    },
    stock: {
        padding: '1rem 0',
        borderTop: '1px solid #eaeaea',
        borderBottom: '1px solid #eaeaea',
        marginBottom: '2rem',
        fontSize: '1.1rem',
    },
    actionRow: {
        display: 'flex',
        alignItems: 'stretch',
    },
    select: {
        padding: '0.8rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1rem',
        height: '100%',
    },
    policyLinks: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        fontSize: '0.85rem',
    },
    policyLinkBtn: {
        color: 'var(--color-text-muted)',
        textDecoration: 'underline',
    },
};

export default ProductPage;
