const rateLimit = require('express-rate-limit');

// Login/registration/OTP endpoints are brute-force and enumeration targets,
// so they get a tighter window than the rest of the API.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later.' },
});

// OTP verification/reset endpoints are guessable 6-digit codes, so they get
// an even tighter cap to make brute-forcing the code impractical.
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later.' },
});

module.exports = { authLimiter, otpLimiter };
