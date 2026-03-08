const { DataTypes } = require('sequelize');
const db = require('../config/db');

const BarangaySettings = db.define('BarangaySettings', {
  barangay_name:    { type: DataTypes.STRING, defaultValue: 'Barangay Name' },
  municipality:     { type: DataTypes.STRING, defaultValue: 'Municipality' },
  province:         { type: DataTypes.STRING, defaultValue: 'Province' },
  captain_name:     { type: DataTypes.STRING, defaultValue: 'Barangay Captain' },
  captain_position: { type: DataTypes.STRING, defaultValue: 'Barangay Captain' },
  signature_path:   { type: DataTypes.STRING },
}, {
  tableName:   'barangay_settings',
  timestamps:  true,
  underscored: true,
});

module.exports = BarangaySettings;