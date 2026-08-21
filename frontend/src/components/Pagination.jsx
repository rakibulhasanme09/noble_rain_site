import React from 'react';

const Pagination = ({ page, pages, onPageChange }) => {
    if (pages <= 1) return null;

    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

    return (
        <nav style={styles.wrapper} aria-label="Pagination">
            <button
                style={{ ...styles.btn, ...(page <= 1 ? styles.disabled : {}) }}
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
            >
                Prev
            </button>
            {pageNumbers.map((n) => (
                <button
                    key={n}
                    style={{ ...styles.btn, ...(n === page ? styles.active : {}) }}
                    onClick={() => onPageChange(n)}
                    aria-current={n === page ? 'page' : undefined}
                >
                    {n}
                </button>
            ))}
            <button
                style={{ ...styles.btn, ...(page >= pages ? styles.disabled : {}) }}
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pages}
            >
                Next
            </button>
        </nav>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '3rem',
    },
    btn: {
        minWidth: '38px',
        padding: '0.5rem 0.8rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
        fontSize: '0.9rem',
    },
    active: {
        backgroundColor: 'var(--color-accent)',
        borderColor: 'var(--color-accent)',
        color: '#fff',
    },
    disabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
    },
};

export default Pagination;
