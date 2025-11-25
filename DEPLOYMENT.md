# PiShop AI Deployment Guide

This guide covers deploying your application to a **Raspberry Pi (Edge)** and **Cloud Server (AWS/DigitalOcean)**.

---

## Phase 1: Raspberry Pi Deployment (Manual Setup)

This method runs Nginx directly on the OS for maximum performance on low-resource hardware (Pi 3/4/5).

### 1. System Preparation
Open your terminal on the Raspberry Pi:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm nginx postgresql postgresql-contrib ufw -y
```

### 2. Database Setup (PostgreSQL)
Configure the database to match your `SiteConfig` defaults.

```bash
sudo -u postgres psql
```
Inside the SQL shell:
```sql
CREATE DATABASE pishop_db;
CREATE USER pi_admin WITH ENCRYPTED PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE pishop_db TO pi_admin;
\q
```

### 3. Build the Application
Navigate to your project folder on the Pi:
```bash
cd /path/to/pishop
npm install
npm run build
```
*This creates a `dist` folder containing your production website.*

### 4. Configure Nginx
Copy your build files to the web root:
```bash
sudo cp -r dist/* /var/www/html/
```

Configure Nginx Routing:
```bash
sudo nano /etc/nginx/sites-available/default
```
Replace the content with the provided `nginx.conf` logic (ensure `root` points to `/var/www/html`).

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### 5. Expose to Internet (Securely)
**Do not** open ports on your home router. Use **Cloudflare Tunnel** for a free, secure HTTPS link.

1.  Sign up for Cloudflare Zero Trust (Free).
2.  Install `cloudflared` on your Pi.
3.  Run the tunnel command provided by Cloudflare dashboard.
    *   Point the service to `http://localhost:80`.
4.  You now have a globally accessible URL (e.g., `https://pishop.yourdomain.com`).

---

## Phase 2: Cloud Deployment (Docker)

This method is best for scaling. It works on AWS EC2, DigitalOcean Droplets, or even the Pi if you prefer containers.

### 1. Prerequisites
Install Docker and Docker Compose on your cloud server.

### 2. Set Environment Variables
Create a `.env` file in the project root:
```env
API_KEY=your_google_gemini_api_key_here
```

### 3. Build and Run
Simply run:
```bash
docker-compose up -d --build
```

### 4. What happens?
1.  **Web Container**: Docker builds your React app, optimizes it, and serves it via Nginx on Port 80.
2.  **DB Container**: Spins up PostgreSQL with your credentials on Port 5432.
3.  **Auto-Restart**: If the server crashes, the shop comes back online automatically.

---

## Phase 3: Domain & SSL (Cloud Only)

If hosting on a VPS (without Cloudflare Tunnel):
1.  Install Certbot: `sudo apt install certbot python3-certbot-nginx`
2.  Run: `sudo certbot --nginx -d yourdomain.com`

---

## Troubleshooting

**Admin Login Fails:**
*   Ensure the PostgreSQL service is running: `sudo systemctl status postgresql`
*   Verify credentials in the Admin Panel -> System Tab match your Postgres setup.

**404 on Refresh:**
*   Ensure your Nginx config has `try_files $uri $uri/ /index.html;`. This is required for React Router.
