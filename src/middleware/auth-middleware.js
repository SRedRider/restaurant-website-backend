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

const isAdminOrUser = (req, res, next) => {
    // Check for admin first
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check if the user is admin or regular user
        if (decoded.role === 'admin' || decoded.role === 'customer') {
            return next(); 
        }

        return res.status(403).json({ message: 'Access forbidden: Admins or Users only' });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const checkVisibleAccess = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token === undefined || token === '') {
        req.isAdmin = false; // If no token or empty token, treat as non-admin
        console.log('No token provided or empty token, user is treated as non-admin');
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Check if user is admin
            if (decoded.role === 'admin') {
                req.isAdmin = true; // If admin, set isAdmin to true
                console.log('User is admin');
            } else {
                req.isAdmin = false; // If not admin, set isAdmin to false
                console.log('User is not admin');
            }
        } catch (error) {
            console.log('Invalid or expired token, user is treated as non-admin');
            req.isAdmin = false; // Treat as non-admin if token is invalid or expired
        }
    }

    next(); // Proceed to the next middleware/controller
};

module.exports = {
    isAdmin,
    isAdminOrUser,
    checkVisibleAccess
};
