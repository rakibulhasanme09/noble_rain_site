import React, { useEffect, useRef, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise = null;
const loadGsiScript = () => {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return scriptLoadPromise;
};

// Renders Google's own Sign-In button and forwards the resulting ID token
// to our backend, which verifies it and returns our normal session payload.
const GoogleSignInButton = () => {
    const buttonRef = useRef(null);
    const { setAuthData } = useContext(AuthContext);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        let cancelled = false;

        const handleCredentialResponse = async (response) => {
            try {
                const { data } = await axios.post('/api/auth/google', { credential: response.credential });
                setAuthData(data);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Google sign-in failed');
            }
        };

        loadGsiScript().then(() => {
            if (cancelled || !buttonRef.current) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                width: 336,
                text: 'continue_with',
            });
            setReady(true);
        }).catch(() => {
            console.error('Failed to load Google Sign-In script');
        });

        return () => { cancelled = true; };
    }, [setAuthData]);

    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <div style={styles.wrapper}>
            <div style={styles.divider}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerText}>or</span>
                <span style={styles.dividerLine} />
            </div>
            <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', minHeight: ready ? 'auto' : '44px' }} />
        </div>
    );
};

const styles = {
    wrapper: {
        marginTop: '1.5rem',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: 'var(--color-border)',
    },
    dividerText: {
        color: 'var(--color-text-muted)',
        fontSize: '0.85rem',
    },
};

export default GoogleSignInButton;
