const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ServiceRequest = db.define('ServiceRequest', {
  request_id:   { type: DataTypes.STRING,  unique: true, allowNull: false },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  full_name:    { type: DataTypes.STRING,  allowNull: false },
  service_type: { type: DataTypes.STRING,  allowNull: false },
  purpose:      { type: DataTypes.TEXT },
  status: {
    type:         DataTypes.ENUM('pending', 'in-progress', 'completed', 'rejected'),
    defaultValue: 'pending'
  },
  admin_remarks: { type: DataTypes.TEXT },
  file_path:     { type: DataTypes.STRING },
}, {
  tableName:  'service_requests',
  timestamps: true,
  underscored: true,
});

module.exports = ServiceRequest;