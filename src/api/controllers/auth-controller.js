const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const userModel = require('../models/user-model');
require('dotenv').config();

// Register a new user
const registerUser = async (req, res) => {
    const { email, name, password, role } = req.body;

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user in the database
    const userId = await userModel.createUser({
        email, name, password: hashedPassword, role: role || 'customer', verification_token: verificationToken
    });

    // Send email with verification link
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verificationLink = `https://users.metropolia.fi/~quangth/restaurant/verify.html?token=${verificationToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Click the following link to verify your email: ${verificationLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send verification email.' });
        }
        res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
    });
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await userModel.getUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: 'Email does not exist' });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if the user is enabled and verified
    if (user.status !== 'enabled' || !user.verified) {
        return res.status(400).json({ message: 'Account is either disabled or not verified.' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
};

// Verify user email
const verifyEmail = async (req, res) => {
    const { token } = req.query;
    const isVerified = await userModel.verifyUser(token);

    if (isVerified) {
        res.status(200).json({ message: 'Your email has been successfully verified.' });
    } else {
        res.status(400).json({ message: 'Invalid or expired verification token.' });
    }
};

// Forgot Password functionality
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const user = await userModel.getUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: 'Email not found.' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token expires in 1 hour

    // Save reset token and expiry to the database
    await userModel.updateResetToken(user.id, resetToken, resetTokenExpiry);

    // Send email with reset token
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const resetLink = `https://users.metropolia.fi/~quangth/restaurant/new-password.html?token=${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the following link to reset your password: ${resetLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send reset email.' });
        }
        res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    });
};

// Reset password functionality
const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        console.log("Token:", token);  // Log the token
        console.log("New Password:", newPassword);  // Log the new password

        // Find user by reset token
        const user = await userModel.getUserByResetToken(token);

        if (!user || new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in the database and clear the reset token
        await userModel.updatePassword(user.id, hashedPassword);
        await userModel.clearResetToken(user.id);

        res.status(200).json({ message: 'Your password has been successfully reset.' });
    } catch (error) {
        console.error("Error resetting password:", error);  // Log the error
        res.status(500).json({ message: 'An error occurred while resetting the password.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers(); // Fetch users from the model
        res.status(200).json({ users });  // Return the users as a JSON response
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getAllUsers
};
