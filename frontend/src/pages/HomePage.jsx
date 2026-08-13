import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products');
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products', error);
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(['All', ...data.map(c => c.name)]);
            } catch (error) {
                console.error('Error fetching categories', error);
            }
        };

        fetchProducts();
        fetchCategories();
    }, []);

    // Placeholder data if db is empty
    const displayProducts = products.length > 0 ? products : [
        { _id: '60d5ecb54d24a04d2c88f111', name: 'Premium Leather Tote', price: 5000, category: 'Bags', image: 'https://via.placeholder.com/400x500?text=Premium+Tote', countInStock: 5 },
        { _id: '60d5ecb54d24a04d2c88f112', name: 'Classic Office Briefcase', price: 6500, category: 'Bags', image: 'https://via.placeholder.com/400x500?text=Office+Briefcase', countInStock: 5 },
        { _id: '60d5ecb54d24a04d2c88f113', name: 'Weekend Duffle Bag', price: 4200, category: 'Bags', image: 'https://via.placeholder.com/400x500?text=Duffle+Bag', countInStock: 5 },
        { _id: '60d5ecb54d24a04d2c88f114', name: 'Minimalist Crossbody', price: 3200, category: 'Bags', image: 'https://via.placeholder.com/400x500?text=Crossbody', countInStock: 0 },
    ];

    const filteredProducts = selectedCategory === 'All' 
        ? displayProducts 
        : displayProducts.filter(p => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <div className="home-page animate-fade-in">
            {/* Featured Collection */}
            <section id="collection" style={styles.collectionSection}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Featured Products</h2>
                    <div style={styles.categoryFilter}>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                style={{
                                    ...styles.categoryBtn, 
                                    ...(selectedCategory === cat ? styles.categoryBtnActive : {})
                                }}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Loading premium collection...</p>
                    ) : (
                        <div style={styles.productGrid}>
                            {filteredProducts.map((product) => {
                                const outOfStock = !product.countInStock || product.countInStock <= 0;
                                return (
                                <div key={product._id} style={styles.productCard}>
                                    <Link to={`/product/${product._id}`} style={{display: 'block', textDecoration: 'none'}}>
                                        <div style={styles.imageWrapper}>
                                            <img src={product.image} alt={product.name} style={{...styles.productImage, ...(outOfStock ? { opacity: 0.5 } : {})}} />
                                            {outOfStock ? (
                                                <div style={styles.stockOutBadge}>
                                                    Stock Out
                                                </div>
                                            ) : product.discountPercentage > 0 && (
                                                <div style={{
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
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}>
                                                    -{product.discountPercentage}%
                                                </div>
                                            )}
                                        </div>
                                        <div style={styles.productInfo}>
                                            <h3 style={styles.productName}>{product.name}</h3>
                                            {product.discountPercentage > 0 ? (
                                                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center'}}>
                                                    <p style={{...styles.productPrice, color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: '0.9rem'}}>৳{product.price}</p>
                                                    <p style={styles.productPrice}>৳{Math.round(product.price * (1 - product.discountPercentage / 100))}</p>
                                                </div>
                                            ) : (
                                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                                    <p style={styles.productPrice}>৳{product.price}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div style={{display: 'flex', gap: '0.5rem', padding: '0 0.5rem 1rem 0.5rem'}}>
                                        <button
                                            className="btn btn-outline"
                                            style={{flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderColor: '#c09f6e', color: '#c09f6e', ...(outOfStock ? styles.disabledBtn : {})}}
                                            disabled={outOfStock}
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); toast.success('Added to cart!'); }}
                                        >
                                            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{flex: 1, padding: '0.5rem', fontSize: '0.9rem', ...(outOfStock ? styles.disabledBtn : {})}}
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
                    )}
                </div>
            </section>
        </div>
    );
};

const styles = {
    categoryFilter: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    categoryBtn: {
        padding: '0.5rem 1.5rem',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-main)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontWeight: '500',
    },
    categoryBtnActive: {
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
        border: 'none',
    },
    collectionSection: {
        padding: '6rem 0',
        backgroundColor: 'var(--color-bg-main)',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '3rem',
        color: 'var(--color-text-main)',
    },
    productGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2.5rem',
    },
    productCard: {
        display: 'block',
        group: 'true',
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
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.3s ease',
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
    disabledBtn: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};

export default HomePage;
