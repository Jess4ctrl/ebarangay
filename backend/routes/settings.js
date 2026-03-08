const router   = require('express').Router();
const {
  getSettings,
  updateSettings,
  uploadSignature,
} = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `signature-${Date.now()}.png`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get('/',           protect, adminOnly, getSettings);
router.put('/',           protect, adminOnly, updateSettings);
router.post('/signature', protect, adminOnly, upload.single('signature'), uploadSignature);

module.exports = router;