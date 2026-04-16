const router = require('express').Router();
const {
  submitRequest,
  getMyRequests,
  getRequestById,
  trackDownload,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',                   protect, submitRequest);
router.get('/my',                  protect, getMyRequests);
router.get('/:id',                 protect, getRequestById);
router.post('/:request_id/download', protect, trackDownload);

module.exports = router;