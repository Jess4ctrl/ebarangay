const { ServiceRequest, User, DocumentDownload } = require('../models/index');
const { generateDocument }     = require('../services/pdfService');
const { sendStatusEmail }      = require('../services/emailService');
const sequelize = require('sequelize');

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      order: [['created_at', 'DESC']],
      raw: true,
    });

    let downloadCounts = {};
    let downloadLast = {};
    let documentDownloadTableAvailable = true;

    try {
      const downloadRows = await DocumentDownload.findAll({
        attributes: [
          'request_id',
          [sequelize.fn('SUM', sequelize.col('download_count')), 'total_downloads'],
          [sequelize.fn('MAX', sequelize.col('last_downloaded')), 'last_downloaded'],
        ],
        group: ['request_id'],
        raw: true,
      });

      downloadRows.forEach(row => {
        downloadCounts[row.request_id] = parseInt(row.total_downloads, 10) || 0;
        downloadLast[row.request_id] = row.last_downloaded || null;
      });
    } catch (dbError) {
      documentDownloadTableAvailable = false;
      console.log('⚠️ DocumentDownload table not available, falling back to admin_remarks:', dbError.message);
    }

    const formattedRequests = requests.map(request => {
      let downloadCount = downloadCounts[request.id] || 0;
      let lastDownloaded = downloadLast[request.id] || null;

      if (!documentDownloadTableAvailable) {
        try {
          const remarks = request.admin_remarks;
          if (remarks) {
            const downloadData = JSON.parse(remarks);
            if (downloadData.downloads) {
              downloadCount = Object.values(downloadData.downloads).reduce((sum, count) => sum + count, 0);
              lastDownloaded = downloadData.lastDownload || lastDownloaded;
            }
          }
        } catch (_) {
          // Ignore parsing errors
        }
      }

      return {
        ...request,
        download_count: downloadCount,
        last_downloaded: lastDownloaded,
      };
    });

    res.json(formattedRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order:      [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { status, admin_remarks } = req.body;
    const request = await ServiceRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await request.update({
      status:        status        || request.status,
      admin_remarks: admin_remarks || request.admin_remarks,
    });

    // Send email to resident on status change
    try {
      const resident = await User.findByPk(request.user_id);
      if (resident) {
        await sendStatusEmail(
          resident.email,
          resident.full_name,
          request.request_id,
          request.service_type,
          status,
          admin_remarks || '' // pass admin remarks so resident sees them in email
        );
      }
    } catch (emailErr) {
      console.error('Resident notification email error:', emailErr.message);
    }

    res.json({
      message: 'Request updated successfully',
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating request' });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const request = await ServiceRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const user = await User.findByPk(request.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filePath = await generateDocument(user, request);

    await request.update({
      file_path: filePath,
      status:    'completed',
    });

    // Send email to resident that document is ready
    try {
      await sendStatusEmail(
        user.email,
        user.full_name,
        request.request_id,
        request.service_type,
        'completed'
      );
    } catch (emailErr) {
      console.error('Completion email error:', emailErr.message);
    }

    res.json({
      message:  'Document generated successfully',
      filePath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating document' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const request = await ServiceRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    await request.update({
      file_path: `uploads/${req.file.filename}`,
      status:    'completed',
    });

    res.json({
      message:  'Document uploaded successfully',
      filePath: `uploads/${req.file.filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error uploading document' });
  }
};

exports.getDownloadStats = async (req, res) => {
  try {
    const downloads = await DocumentDownload.findAll({
      attributes: [
        'request_id',
        [sequelize.fn('SUM', sequelize.col('download_count')), 'total_downloads'],
        [sequelize.fn('MAX', sequelize.col('last_downloaded')), 'last_downloaded'],
      ],
      include: [{
        model: ServiceRequest,
        attributes: ['id', 'request_id', 'full_name', 'service_type', 'status'],
        required: true,
      }, {
        model: User,
        attributes: ['id', 'full_name', 'email'],
        required: true,
      }],
      group: ['ServiceRequest.id', 'User.id'],
      order: [[sequelize.fn('SUM', sequelize.col('download_count')), 'DESC']],
      subQuery: false,
      raw: true,
    });

    res.json(downloads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching download stats' });
  }
};
