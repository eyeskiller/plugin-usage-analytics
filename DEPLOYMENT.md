# Production Deployment Guide (AlmaLinux)

Follow these instructions to deploy the Plugin Usage Analytics dashboard to your AlmaLinux server securely using a dedicated service user and a secure HTTPS connection.

## Prerequisites
1. Root or `sudo` access to your AlmaLinux server.
2. A domain name (`analytics.bechatbot.online`) already pointed to your server's IP address.

---

## Step 1: Install Node.js & PM2
First, install Node.js (version 20 is recommended for Next.js) and PM2 (a process manager).

```bash
# Enable Node.js 20 module
sudo dnf module enable nodejs:20 -y

# Install Node.js
sudo dnf install nodejs -y

# Install PM2 globally
sudo npm install -g pm2
```

## Step 2: Create a Dedicated Service User
Running web applications as root is a major security risk. We will create a dedicated user named `analyticsuser` to run the app.

```bash
# Create the user with a home directory and no direct password login needed
sudo useradd -m -s /bin/bash analyticsuser

# Switch to the new user temporarily to set up the app
sudo su - analyticsuser
```

## Step 3: Set Up and Build the Application
*(Note: You should now be logged in as `analyticsuser` in the terminal)*

Clone or upload your code to the user's home directory (e.g., `/home/analyticsuser/plugin-usage-analytics`).

```bash
cd /home/analyticsuser/plugin-usage-analytics

# Install dependencies
npm install

# Create the .env file and set your admin password
echo "ADMIN_PASSWORD=your_secure_password" > .env

# Build the Next.js production bundle
npm run build
```

## Step 4: Start the App with PM2
Still logged in as `analyticsuser`, start the application on port `8812`.

```bash
pm2 start npm --name "analytics-app" -- run start -- -p 8812

# Save the PM2 list for this user
pm2 save
```

To ensure PM2 starts automatically when the server reboots, run this command:
```bash
pm2 startup
```
**Important:** PM2 will output a command starting with `sudo env PATH...`. **Copy and paste that specific command** and run it to configure the startup script. It might prompt you for a sudo password; if `analyticsuser` isn't a sudoer, you will need to `exit` back to your main user and run the command PM2 gave you.

Once done, type `exit` to return to your main `sudo` user account.
```bash
exit
```

## Step 5: Install and Configure Nginx
*(Note: You should now be back on your main account with sudo privileges)*

Nginx will take requests from the internet and pass them to the app running safely under `analyticsuser`.

```bash
# Install Nginx
sudo dnf install nginx -y

# Start and enable Nginx to run on boot
sudo systemctl start nginx
sudo systemctl enable nginx
```

Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/conf.d/analytics.conf
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name analytics.bechatbot.online;

    location / {
        proxy_pass http://127.0.0.1:8812;
        proxy_http_version 1.1;
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save the file and test the configuration:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Secure with Let's Encrypt (HTTPS)
To get a free SSL certificate, we use Certbot.

```bash
# Install the EPEL repository
sudo dnf install epel-release -y

# Install Certbot and the Nginx plugin
sudo dnf install certbot python3-certbot-nginx -y

# Obtain the certificate and automatically secure Nginx
sudo certbot --nginx -d analytics.bechatbot.online
```

## Maintenance 

If you ever need to view the logs or restart the app, you must switch to the `analyticsuser` first!

```bash
# Switch to the app user
sudo su - analyticsuser

# View live application logs
pm2 logs analytics-app

# Restart the application
pm2 restart analytics-app
```
