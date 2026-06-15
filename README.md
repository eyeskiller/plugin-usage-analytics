# Plugin Usage Analytics Dashboard

This is the central web application and API server that collects anonymous usage statistics for your Minecraft plugins. It provides a secure, lightweight dashboard to monitor active servers, game versions, and event metrics.

## Features
- **Anonymous Tracking:** Stores randomly generated server UUIDs instead of IPs.
- **SQLite Database:** Zero-config database stored locally as `analytics.db`.
- **Beautiful UI:** Uses a custom glassmorphism design.
- **Update Checker API:** Automatically informs connected plugins if a newer version is available.
- **Secure:** Dashboard is protected behind a cookie-based login session.

## Setup Instructions

### 1. Requirements
- Node.js (v18+)
- PM2 (for production deployment)

### 2. Installation
```bash
npm install
```

### 3. Configuration
Create a `.env` file in the root directory and set your admin password:
```env
ADMIN_PASSWORD=your_secure_password
```

### 4. Running Locally
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the dashboard.

### 5. Production Deployment (PM2 + Nginx)
To run this in production on AlmaLinux:
```bash
npm run build
pm2 start npm --name "analytics-app" -- run start -- -p 8812
pm2 save
```
Then configure your Nginx reverse proxy to forward traffic to `http://127.0.0.1:8812`.

---
*Support our plugin development at [Ko-fi](https://ko-fi.com/eyeskiller)!*
