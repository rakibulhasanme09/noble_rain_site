const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendMail } = require('../utils/mailer');
const { otpEmail, welcomeEmail, passwordResetEmail } = require('../utils/emailTemplates');

const OTP_TTL_MS = 10 * 60 * 1000;

// crypto.randomInt is cryptographically strong, unlike Math.random(),
// which matters here since OTPs guard account verification and password resets.
const generateOtpCode = () => String(crypto.randomInt(100000, 1000000));

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendOtpToUser = async (user) => {
    const code = generateOtpCode();
    user.otp = { code, expiresAt: new Date(Date.now() + OTP_TTL_MS) };
    await user.save();

    const { subject, html } = otpEmail(user.name, code);
    await sendMail({ to: user.email, subject, html });
};

const authResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    phone: user.phone,
    defaultShippingAddress: user.defaultShippingAddress,
    token: generateToken(user._id),
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(403);
            throw new Error('Please verify your account using the OTP sent to your email before logging in');
        }
        res.json(authResponse(user));
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

// @desc    Register a new user - creates an unverified account and emails an OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!password || password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        isVerified: false,
    });

    if (user) {
        await sendOtpToUser(user);
        res.status(201).json({
            email: user.email,
            message: 'Account created. Please check your email for the verification code.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Verify signup OTP and activate the account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Account is already verified');
    }

    if (!user.otp || !user.otp.code || user.otp.code !== code || new Date(user.otp.expiresAt) < new Date()) {
        res.status(400);
        throw new Error('Invalid or expired verification code');
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const { subject, html } = welcomeEmail(user.name);
    sendMail({ to: user.email, subject, html }).catch((err) => console.error('Welcome email failed:', err));

    res.json(authResponse(user));
};

// @desc    Resend the signup verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Account is already verified');
    }

    await sendOtpToUser(user);
    res.json({ message: 'A new verification code has been sent to your email.' });
};

// @desc    Request a password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond the same way whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails.
    const genericResponse = { message: 'If an account exists for that email, a reset code has been sent.' };

    if (!user || !user.password) {
        return res.json(genericResponse);
    }

    const code = generateOtpCode();
    user.passwordResetOtp = { code, expiresAt: new Date(Date.now() + OTP_TTL_MS) };
    await user.save();

    const { subject, html } = passwordResetEmail(user.name, code);
    await sendMail({ to: user.email, subject, html });

    res.json(genericResponse);
};

// @desc    Reset password using the emailed OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const user = await User.findOne({ email });

    if (!user || !user.passwordResetOtp || !user.passwordResetOtp.code || user.passwordResetOtp.code !== code || new Date(user.passwordResetOtp.expiresAt) < new Date()) {
        res.status(400);
        throw new Error('Invalid or expired reset code');
    }

    user.password = newPassword;
    user.passwordResetOtp = undefined;
    await user.save();

    res.json(authResponse(user));
};

// @desc    Sign in or register using a Google ID token
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        res.status(400);
        throw new Error('Missing Google credential');
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        res.status(500);
        throw new Error('Google sign-in is not configured');
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        res.status(401);
        throw new Error('Invalid Google credential');
    }

    if (!payload || !payload.email_verified) {
        res.status(401);
        throw new Error('Google account email is not verified');
    }

    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
        let changed = false;
        if (!user.googleId) { user.googleId = googleId; changed = true; }
        if (!user.isVerified) { user.isVerified = true; changed = true; }
        if (changed) await user.save();
    } else {
        user = await User.create({ name, email, googleId, isVerified: true });
    }

    res.json(authResponse(user));
};

module.exports = { authUser, registerUser, verifyOtp, resendOtp, forgotPassword, resetPassword, googleAuth };
