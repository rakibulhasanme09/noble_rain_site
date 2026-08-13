const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', protect, admin, upload.single('image'), (req, res) => {
    res.json({ imageUrl: `/${req.file.path.replace(/\\/g, '/')}` });
});

router.post('/multiple', protect, admin, upload.array('images', 8), (req, res) => {
    const imageUrls = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);
    res.json({ imageUrls });
});

module.exports = router;
