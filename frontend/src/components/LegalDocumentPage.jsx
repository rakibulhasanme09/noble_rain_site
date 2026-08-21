import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Lines like "1. Section Title" render as headings; everything else is a
// paragraph. Content itself comes from SiteSettings (editable in the admin
// dashboard), so this stays in sync with whatever the store owner sets.
const LegalDocumentPage = ({ title, field }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        axios.get('/api/settings/policies')
            .then(({ data }) => {
                if (!cancelled) setText(data[field] || '');
            })
            .catch(() => {
                if (!cancelled) setText('Unable to load this page right now. Please try again later.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [field]);

    const lines = text.split('\n').filter(Boolean);

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <h1 style={styles.title}>{title}</h1>
            <p style={styles.updated}>Last updated: August 2026</p>

            {loading ? (
                <p style={styles.body}>Loading...</p>
            ) : (
                lines.map((line, i) => (
                    /^\d+\.\s/.test(line.trim())
                        ? <h2 key={i} style={styles.sectionTitle}>{line}</h2>
                        : <p key={i} style={styles.body}>{line}</p>
                ))
            )}
        </div>
    );
};

const styles = {
    page: {
        maxWidth: '760px',
        padding: '4rem 1rem 5rem',
    },
    title: {
        fontSize: '2.2rem',
        marginBottom: '0.5rem',
    },
    updated: {
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
        marginBottom: '2.5rem',
    },
    sectionTitle: {
        fontSize: '1.15rem',
        marginTop: '2rem',
        marginBottom: '0.6rem',
    },
    body: {
        color: 'var(--color-text-muted)',
        lineHeight: 1.7,
        fontSize: '0.95rem',
        marginBottom: '1rem',
    },
};

export default LegalDocumentPage;
