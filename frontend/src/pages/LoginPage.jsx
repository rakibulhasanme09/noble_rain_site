import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import axios from 'axios';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState('form'); // 'form' | 'otp' | 'forgot-email' | 'forgot-reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resending, setResending] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const { login, setAuthData, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) {
            navigate(redirect);
        }
    }, [navigate, user, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (isLogin) {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.message);
            }
        } else {
            // Register logic - creates an unverified account and emails an OTP
            try {
                await axios.post('/api/auth/register', { name, email, password });
                setStep('otp');
            } catch (err) {
                setError(err.response?.data?.message || 'Registration failed');
            }
        }
        setSubmitting(false);
    };

    const otpSubmitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/auth/verify-otp', { email, code: otpCode });
            setAuthData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
        setSubmitting(false);
    };

    const resendOtpHandler = async () => {
        setResending(true);
        setError('');
        try {
            await axios.post('/api/auth/resend-otp', { email });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        }
        setResending(false);
    };

    const forgotEmailSubmitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
            setInfoMessage(data.message);
            setStep('forgot-reset');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        }
        setSubmitting(false);
    };

    const resetPasswordSubmitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/auth/reset-password', {
                email: forgotEmail,
                code: resetCode,
                newPassword,
            });
            setAuthData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
        setSubmitting(false);
    };

    const backToLogin = () => {
        setStep('form');
        setIsLogin(true);
        setError('');
        setInfoMessage('');
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
    };

    if (step === 'forgot-email') {
        return (
            <div className="container animate-fade-in" style={styles.page}>
                <div style={styles.formContainer}>
                    <h1 style={styles.title}>Reset Password</h1>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        Enter your account email and we'll send you a code to reset your password.
                    </p>

                    {error && <div style={styles.errorAlert}>{error}</div>}

                    <form onSubmit={forgotEmailSubmitHandler}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                required
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="name@gmail.com"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>

                    <div style={styles.switchMode}>
                        <button style={styles.switchBtn} onClick={backToLogin} type="button">Back to Sign In</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'forgot-reset') {
        return (
            <div className="container animate-fade-in" style={styles.page}>
                <div style={styles.formContainer}>
                    <h1 style={styles.title}>Enter Reset Code</h1>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        {infoMessage || `If an account exists for ${forgotEmail}, a reset code has been sent.`}
                    </p>

                    {error && <div style={styles.errorAlert}>{error}</div>}

                    <form onSubmit={resetPasswordSubmitHandler}>
                        <div className="input-group">
                            <label>Reset Code</label>
                            <input
                                type="text"
                                required
                                inputMode="numeric"
                                maxLength={6}
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem' }}
                            />
                        </div>
                        <div className="input-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="********"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={submitting || resetCode.length !== 6}>
                            {submitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div style={styles.switchMode}>
                        <button style={styles.switchBtn} onClick={backToLogin} type="button">Back to Sign In</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'otp') {
        return (
            <div className="container animate-fade-in" style={styles.page}>
                <div style={styles.formContainer}>
                    <h1 style={styles.title}>Verify Your Email</h1>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
                    </p>

                    {error && <div style={styles.errorAlert}>{error}</div>}

                    <form onSubmit={otpSubmitHandler}>
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                required
                                inputMode="numeric"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={submitting || otpCode.length !== 6}>
                            {submitting ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </form>

                    <div style={styles.switchMode}>
                        Didn't get a code?
                        <button style={styles.switchBtn} onClick={resendOtpHandler} disabled={resending} type="button">
                            {resending ? 'Sending...' : 'Resend code'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={styles.page}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>{isLogin ? 'Sign In' : 'Create Account'}</h1>

                {error && <div style={styles.errorAlert}>{error}</div>}

                <form onSubmit={submitHandler}>
                    {!isLogin && (
                        <div className="input-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                required 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Your Name"
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="name@gmail.com"
                        />
                    </div>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <label>Password</label>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="********"
                            style={{ paddingRight: '2.5rem' }}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '35px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>

                    {isLogin && (
                        <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                style={styles.forgotBtn}
                                onClick={() => { setStep('forgot-email'); setForgotEmail(email); setError(''); }}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={submitting}>
                        {submitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
                    </button>
                </form>

                <GoogleSignInButton />

                <div style={styles.switchMode}>
                    {isLogin ? 'New to Noble Rain?' : 'Already have an account?'}
                    <button
                        style={styles.switchBtn}
                        onClick={() => setIsLogin(!isLogin)}
                        type="button"
                    >
                        {isLogin ? 'Create an account' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '3rem 1rem',
    },
    formContainer: {
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--color-bg-subtle)',
        padding: '2.5rem',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid var(--color-border)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '2rem',
    },
    submitBtn: {
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid transparent',
        marginTop: '1.5rem',
        padding: '0.8rem',
    },
    switchMode: {
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: 'var(--color-text-muted)',
    },
    switchBtn: {
        marginLeft: '0.5rem',
        color: 'var(--color-text-main)',
        fontWeight: '600',
        textDecoration: 'underline',
    },
    forgotBtn: {
        color: 'var(--color-text-muted)',
        fontSize: '0.85rem',
        textDecoration: 'underline',
    },
    errorAlert: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
    }
};

export default LoginPage;
