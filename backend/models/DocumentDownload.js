const { DataTypes } = require('sequelize');
const db = require('../config/db');

const DocumentDownload = db.define('DocumentDownload', {
  request_id:     { type: DataTypes.INTEGER, allowNull: false },
  user_id:        { type: DataTypes.INTEGER, allowNull: false },
  download_count: { type: DataTypes.INTEGER, defaultValue: 1 },
  last_downloaded: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  'document_downloads',
  timestamps: true,
  underscored: true,
});

module.exports = DocumentDownload;
