const { ServiceRequest, User, DocumentDownload } = require('../models/index');
const { sendStatusEmail }      = require('../services/emailService');

exports.submitRequest = async (req, res) => {
  try {
    const { request_id, service_type, purpose, full_name } = req.body;

    const request = await ServiceRequest.create({
      request_id,
      user_id:      req.user.id,
      service_type,
      purpose,
      full_name,
      status: 'pending',
    });

    // Notify admin that a new request was submitted
    try {
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        await sendStatusEmail(
          admin.email,
          admin.full_name,
          request_id,
          service_type,
          'new-request',
          full_name // pass resident name so admin knows who submitted
        );
      }
    } catch (emailErr) {
      console.error('Admin notification email error:', emailErr.message);
    }

    res.status(201).json({
      message: 'Request submitted successfully',
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting request' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching request' });
  }
};

exports.trackDownload = async (req, res) => {
  try {
    const { request_id } = req.params;
    const user_id = req.user.id;

    console.log('🔄 Download tracking called:', { request_id, user_id });

    // Find existing download record
    const existingDownload = await DocumentDownload.findOne({
      where: { request_id, user_id }
    });

    if (existingDownload) {
      // Increment download count and update last downloaded time
      await existingDownload.update({
        download_count: existingDownload.download_count + 1,
        last_downloaded: new Date()
      });
      console.log('✅ Download count incremented:', existingDownload.download_count + 1);
      res.json({
        message: 'Download tracked',
        download: existingDownload
      });
    } else {
      // Create new download record
      const newDownload = await DocumentDownload.create({
        request_id,
        user_id,
        download_count: 1,
        last_downloaded: new Date()
      });
      console.log('✅ New download record created');
      res.status(201).json({
        message: 'Download tracked',
        download: newDownload
      });
    }
  } catch (err) {
    console.error('❌ Download tracking error:', err);
    res.status(500).json({ message: 'Server error tracking download' });
  }
};
