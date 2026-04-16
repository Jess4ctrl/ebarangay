const User              = require('./User');
const ServiceRequest    = require('./ServiceRequest');
const BarangaySettings  = require('./BarangaySettings');
const DocumentDownload  = require('./DocumentDownload');

User.hasMany(ServiceRequest,   { foreignKey: 'user_id' });
ServiceRequest.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(DocumentDownload,   { foreignKey: 'user_id' });
DocumentDownload.belongsTo(User, { foreignKey: 'user_id' });

ServiceRequest.hasMany(DocumentDownload,   { foreignKey: 'request_id' });
DocumentDownload.belongsTo(ServiceRequest, { foreignKey: 'request_id' });

module.exports = { User, ServiceRequest, BarangaySettings, DocumentDownload };