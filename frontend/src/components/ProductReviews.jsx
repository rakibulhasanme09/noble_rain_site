import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Star = ({ filled, onClick, size = 20 }) => (
    <svg
        onClick={onClick}
        width={size} height={size} viewBox="0 0 24 24"
        fill={filled ? '#c09f6e' : 'none'}
        stroke="#c09f6e" strokeWidth="1.5"
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const StarRating = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} filled={n <= value} onClick={onChange ? () => onChange(n) : undefined} />
        ))}
    </div>
);

const ProductReviews = ({ product, onReviewAdded }) => {
    const { user } = useContext(AuthContext);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const reviews = product.reviews || [];

    const submitReview = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            toast.warn('Please add a rating and a comment');
            return;
        }
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`/api/products/${product._id}/reviews`, { rating, comment }, config);
            toast.success('Review submitted!');
            setRating(0);
            setComment('');
            if (onReviewAdded) onReviewAdded();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
        setSubmitting(false);
    };

    return (
        <div style={styles.section}>
            <h2 style={styles.heading}>Ratings &amp; Reviews</h2>

            <div style={styles.summaryRow}>
                <StarRating value={Math.round(product.rating || 0)} />
                <span style={styles.summaryText}>
                    {product.rating ? product.rating.toFixed(1) : '0.0'} out of 5 &middot; {product.numReviews || 0} review{(product.numReviews || 0) !== 1 ? 's' : ''}
                </span>
            </div>

            {reviews.length === 0 ? (
                <p style={styles.muted}>No reviews yet. Be the first to review this product.</p>
            ) : (
                <div style={styles.list}>
                    {reviews.slice().reverse().map((r, i) => (
                        <div key={r._id || i} style={styles.reviewCard}>
                            <div style={styles.reviewHeader}>
                                <strong>{r.name}</strong>
                                <StarRating value={r.rating} />
                            </div>
                            <p style={styles.reviewComment}>{r.comment}</p>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.formWrap}>
                {user ? (
                    <form onSubmit={submitReview}>
                        <h3 style={styles.formTitle}>Write a Review</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <StarRating value={rating} onChange={setRating} />
                        </div>
                        <div className="input-group">
                            <textarea
                                rows="3"
                                placeholder="Share your experience with this product..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <p style={styles.muted}>
                        <a href="/login" style={{ textDecoration: 'underline' }}>Log in</a> to write a review.
                    </p>
                )}
            </div>
        </div>
    );
};

const styles = {
    section: {
        marginTop: '4rem',
        paddingTop: '3rem',
        borderTop: '1px solid var(--color-border)',
        maxWidth: '760px',
    },
    heading: {
        fontSize: '1.8rem',
        marginBottom: '1.5rem',
    },
    summaryRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
    },
    summaryText: {
        color: 'var(--color-text-muted)',
        fontSize: '0.95rem',
    },
    muted: {
        color: 'var(--color-text-muted)',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2.5rem',
    },
    reviewCard: {
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    reviewComment: {
        color: 'var(--color-text-main)',
        lineHeight: 1.6,
    },
    formWrap: {
        maxWidth: '460px',
    },
    formTitle: {
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
};

export default ProductReviews;
