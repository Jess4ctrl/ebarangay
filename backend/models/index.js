const User             = require('./User');
const ServiceRequest   = require('./ServiceRequest');
const BarangaySettings = require('./BarangaySettings');

User.hasMany(ServiceRequest,   { foreignKey: 'user_id' });
ServiceRequest.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { User, ServiceRequest, BarangaySettings };