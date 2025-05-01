const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const userModel = require('../models/user-model');
require('dotenv').config();

// Helper function to read email templates
const readTemplate = (fileName, replacements) => {
    let template = fs.readFileSync(path.join(__dirname, '../../email-templates', fileName), 'utf-8');
    for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, replacements[key]);
    }
    return template;
};


// Register a new user
const registerUser = async (req, res) => {
    const { email, name, password, retype_password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ message: 'Email already in use.' });
    }

    if (!email || !name || !password) {
        return res.status(400).json({ message: 'Email, name, and password are required.' });
    }

    if (password !== retype_password) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user in the database
    const userId = await userModel.createUser({
        email, name, password: hashedPassword, role: 'customer', verification_token: verificationToken
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

    const emailHtml = readTemplate('verification.html', { verification_link: verificationLink });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: emailHtml,
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

    res.status(200).json({ message: 'Login successful', token, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
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

    if (user.status !== 'enabled') {
        return res.status(400).json({ message: 'Account is disabled.' });
    }

    if (!user.verified) {
        return res.status(400).json({ message: 'Email not verified.' });
    }

    // Check if the user has a reset token already
    if (user.reset_token && new Date() < new Date(user.reset_token_expiry)) {
        return res.status(400).json({ message: 'A password reset link has already been sent. Please check your email.' });
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

    const emailHtml = readTemplate('password-reset.html', { reset_link: resetLink });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: emailHtml, // Send the HTML email
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
        const { newPassword, retypePassword } = req.body;

        console.log("Token:", token);  // Log the token
        console.log("New Password:", newPassword);  // Log the new password

        // Find user by reset token
        const user = await userModel.getUserByResetToken(token);

        if (!user || new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }

        if (newPassword !== retypePassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
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

// Get current user by token
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            verified: user.verified
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update current user
const updateCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const { email, name, password, retypePassword } = req.body;

        // Validate input
        if (!email || !name || !password) {
            return res.status(400).json({ message: 'Email, name, and password are required.' });
        }

        if (password !== retypePassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check if the new email already exists
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Update user in the database
        await userModel.updateUser(userId, {
            email,
            name,
            password: hashedPassword,
            verification_token: verificationToken,
            verified: false // Reset verification status
        });

        // Send email with new verification link
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const verificationLink = `https://users.metropolia.fi/~quangth/restaurant/verify.html?token=${verificationToken}`;

        const emailHtml = readTemplate('update-verification.html', { verification_link: verificationLink });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Update Verification',
            html: emailHtml,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send verification email.' });
            }
            res.status(200).json({ message: 'User updated successfully! Please verify your new email address.' });
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getCurrentUser,
    updateCurrentUser
};
