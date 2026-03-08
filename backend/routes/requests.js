const router = require('express').Router();
const {
  submitRequest,
  getMyRequests,
  getRequestById,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',     protect, submitRequest);
router.get('/my',   protect, getMyRequests);
router.get('/:id',  protect, getRequestById);

module.exports = router;