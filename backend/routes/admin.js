const router   = require('express').Router();
const {
  getAllRequests,
  getAllUsers,
  updateRequest,
  generatePDF,
  uploadDocument,
  getDownloadStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/requests',                    protect, adminOnly, getAllRequests);
router.get('/users',                       protect, adminOnly, getAllUsers);
router.get('/downloads/stats',             protect, adminOnly, getDownloadStats);
router.patch('/requests/:id',              protect, adminOnly, updateRequest);
router.post('/requests/:id/generate',      protect, adminOnly, generatePDF);
router.post('/requests/:id/upload',        protect, adminOnly, upload.single('document'), uploadDocument);

module.exports = router;