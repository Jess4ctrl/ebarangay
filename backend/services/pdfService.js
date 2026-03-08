const PDFDocument      = require('pdfkit');
const fs               = require('fs');
const path             = require('path');
const { BarangaySettings } = require('../models/index');

const generateDocument = async (user, request) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch barangay settings
      let settings = await BarangaySettings.findOne();
      if (!settings) {
        settings = {
          barangay_name:    'Barangay Name',
          municipality:     'Municipality',
          province:         'Province',
          captain_name:     'Barangay Captain',
          captain_position: 'Barangay Captain',
          signature_path:   null,
        };
      }

      const doc      = new PDFDocument({ size: 'A4', margin: 60 });
      const filename = `${request.request_id}.pdf`;
      const outPath  = path.join(__dirname, '../uploads', filename);
      const stream   = fs.createWriteStream(outPath);

      doc.pipe(stream);

      // ── HEADER ──
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Republic of the Philippines',      { align: 'center' })
        .text(`Province of ${settings.province}`, { align: 'center' })
        .text(`Municipality of ${settings.municipality}`, { align: 'center' })
        .text(`Barangay ${settings.barangay_name}`, { align: 'center' });

      doc.moveDown(0.5);
      doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
      doc.moveDown(1);

      // ── TITLE ──
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(request.service_type.toUpperCase(), {
          align:     'center',
          underline: true,
        });

      doc.moveDown(1.5);

      // ── BODY ──
      doc.fontSize(12).font('Helvetica');

      if (request.service_type === 'Barangay Clearance') {
        doc.text(
          `This is to certify that ${user.full_name}, of legal age, ` +
          `a resident of ${user.address || '[Address]'}, is personally known to me ` +
          `to be a person of good moral character and has no derogatory record ` +
          `on file in this barangay.`,
          { align: 'justify', lineGap: 4 }
        );
      } else if (request.service_type === 'Certificate of Indigency') {
        doc.text(
          `This is to certify that ${user.full_name}, of legal age, ` +
          `a resident of ${user.address || '[Address]'}, belongs to an indigent ` +
          `family in this barangay and is in need of assistance.`,
          { align: 'justify', lineGap: 4 }
        );
      } else if (request.service_type === 'Certificate of Residency') {
        doc.text(
          `This is to certify that ${user.full_name}, of legal age, ` +
          `is a bonafide resident of ${user.address || '[Address]'} ` +
          `and has been residing in this barangay for a considerable period of time.`,
          { align: 'justify', lineGap: 4 }
        );
      } else if (request.service_type === 'Barangay Business Permit') {
        doc.text(
          `This is to certify that ${user.full_name}, of legal age, ` +
          `a resident of ${user.address || '[Address]'}, has been granted permission ` +
          `to operate a business within the jurisdiction of this barangay.`,
          { align: 'justify', lineGap: 4 }
        );
      } else {
        doc.text(
          `This is to certify that ${user.full_name}, of legal age, ` +
          `a resident of ${user.address || '[Address]'}, has filed a request ` +
          `for ${request.service_type} with this barangay office.`,
          { align: 'justify', lineGap: 4 }
        );
      }

      doc.moveDown(1);
      doc.text(`Purpose: ${request.purpose || 'N/A'}`, { lineGap: 4 });
      doc.moveDown(0.5);
      doc.text(
        `This certification is issued upon the request of the above-named person ` +
        `for whatever legal purpose it may serve.`,
        { align: 'justify', lineGap: 4 }
      );

      doc.moveDown(1);
      doc.text(
        `Issued this ${new Date().toLocaleDateString('en-PH', {
          year: 'numeric', month: 'long', day: 'numeric'
        })} at Barangay ${settings.barangay_name}.`,
        { lineGap: 4 }
      );

      // ── SIGNATURE ──
      doc.moveDown(2);

      const sigX = 350;
      let   sigY = doc.y;

      // Draw signature image if exists
      if (settings.signature_path) {
        const sigFullPath = path.join(__dirname, '../', settings.signature_path);
        if (fs.existsSync(sigFullPath)) {
          doc.image(sigFullPath, sigX, sigY, { width: 120, height: 60 });
          sigY += 65;
        }
      }

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('______________________________', sigX, sigY, { lineBreak: false });

      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(settings.captain_name, sigX, doc.y + 5);

      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(settings.captain_position, sigX, doc.y);

      // ── FOOTER ──
      doc.moveDown(3);
      doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('gray')
        .text(`Request ID: ${request.request_id}`, { align: 'center' })
        .text(`Generated: ${new Date().toLocaleString('en-PH')}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(`uploads/${filename}`));
      stream.on('error',  reject);

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateDocument };
