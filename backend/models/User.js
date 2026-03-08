const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
  full_name:   { type: DataTypes.STRING,  allowNull: false },
  email:       { type: DataTypes.STRING,  unique: true,  allowNull: false },
  password:    { type: DataTypes.STRING,  allowNull: false },
  role:        { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' },
  address:     { type: DataTypes.TEXT },
  phone:       { type: DataTypes.STRING },
  birthdate:   { type: DataTypes.DATEONLY },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'users', timestamps: true, underscored: true });

module.exports = User;