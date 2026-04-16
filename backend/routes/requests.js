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

// Temporary debug endpoint - remove after testing
router.get('/debug/tables', async (req, res) => {
  try {
    const { DocumentDownload } = require('../models/index');
    const tables = await DocumentDownload.sequelize.query("SHOW TABLES", { type: DocumentDownload.sequelize.QueryTypes.SHOWTABLES });
    res.json({ tables, documentDownloadsTable: tables.includes('document_downloads') });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;