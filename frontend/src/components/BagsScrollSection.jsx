import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

// Crossfades product i in/out over a band that is ~35% of one segment's
// width, centered on each segment boundary, so neighbors swap smoothly and
// only one panel is ever more than half-visible at a time.
const segmentOpacity = (progress, i, n) => {
    const segLen = 1 / n;
    const segStart = i * segLen;
    const segEnd = segStart + segLen;
    const band = segLen * 0.35;
    let opacity = 1;

    if (i > 0) {
        if (progress < segStart - band) return 0;
        if (progress < segStart + band) {
            opacity = (progress - (segStart - band)) / (2 * band);
        }
    }

    if (i < n - 1) {
        if (progress > segEnd + band) return 0;
        if (progress > segEnd - band) {
            const fadeOut = (segEnd + band - progress) / (2 * band);
            opacity = Math.min(opacity, fadeOut);
        }
    }

    return Math.max(0, Math.min(1, opacity));
};

const BagsScrollSection = ({ headerHeight = 0 }) => {
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await axios.get('/api/products?sort=rating&pageNumber=1&pageSize=3');
                setProducts(data.products || []);
            } catch (error) {
                console.error('Error fetching featured products', error);
            }
        };
        fetchFeatured();
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const el = sectionRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const paneHeight = window.innerHeight - headerHeight;
            const total = rect.height - paneHeight;
            const p = total > 0 ? -rect.top / total : 0;
            setProgress(Math.min(1, Math.max(0, p)));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [headerHeight]);

    if (products.length === 0) return null;

    const n = products.length;
    const eyebrows = ['Best Seller', 'Top Rated', 'Staff Pick'];
    const activeIndex = Math.min(n - 1, Math.floor(progress * n));

    const buyNow = (product) => {
        addToCart(product, 1);
        navigate('/checkout');
    };

    return (
        <section
            ref={sectionRef}
            className="bags-scroll-section"
            style={{ position: 'relative', backgroundColor: '#f7f6f2' }}
        >
            <div
                className="bags-scroll-pane"
                style={{
                    position: 'sticky',
                    top: headerHeight,
                    height: `calc(100vh - ${headerHeight}px)`,
                    overflow: 'hidden',
                }}
            >
                <div className="bags-dots" style={styles.dots}>
                    {products.map((_, i) => (
                        <span
                            key={i}
                            style={{
                                ...styles.dot,
                                width: i === activeIndex ? '32px' : '16px',
                                backgroundColor: i === activeIndex ? '#c09f6e' : 'rgba(17,17,17,0.25)',
                            }}
                        />
                    ))}
                </div>

                {products.map((product, i) => {
                    const opacity = segmentOpacity(progress, i, n);
                    const image = product.image || (product.images && product.images[0]);
                    return (
                        <div
                            key={product._id}
                            className="bags-product-panel"
                            style={{
                                ...styles.panel,
                                opacity,
                                pointerEvents: opacity >= 0.5 ? 'auto' : 'none',
                            }}
                        >
                            <img src={image} alt={product.name} className="bags-product-image" style={styles.image} />
                            <div className="bags-product-details">
                                <p style={styles.eyebrow}>
                                    {eyebrows[i] || 'Featured'} · #{i + 1} in {product.category}
                                </p>
                                <h3 className="bags-product-name" style={styles.name}>{product.name}</h3>
                                <p style={styles.description}>
                                    {product.description}
                                    {product.numReviews > 0 && ` ${product.rating.toFixed(1)}★ (${product.numReviews} reviews).`}
                                </p>
                                <div className="bags-price-row" style={styles.priceRow}>
                                    <span style={styles.price}>৳{product.price}</span>
                                    <button className="btn btn-primary" onClick={() => buyNow(product)}>
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const styles = {
    dots: {
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.5rem',
        zIndex: 2,
    },
    dot: {
        height: '16px',
        borderRadius: '999px',
        transition: 'width 0.3s ease, background-color 0.3s ease',
    },
    panel: {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '5vw',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        transition: 'opacity 0.1s linear',
    },
    image: {
        justifySelf: 'center',
        width: 'min(80%, 380px)',
        aspectRatio: '3/4',
        borderRadius: '12px',
        boxShadow: '0 20px 45px rgba(0,0,0,0.12)',
        objectFit: 'cover',
    },
    eyebrow: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontSize: '0.8rem',
        color: '#c09f6e',
        marginBottom: '0.75rem',
    },
    name: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
        color: '#111111',
        marginBottom: '1rem',
    },
    description: {
        fontSize: '1rem',
        color: '#666666',
        lineHeight: 1.6,
        maxWidth: '420px',
        marginBottom: '1.5rem',
    },
    priceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    price: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        fontSize: '1.4rem',
        color: '#111111',
    },
};

export default BagsScrollSection;
