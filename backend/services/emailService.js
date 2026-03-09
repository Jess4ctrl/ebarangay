const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Messages sent to RESIDENTS when their request status changes
const residentStatusMessages = {
  'in-progress': 'Your request is now being processed by our barangay staff.',
  'completed':   'Your request has been approved! You may now log in to download your document.',
  'rejected':    'Unfortunately, your request was not approved. Please check the admin remarks in your dashboard or visit the barangay office for more information.',
};

// Email to RESIDENT when status changes (in-progress, completed, rejected)
const sendStatusEmail = async (to, name, requestId, serviceType, status, extra = '') => {
  try {

    // Admin notification — new request submitted by resident
    if (status === 'new-request') {
      await transporter.sendMail({
        from:    `"Barangay Service Portal" <${process.env.EMAIL_USER}>`,
        to,
        subject: `New Service Request Submitted - ${requestId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a5f; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Barangay Service Portal</h1>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1e293b; font-size: 18px;">New Request Submitted</h2>
              <p style="color: #64748b;">A resident has submitted a new service request.</p>
              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 4px 0; color: #64748b;"><strong>Request ID:</strong> ${requestId}</p>
                <p style="margin: 4px 0; color: #64748b;"><strong>Resident Name:</strong> ${extra}</p>
                <p style="margin: 4px 0; color: #64748b;"><strong>Service Type:</strong> ${serviceType}</p>
                <p style="margin: 4px 0; color: #64748b;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending</span></p>
              </div>
              <a href="${process.env.FRONTEND_URL}/admin"
                style="display: inline-block; background: #1e3a5f; color: white;
                       padding: 12px 24px; border-radius: 8px; text-decoration: none;
                       font-weight: bold; margin-top: 8px;">
                Review in Admin Dashboard
              </a>
            </div>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Barangay Service Portal — Do not reply to this email.</p>
            </div>
          </div>
        `,
      });
      console.log(`Admin notification email sent to ${to}`);
      return;
    }

    // Resident notification — status update
    await transporter.sendMail({
      from:    `"Barangay Service Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Update on Your Request - ${requestId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e3a5f; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Barangay Service Portal</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1e293b; font-size: 18px;">Request Status Update</h2>
            <p style="color: #64748b;">Hello, <strong>${name}</strong></p>
            <p style="color: #64748b;">${residentStatusMessages[status] || 'Your request status has been updated.'}</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0; color: #64748b;"><strong>Request ID:</strong> ${requestId}</p>
              <p style="margin: 4px 0; color: #64748b;"><strong>Service Type:</strong> ${serviceType}</p>
              <p style="margin: 4px 0; color: #64748b;">
                <strong>New Status:</strong>
                <span style="color: #2563eb; font-weight: bold; text-transform: capitalize;">${status}</span>
              </p>
              ${extra ? `<p style="margin: 4px 0; color: #64748b;"><strong>Admin Remarks:</strong> ${extra}</p>` : ''}
            </div>
            <a href="${process.env.FRONTEND_URL}/dashboard"
              style="display: inline-block; background: #1e3a5f; color: white;
                     padding: 12px 24px; border-radius: 8px; text-decoration: none;
                     font-weight: bold; margin-top: 8px;">
              View Dashboard
            </a>
          </div>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Barangay Service Portal — Do not reply to this email.</p>
          </div>
        </div>
      `,
    });
    console.log(`Status email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = { sendStatusEmail };
