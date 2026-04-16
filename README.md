# E-Barangay Service Portal
An integrated web-based request management platform for barangay services.

## Live Demo
- Frontend: https://ebarangay-five.vercel.app
- Backend: https://ebarangay.mooo.com

## Tech Stack
- Frontend: React + Vite + Tailwind CSS (deployed on Vercel)
- Backend: Node.js + Express (deployed on Google Cloud VM)
- Database: MySQL 8.0
- Infrastructure: Docker + NGINX Load Balancer

## Requirements
- Node.js v18+
- MySQL 8.0
- Docker + Docker Compose (for containerized setup)

## How to Run Locally

### 1. Clone the repository
git clone https://github.com/Jess4ctrl/ebarangay.git
cd ebarangay

### 2. Set up environment variables
Create a `.env` file in the root directory:
DB_USER=root
DB_PASS=yourpassword
DB_NAME=ebarangay_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173

### 3. Run with Docker (recommended)
docker-compose up -d
This starts 4 containers: NGINX, backend1, backend2, and MySQL.

### 4. Run without Docker

#### Backend
cd backend
npm install
npm start

#### Frontend
cd frontend
npm install
npm run dev

### 5. Access the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Admin Account
- Email: alquezajess4@gmail.com
- Password: admin123

## Docker Support
Includes `Dockerfile` and `docker-compose.yml` for full containerized deployment.
The setup runs NGINX as a load balancer across two Node.js backend instances.

## Deployment
- Frontend auto-deploys via Vercel on every GitHub push
- Backend runs on Google Cloud VM with Docker Compose
- HTTPS enabled via Certbot + Let's Encrypt (ebarangay.mooo.com)
