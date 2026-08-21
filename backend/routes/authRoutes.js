const express = require('express');
const router = express.Router();
const { authUser, registerUser, verifyOtp, resendOtp, forgotPassword, resetPassword, googleAuth } = require('../controllers/authController');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, authUser);
router.post('/register', authLimiter, registerUser);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);
router.post('/google', authLimiter, googleAuth);

module.exports = router;
