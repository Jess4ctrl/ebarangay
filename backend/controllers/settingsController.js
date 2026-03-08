const { BarangaySettings } = require('../models/index');
const path = require('path');
const fs   = require('fs');

exports.getSettings = async (req, res) => {
  try {
    let settings = await BarangaySettings.findOne();
    if (!settings) {
      settings = await BarangaySettings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { barangay_name, municipality, province, captain_name, captain_position } = req.body;
    let settings = await BarangaySettings.findOne();
    if (!settings) {
      settings = await BarangaySettings.create({});
    }
    await settings.update({
      barangay_name,
      municipality,
      province,
      captain_name,
      captain_position,
    });
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

exports.uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No signature uploaded' });
    }
    let settings = await BarangaySettings.findOne();
    if (!settings) {
      settings = await BarangaySettings.create({});
    }

    // Delete old signature if exists
    if (settings.signature_path) {
      const oldPath = path.join(__dirname, '../', settings.signature_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await settings.update({
      signature_path: `uploads/${req.file.filename}`,
    });

    res.json({
      message:       'Signature uploaded successfully',
      signaturePath: `uploads/${req.file.filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading signature' });
  }
};