const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/annoucement-controller');
const multer = require('multer');
const path = require('path');
const { isAdmin, checkVisibleAccess } = require('../../middleware/auth-middleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Set upload folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9); // Unique name
        cb(null, uniqueName + ext); // Save with correct extension
    }
});

// Add error handling to multer configuration
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    }
});

// Middleware to handle multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
    } else if (err) {
        console.error('File upload error:', err);
        return res.status(err.status || 500).json({ error: err.message });
    }
    next();
});

// Add a new announcement
router.post('/', isAdmin, upload.single('image'), announcementController.addAnnouncement);

// Get all announcements
router.get('/', checkVisibleAccess, announcementController.getAllAnnouncements);

// Get an announcement by ID
router.get('/:id', checkVisibleAccess, announcementController.getAnnouncementById);

// Delete an announcement
router.delete('/:id', isAdmin, announcementController.deleteAnnouncement);

// Edit an announcement
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), announcementController.editAnnouncement);

module.exports = router;