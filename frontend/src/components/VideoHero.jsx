import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VideoHero = () => {
    const [heroVideo, setHeroVideo] = useState(null);

    useEffect(() => {
        const fetchHeroVideo = async () => {
            try {
                const { data } = await axios.get('/api/settings/homepage');
                setHeroVideo(data.heroVideo || '');
            } catch (error) {
                console.error('Error fetching homepage settings', error);
            }
        };
        fetchHeroVideo();
    }, []);

    if (!heroVideo) return null;

    return (
        <section className="video-hero" style={styles.section}>
            <video
                key={heroVideo}
                className="video-hero-video"
                style={styles.video}
                src={heroVideo}
                autoPlay
                muted
                loop
                playsInline
            />
            <div style={styles.overlay} />
            <div style={styles.content}>
                <p style={styles.eyebrow}>Noble Rain</p>
                <h1 style={styles.heading}>Style in Motion</h1>
                <a href="#collection" className="btn btn-primary" style={styles.cta}>
                    Shop the Collection
                </a>
            </div>
        </section>
    );
};

const styles = {
    section: {
        position: 'relative',
        width: '100%',
        height: '85vh',
        overflow: 'hidden',
        backgroundColor: '#111111',
    },
    video: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.5) 100%)',
    },
    content: {
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 1.5rem',
    },
    eyebrow: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        color: '#c09f6e',
        marginBottom: '1rem',
    },
    heading: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        color: '#ffffff',
        marginBottom: '2rem',
    },
    cta: {
        padding: '0.9rem 2.2rem',
        fontSize: '1rem',
    },
};

export default VideoHero;
