import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 448 512" fill="currentColor">
        <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const Header = () => {
    const { cartItems } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const submitSearch = (e) => {
        e.preventDefault();
        const trimmed = keyword.trim();
        navigate(trimmed ? `/search?keyword=${encodeURIComponent(trimmed)}` : '/search');
    };

    return (
        <header style={styles.header}>
            <div className="container" style={styles.container}>
                <Link to="/" style={{
                    ...styles.logo,
                    display: 'flex',
                    alignItems: 'center',
                    height: '55px',
                    overflow: 'hidden'
                }}>
                    <img src="/noble_rain_logo.jpg" alt="Noble Rain" style={{
                        height: '55px',
                        transform: 'scale(1.8)',
                        objectFit: 'contain',
                        mixBlendMode: 'multiply'
                    }} />
                </Link>
                <form onSubmit={submitSearch} className="header-search-form" style={styles.searchForm}>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search products..."
                        style={styles.searchInput}
                        aria-label="Search products"
                    />
                    <button type="submit" style={styles.searchBtn} aria-label="Search">
                        <SearchIcon />
                    </button>
                </form>
                <nav style={styles.nav}>
                    <Link to="/cart" style={{...styles.link, display: 'flex', alignItems: 'center'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                    </Link>
                    {user ? (
                        <>
                            <Link
                                to={user.isAdmin ? '/admin' : '/dashboard'}
                                style={{...styles.link, color: 'var(--color-header-text)', display: 'flex', alignItems: 'center'}}
                                title={user.isAdmin ? 'Admin Dashboard' : 'Customer Dashboard'}
                            >
                                <DashboardIcon />
                            </Link>
                            <button onClick={logout} className="btn" style={{ marginLeft: '1rem', border: 'none', backgroundColor: 'rgba(0,0,0,0.1)', color: 'var(--color-header-text)' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn" style={{ marginLeft: '1rem', border: 'none', backgroundColor: 'rgba(0,0,0,0.1)', color: 'var(--color-header-text)' }}>Login</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: 'var(--color-header-bg)',
        color: 'var(--color-header-text)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.5rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        fontFamily: 'Outfit, sans-serif',
        letterSpacing: '1px',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
    },
    searchForm: {
        display: 'flex',
        alignItems: 'stretch',
        flex: '1 1 auto',
        minWidth: 0,
        maxWidth: '400px',
        margin: '0 1.5rem',
        height: '40px',
    },
    searchInput: {
        flex: 1,
        minWidth: 0,
        boxSizing: 'border-box',
        height: '100%',
        margin: 0,
        padding: '0 0.9rem',
        borderRadius: '20px 0 0 20px',
        border: '1px solid var(--color-border)',
        borderRight: 'none',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
        outline: 'none',
        fontSize: '0.9rem',
    },
    searchBtn: {
        boxSizing: 'border-box',
        height: '100%',
        margin: 0,
        lineHeight: 'normal',
        padding: '0 0.9rem',
        borderRadius: '0 20px 20px 0',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-main)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    link: {
        marginLeft: '1.5rem',
        fontWeight: '500',
        position: 'relative',
        color: 'var(--color-header-text)',
    },
    badge: {
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        position: 'absolute',
        top: '-8px',
        right: '-10px',
    },
};

export default Header;
