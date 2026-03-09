const { ServiceRequest, User } = require('../models/index');
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
