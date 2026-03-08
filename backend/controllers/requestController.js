const { ServiceRequest } = require('../models/index');

// 1. Helper function for automated priority assignment
const getAutoPriority = (serviceType) => {
  switch (serviceType) {
    case 'Complaint':
      return 'urgent';
    case 'Certificate of Indigency':
      return 'high';
    default:
      return 'normal';
  }
};

exports.submitRequest = async (req, res) => {
  try {
    // 2. Remove 'priority' from the destructured body to ignore user input
    const { request_id, service_type, purpose, full_name } = req.body;

    // 3. Automatically determine priority based on service_type
    const assignedPriority = getAutoPriority(service_type);

    const request = await ServiceRequest.create({
      request_id,
      user_id:      req.user.id,
      service_type,
      purpose,
      priority:     assignedPriority, // Server-assigned priority
      full_name,
      status:       'pending',
    });

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
      where:   { user_id: req.user.id },
      order:   [['created_at', 'DESC']],
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