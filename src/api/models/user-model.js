const promisePool = require('../../utils/database');

// Check if the email already exists
const getUserByEmail = async (email) => {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// Create a new user
const createUser = async (user) => {
    const { email, name, password, role, verification_token } = user;
    const [result] = await promisePool.query(
        'INSERT INTO users (email, name, password, role, verification_token) VALUES (?, ?, ?, ?, ?)',
        [email, name, password, role, verification_token]
    );
    return result.insertId;
};

// Verify user by token
const verifyUser = async (token) => {
    // Check if the token is valid and the user's email is not already verified
    const [result] = await promisePool.query(
        'UPDATE users SET verified = TRUE WHERE verification_token = ? AND verified = FALSE', 
        [token]
    );
    return result.affectedRows > 0; // Returns true if the update was successful
};


// Update user reset token and expiry
const updateResetToken = async (userId, resetToken, resetTokenExpiry) => {
    const [result] = await promisePool.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, resetTokenExpiry, userId]
    );
    return result.affectedRows > 0;
};

// Get user by reset token
const getUserByResetToken = async (resetToken) => {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE reset_token = ?', [resetToken]);
    return rows[0];
};

// Update user password
const updatePassword = async (userId, newPassword) => {
    const [result] = await promisePool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
    return result.affectedRows > 0;
};

// Clear reset token
const clearResetToken = async (userId) => {
    const [result] = await promisePool.query('UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [userId]);
    return result.affectedRows > 0;
};

const getAllUsers = async () => {
    const [rows] = await promisePool.query('SELECT * FROM users');
    return rows;  // Return the list of users
};

// Get user by ID
const getUserById = async (userId) => {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
};

module.exports = {
    getUserByEmail,
    createUser,
    verifyUser,
    updateResetToken,
    getUserByResetToken,
    updatePassword,
    clearResetToken,
    getAllUsers,
    getUserById
};
