import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const ChevronLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const BagsScrollSection = () => {
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    useEffect(() => {
        const fetchTopSellers = async () => {
            try {
                const { data } = await axios.get('/api/products?topSeller=true');
                setProducts(data || []);
            } catch (error) {
                console.error('Error fetching top seller products', error);
            }
        };
        fetchTopSellers();
    }, []);

    if (products.length === 0) return null;

    const n = products.length;

    const prevSlide = () => setActiveIndex((i) => (i === 0 ? n - 1 : i - 1));
    const nextSlide = () => setActiveIndex((i) => (i === n - 1 ? 0 : i + 1));

    const buyNow = (product) => {
        addToCart(product, 1);
        navigate('/checkout');
    };

    return (
        <section
            className="bags-scroll-section"
            style={{ backgroundColor: '#f7f6f2' }}
        >
            <style>{`
                .bags-scroll-section {
                    display: flex;
                    align-items: center;
                    min-height: calc(100vh - 55px); /* Full screen minus header */
                    padding: 2rem 0;
                }
                .bags-nav-button {
                    display: flex;
                }
                .bags-slider-container {
                    position: relative;
                    width: 100%;
                }
                .bags-product-panel {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5vw;
                    align-items: center;
                    width: 100%;
                    padding: 0 4rem;
                    transition: opacity 0.4s ease-in-out;
                }
                @media (max-width: 768px) {
                    .bags-scroll-section {
                        padding: 3rem 0;
                    }
                    .bags-nav-button {
                        display: none !important;
                    }
                    .bags-product-panel {
                        grid-template-columns: 1fr;
                        padding: 0 1rem;
                        gap: 1.5rem;
                        text-align: center;
                    }
                    .bags-product-details {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .bags-dots {
                        top: -1.5rem !important;
                    }
                }
            `}</style>

            <div className="container" style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="bags-dots" style={styles.dots}>
                    {products.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            style={{
                                ...styles.dot,
                                width: i === activeIndex ? '32px' : '16px',
                                backgroundColor: i === activeIndex ? '#c09f6e' : 'rgba(17,17,17,0.25)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                            }}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                <button className="bags-nav-button" onClick={prevSlide} style={{ ...styles.navButton, left: '0' }} aria-label="Previous slide">
                    <ChevronLeft />
                </button>
                <button className="bags-nav-button" onClick={nextSlide} style={{ ...styles.navButton, right: '0' }} aria-label="Next slide">
                    <ChevronRight />
                </button>

                <div 
                    className="bags-slider-container"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {products.map((product, i) => {
                        const isActive = i === activeIndex;
                        const image = product.image || (product.images && product.images[0]);
                        return (
                            <div
                                key={product._id}
                                className="bags-product-panel"
                                style={{
                                    position: isActive ? 'relative' : 'absolute',
                                    top: isActive ? 'auto' : 0,
                                    left: isActive ? 'auto' : 0,
                                    opacity: isActive ? 1 : 0,
                                    pointerEvents: isActive ? 'auto' : 'none',
                                    visibility: isActive ? 'visible' : 'hidden',
                                    zIndex: isActive ? 2 : 1
                                }}
                            >
                                <img src={image} alt={product.name} className="bags-product-image" style={styles.image} />
                                <div className="bags-product-details">
                                    <p style={styles.eyebrow}>Top Seller · {product.category}</p>
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
            </div>
        </section>
    );
};

const styles = {
    dots: {
        position: 'absolute',
        top: '-2rem',
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
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 10,
        color: '#333'
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
