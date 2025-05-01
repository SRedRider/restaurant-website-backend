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

// Update user details
const updateUser = async (userId, updatedFields) => {
    const fields = Object.keys(updatedFields);
    const values = Object.values(updatedFields);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    const [result] = await promisePool.query(query, [...values, userId]);
    return result.affectedRows > 0;
};

// Add favourite item for a user
const addFavourite = async (userId, itemId, type) => {
    const [result] = await promisePool.query(
        'INSERT INTO favourites (user_id, item_id, type) VALUES (?, ?, ?)',
        [userId, itemId, type]
    );
    return result.insertId;
};

// Remove favourite item for a user
const removeFavourite = async (userId, itemId, type) => {
    const [result] = await promisePool.query(
        'DELETE FROM favourites WHERE user_id = ? AND item_id = ? AND type = ?',
        [userId, itemId, type]
    );
    return result.affectedRows > 0;
};

// Get all favourite items for a user
const getFavourites = async (userId) => {
    const [rows] = await promisePool.query(
        'SELECT item_id, type FROM favourites WHERE user_id = ?',
        [userId]
    );
    return rows;
};

// Check if an item exists by ID and type
const checkItemExists = async (itemId, type) => {
    const table = type === 'item' ? 'items' : 'meals';
    const [rows] = await promisePool.query(
        `SELECT COUNT(*) as count FROM ${table} WHERE id = ?`,
        [itemId]
    );
    return rows[0].count > 0;
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
    getUserById,
    updateUser,
    addFavourite,
    removeFavourite,
    getFavourites,
    checkItemExists
};
