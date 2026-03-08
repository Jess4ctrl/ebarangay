const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

// Import your database connection
const sequelize = require('./config/db'); 

const app = express();

// 1. DIRECTORY SETUP
// Ensures the uploads folder exists so the server doesn't crash or fail to find it
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. MIDDLEWARE
app.use(helmet({
  crossOriginResourcePolicy: false, // Required to allow React to display images/PDFs from the backend
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES - This allows you to access http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(uploadDir));

// 3. ROUTES
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));

// 4. DATABASE SYNC & START SERVER
const PORT = process.env.PORT || 5000;

// Syncing ensures your tables (Users, Requests, etc.) match your Sequelize models
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Serving uploads from: ${uploadDir}`);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
  });