const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to check if user is authenticated and is an Admin
const isAdmin = (req, res, next) => {
    // Get token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user's role is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Admins only' });
        }

        // Pass user data to the next middleware/handler
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    isAdmin
};
