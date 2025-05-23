const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Discord = require('../../services/discordService');
const authModel = require('../models/auth-model');
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
    const existingUser = await authModel.getUserByEmail(email);
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
    const userId = await authModel.createUser({
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
            Discord.sendErrorToDiscord(`(AUTH - registerUser - mail) ${error}`);  // Send error message to Discord
            return res.status(500).json({ message: 'Failed to send verification email.' });
        }
        res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
        Discord.sendMessage(`New user registered: ${name} (${email})`); // Send message to Discord
    });
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await authModel.getUserByEmail(email);
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

    // Update last login time
    await authModel.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

// Verify user email
const verifyEmail = async (req, res) => {
    const { token } = req.query;
    const isVerified = await authModel.verifyUser(token);

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
    const user = await authModel.getUserByEmail(email);
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
    await authModel.updateResetToken(user.id, resetToken, resetTokenExpiry);

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
        const user = await authModel.getUserByResetToken(token);

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
        await authModel.updatePassword(user.id, hashedPassword);
        await authModel.clearResetToken(user.id);

        res.status(200).json({ message: 'Your password has been successfully reset.' });
    } catch (error) {
        console.error("Error resetting password:", error);  // Log the error
        Discord.sendErrorToDiscord(`(AUTH - resetPassword) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'An error occurred while resetting the password.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await authModel.getAllUsers(); // Fetch users from the model
        res.status(200).json(users);  // Return the users as a JSON response
    } catch (error) {
        console.error('Error fetching users:', error);
        Discord.sendErrorToDiscord(`(AUTH - getAllUsers) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get current user by token
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const user = await authModel.getUserById(userId);

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
        Discord.sendErrorToDiscord(`(AUTH - getCurrentUser) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update current user
const updateCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const { email, name, password, retypePassword } = req.body;

        // Validate input
        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required.' });
        }

        if (password) {
            if (password !== retypePassword) {
                return res.status(400).json({ message: 'Passwords do not match.' });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check if the new email already exists
        const existingUser = await authModel.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hash the new password if provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Generate a new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');


        // Update user in the database
        await authModel.updateCurrentUser(userId,email,name,hashedPassword,verificationToken,false); // Reset verification status
        

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
        Discord.sendErrorToDiscord(`(AUTH - updateCurrentUser) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Add favourite item for a user
const addFavouriteItem = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const { itemId, type } = req.body;

        if (!itemId || !type || !['item', 'meal'].includes(type)) {
            return res.status(400).json({ message: 'Invalid item ID or type.' });
        }

        // Check if the item exists
        const itemExists = await authModel.checkItemExists(itemId, type);
        if (!itemExists) {
            return res.status(404).json({ message: 'Item does not exist.' });
        }

        // Check if the favourite already exists
        const existingFavourite = await authModel.getFavourites(userId);
        const isDuplicate = existingFavourite.some(fav => fav.item_id === itemId && fav.type === type);

        if (isDuplicate) {
            return res.status(400).json({ message: 'This item is already in your favourites.' });
        }

        const favouriteId = await authModel.addFavourite(userId, itemId, type);
        res.status(201).json({ message: 'Favourite added successfully.', favouriteId });
    } catch (error) {
        console.error('Error adding favourite:', error);
        Discord.sendErrorToDiscord(`(AUTH - addFavouriteItem) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Remove favourite item for a user
const removeFavouriteItem = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const { itemId, type } = req.body;

        if (!itemId || !type || !['item', 'meal'].includes(type)) {
            return res.status(400).json({ message: 'Invalid item ID or type.' });
        }

        const isRemoved = await authModel.removeFavourite(userId, itemId, type);
        if (isRemoved) {
            res.status(200).json({ message: 'Favourite removed successfully.' });
        } else {
            res.status(404).json({ message: 'Favourite not found.' });
        }
    } catch (error) {
        console.error('Error removing favourite:', error);
        Discord.sendErrorToDiscord(`(AUTH - removeFavouriteItem) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all favourite items for a user
const getFavouriteItems = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token by middleware
        const favourites = await authModel.getFavourites(userId);
        res.status(200).json(favourites);
    } catch (error) {
        console.error('Error fetching favourites:', error);
        Discord.sendErrorToDiscord(`(AUTH - getFavouriteItems) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get a user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await authModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        Discord.sendErrorToDiscord(`(AUTH - getUserById) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update a user by ID
const updateUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const { email, name, role, status } = req.body;
        const requested = req.user;

        if (!email || !name || !role || !status) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const updated = await authModel.updateUser(userId, email, name, role, status, requested.userId);

        if (!updated) {
            return res.status(404).json({ message: 'User not found or update failed.' });
        }

        res.status(200).json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        Discord.sendErrorToDiscord(`(AUTH - updateUserById) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a user by ID
const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const deleted = await authModel.deleteUser(userId);

        if (!deleted) {
            return res.status(404).json({ message: 'User not found or delete failed.' });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        Discord.sendErrorToDiscord(`(AUTH - deleteUserById) ${error}`);  // Send error message to Discord
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update the removeFavouriteItemById function to use the model
const removeFavouriteItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await authModel.removeFavouriteById(id);

        if (!isDeleted) {
            return res.status(404).json({ message: 'Favourite item not found' });
        }

        res.status(200).json({ message: 'Favourite item deleted successfully' });
    } catch (error) {
        console.error('Error deleting favourite item:', error);
        res.status(500).json({ message: 'An error occurred while deleting the favourite item', error });
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
    updateCurrentUser,
    addFavouriteItem,
    removeFavouriteItem,
    getFavouriteItems,
    getUserById,
    updateUserById,
    deleteUserById,
    removeFavouriteItemById
};
