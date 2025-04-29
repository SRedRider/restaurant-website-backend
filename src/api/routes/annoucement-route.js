const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/annoucement-controller');

// Add a new announcement
router.post('/', announcementController.addAnnouncement);

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Get an announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Delete an announcement
router.delete('/:id', announcementController.deleteAnnouncement);

// Edit an announcement
router.put('/:id', announcementController.editAnnouncement);

module.exports = router;