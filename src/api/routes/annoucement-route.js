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

/**
 * @api {post} /api/v1/announcements Add a new announcement
 * @apiName AddAnnouncement
 * @apiGroup Announcements
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiBody {String} title Title of the announcement. (Required)
 * @apiBody {String} content Content of the announcement. (Required)
 * @apiBody {String} visible Visibility status of the announcement. (Required)
 * @apiBody {File} image Image file for the announcement. (Required)
 * 
 * @apiSuccess {String} message Success message.
 * @apiSuccess {String} image_url URL of the uploaded image.
 * 
 * 
 * @apiError {String} error Error message.
 * @apiError {String} details Detailed error message.
 * 
 */
router.post('/', isAdmin, upload.single('image'), announcementController.addAnnouncement);

/**
 * @api {get} /api/v1/announcements/ Get all announcements
 * @apiName GetAllAnnouncements
 * @apiGroup Announcements
 * @apiPermission Public
 * 
 * @apiSuccess {Object[]} announcements List of announcements.
 * @apiSuccess {Number} announcements.id ID of the announcement.
 * @apiSuccess {String} announcements.title Title of the announcement.
 * @apiSuccess {String} announcements.content Content of the announcement.
 * @apiSuccess {String} announcements.image_url URL of the announcement image.
 * 
 * 
 * @apiError {String} message Error message.
 * 
 */
router.get('/', checkVisibleAccess, announcementController.getAllAnnouncements);

/**
 * @api {get} /api/v1/announcements/:id Get an announcement by ID
 * @apiName GetAnnouncementById
 * @apiGroup Announcements
 * @apiPermission Public
 * 
 * @apiParam {Number} id ID of the announcement. (Required)
 * 
 * @apiSuccess {Number} id ID of the announcement.
 * @apiSuccess {String} title Title of the announcement.
 * @apiSuccess {String} content Content of the announcement.
 * @apiSuccess {String} image_url URL of the announcement image.
 * 
 * 
 * @apiError {String} message Error message.
 * 
 */
router.get('/:id', checkVisibleAccess, announcementController.getAnnouncementById);

/**
 * @api {delete} /api/v1/announcements/:id Delete an announcement
 * @apiName DeleteAnnouncement
 * @apiGroup Announcements
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiParam {Number} id ID of the announcement. (Required)
 * 
 * @apiSuccess {String} message Success message.
 * 
 * 
 * @apiError {String} error Error message.
 * 
 */
router.delete('/:id', isAdmin, announcementController.deleteAnnouncement);

/**
 * @api {put} /api/v1/announcements/:id Edit an announcement
 * @apiName EditAnnouncement
 * @apiGroup Announcements
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiParam {Number} id ID of the announcement. (Required)
 * 
 * @apiBody {String} title Title of the announcement. (Required)
 * @apiBody {String} content Content of the announcement. (Required)
 * @apiBody {String} visible Visibility status of the announcement. (Required)
 * @apiBody {File} image Image file for the announcement. (Optional)
 * 
 * @apiSuccess {String} message Success message.
 * @apiSuccess {String} image_url URL of the updated image.
 * 
 * 
 * @apiError {String} error Error message.
 * 
 */
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), announcementController.editAnnouncement);

module.exports = router;