const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/annoucement-controller');
const multer = require('multer');
const path = require('path');

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

const upload = multer({ storage });

// Add a new announcement
router.post('/', upload.single('image'), announcementController.addAnnouncement);

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Get an announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Delete an announcement
router.delete('/:id', announcementController.deleteAnnouncement);

// Edit an announcement
router.put('/:id', upload.single('image'), announcementController.editAnnouncement);

module.exports = router;