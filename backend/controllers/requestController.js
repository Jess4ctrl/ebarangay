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

    console.log('🔄 Download tracking called:', { request_id: request_id, request_id_type: typeof request_id, user_id });

    try {
      // Try to use DocumentDownload table
      const existingDownload = await DocumentDownload.findOne({
        where: { request_id: parseInt(request_id), user_id }
      });

      console.log('🔍 Existing download found:', !!existingDownload);

      if (existingDownload) {
        const newCount = existingDownload.download_count + 1;
        const updatedDownload = await existingDownload.update({
          download_count: newCount,
          last_downloaded: new Date()
        });
        console.log('✅ Download count incremented:', { old: existingDownload.download_count, new: newCount });
        return res.json({
          message: 'Download tracked',
          download: updatedDownload
        });
      } else {
        const newDownload = await DocumentDownload.create({
          request_id: parseInt(request_id),
          user_id,
          download_count: 1,
          last_downloaded: new Date()
        });
        console.log('✅ New download record created:', { id: newDownload.id, request_id: newDownload.request_id });
        return res.status(201).json({
          message: 'Download tracked',
          download: newDownload
        });
      }
    } catch (dbError) {
      console.log('⚠️ Database table not available, using fallback method:', dbError.message);

      // Fallback: Store download info in ServiceRequest metadata
      const { ServiceRequest } = require('../models/index');
      const request = await ServiceRequest.findByPk(parseInt(request_id));

      if (request) {
        // Parse existing download data from admin_remarks or create new
        let downloadData = {};
        try {
          const remarks = request.admin_remarks || '{}';
          downloadData = JSON.parse(remarks);
        } catch (e) {
          downloadData = {};
        }

        // Initialize user downloads if not exists
        if (!downloadData.downloads) downloadData.downloads = {};
        if (!downloadData.downloads[user_id]) downloadData.downloads[user_id] = 0;

        // Increment download count
        downloadData.downloads[user_id] += 1;
        downloadData.lastDownload = new Date().toISOString();

        // Save back to admin_remarks
        await request.update({
          admin_remarks: JSON.stringify(downloadData)
        });

        console.log('✅ Download tracked via fallback:', { user_id, count: downloadData.downloads[user_id] });

        return res.json({
          message: 'Download tracked (fallback)',
          count: downloadData.downloads[user_id]
        });
      }
    }

    res.status(404).json({ message: 'Request not found' });
  } catch (err) {
    console.error('❌ Download tracking error:', err);
    res.status(500).json({ message: 'Server error tracking download' });
  }
};;
