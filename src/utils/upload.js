const multer = require('multer');
const path = require('path');

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../../../public/uploads/'); // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Save the file with its original name and add the file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
