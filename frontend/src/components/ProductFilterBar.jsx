import React, { useState, useEffect } from 'react';

const SORT_LABELS = {
    newest: 'Newest',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    rating: 'Top Rated',
};

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

export const DEFAULT_PRODUCT_FILTERS = {
    category: 'All',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    onSale: false,
    inStock: false,
};

const ProductFilterBar = ({ categories, filters, onChange }) => {
    const [minPrice, setMinPrice] = useState(filters.minPrice);
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Keep local price inputs in sync if a parent-level reset happens.
    useEffect(() => {
        setMinPrice(filters.minPrice);
        setMaxPrice(filters.maxPrice);
    }, [filters.minPrice, filters.maxPrice]);

    const applyPriceRange = () => {
        onChange({ ...filters, minPrice, maxPrice });
    };

    const hasActiveFilters = filters.category !== 'All' || filters.minPrice || filters.maxPrice
        || filters.sort !== 'newest' || filters.onSale || filters.inStock;

    const clearAll = () => {
        setMinPrice('');
        setMaxPrice('');
        onChange({ ...DEFAULT_PRODUCT_FILTERS });
    };

    return (
        <>
            <button type="button" className="filter-toggle-btn" style={styles.toggleBtn} onClick={() => setMobileOpen((o) => !o)}>
                <FilterIcon />
                Filters
                {hasActiveFilters && <span style={styles.activeDot} />}
            </button>

            <aside className={`filter-sidebar${mobileOpen ? ' mobile-open' : ''}`} style={styles.sidebar}>
                <div style={styles.headerRow}>
                    <h3 style={styles.heading}>Filters</h3>
                    {hasActiveFilters && (
                        <button style={styles.clearBtn} onClick={clearAll} type="button">Clear all</button>
                    )}
                </div>

                <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Category</h4>
                    <div style={styles.categoryList}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                style={{
                                    ...styles.categoryBtn,
                                    ...(filters.category === cat ? styles.categoryBtnActive : {}),
                                }}
                                onClick={() => onChange({ ...filters, category: cat })}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Price Range</h4>
                    <div style={styles.priceGroup}>
                        <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            placeholder="Min ৳"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            onBlur={applyPriceRange}
                            onKeyDown={(e) => e.key === 'Enter' && applyPriceRange()}
                            style={styles.priceInput}
                            aria-label="Minimum price"
                        />
                        <span style={styles.priceDash}>&ndash;</span>
                        <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            placeholder="Max ৳"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            onBlur={applyPriceRange}
                            onKeyDown={(e) => e.key === 'Enter' && applyPriceRange()}
                            style={styles.priceInput}
                            aria-label="Maximum price"
                        />
                    </div>
                </div>

                <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Availability</h4>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={filters.onSale}
                            onChange={(e) => onChange({ ...filters, onSale: e.target.checked })}
                        />
                        On Sale
                    </label>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={(e) => onChange({ ...filters, inStock: e.target.checked })}
                        />
                        In Stock
                    </label>
                </div>

                <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Sort By</h4>
                    <select
                        value={filters.sort}
                        onChange={(e) => onChange({ ...filters, sort: e.target.value })}
                        style={styles.sortSelect}
                        aria-label="Sort by"
                    >
                        {Object.entries(SORT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </aside>
        </>
    );
};

const styles = {
    toggleBtn: {
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
        fontWeight: '500',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        position: 'relative',
    },
    activeDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-accent)',
        display: 'inline-block',
    },
    sidebar: {
        flexDirection: 'column',
        gap: '1.75rem',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        height: 'fit-content',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heading: {
        fontSize: '1.1rem',
    },
    clearBtn: {
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        textDecoration: 'underline',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    sectionTitle: {
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--color-text-muted)',
    },
    categoryList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    categoryBtn: {
        textAlign: 'left',
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'transparent',
        color: 'var(--color-text-main)',
        fontWeight: '500',
        fontSize: '0.92rem',
    },
    categoryBtnActive: {
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
    },
    priceGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
    },
    priceInput: {
        width: '0',
        flex: 1,
        padding: '0.55rem 0.7rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
        fontSize: '0.9rem',
    },
    priceDash: {
        color: 'var(--color-text-muted)',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.92rem',
        color: 'var(--color-text-main)',
        cursor: 'pointer',
    },
    sortSelect: {
        width: '100%',
        padding: '0.55rem 0.7rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
        fontSize: '0.9rem',
        cursor: 'pointer',
    },
};

export default ProductFilterBar;
