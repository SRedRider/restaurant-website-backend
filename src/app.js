const express = require('express');
const cors = require('cors'); // Import CORS middleware
require('dotenv').config(); // Load environment variables from .env

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse incoming JSON data
app.use('/public/uploads', express.static('public/uploads'));

// Routes
app.use('/api/v1/items', require('./api/routes/item-route')); // Handle item-related routes
app.use('/api/v1/meals', require('./api/routes/meal-route')); // Handle meal-related routes
app.use('/api/v1',  require('./api/routes/auth-route')); // Handle user-related routes
app.use('/api/v1/orders', require('./api/routes/order-route')); // Handle order-related routes
app.use('/api/v1/reservations', require('./api/routes/reservation-route'));
app.use('/api/v1/schedule', require('./api/routes/restaurant-route')); // Handle restaurant-related routes
app.use('/api/v1/announcements', require('./api/routes/annoucement-route')); // Handle announcement-related routes

// Handle 404 - Not Found
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Testing smee connection
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; // Export app for use in index.js
