# NGINX Configuration & SSL Setup for Glanz Car Wash

## Prerequisites
Ensure both your frontend (port `3000`) and backend (port `3500`) are running on your VPS.

## 1. NGINX Configuration

Create a new NGINX configuration file:
```bash
sudo nano /etc/nginx/sites-available/glanz
```

Paste the following configuration into the file. The SSL (443) section is currently commented out as requested. You will uncomment it after running Certbot.

```nginx
# ==========================================
# VARIABLES & SETTINGS
# ==========================================
# Domain Name: glanz.habeeb.qzz.io
# Frontend Port: 3000
# Backend Port: 3500

# Setup a cache zone for static Next.js assets to speed up load times significantly
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=NEXT_CACHE:10m inactive=7d max_size=1g;

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# ==========================================
# HTTP SERVER (Port 80)
# ==========================================
server {
    listen 80;
    listen [::]:80;
    
    # Define your domain here
    server_name glanz.habeeb.qzz.io;

    # --- API Routing (Backend) ---
    # Any request starting with /api/ goes to the Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- Static Asset Caching (Frontend) ---
    # Highly cache Next.js static files to speed up the website
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache NEXT_CACHE;
        proxy_cache_valid 200 7d;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # --- Frontend Routing ---
    # All other requests go to the Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==========================================
# HTTPS SERVER (Port 443) - UNCOMMENT AFTER CERTBOT
# ==========================================
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     
#     # Define your domain here
#     server_name glanz.habeeb.qzz.io;
# 
#     # SSL Certificates (managed by Certbot)
#     ssl_certificate /etc/letsencrypt/live/glanz.habeeb.qzz.io/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/glanz.habeeb.qzz.io/privkey.pem;
# 
#     # SSL Optimization & Security Settings
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:MEDIUM:!aNULL:!MD5:!3DES;
#     ssl_prefer_server_ciphers on;
#     ssl_session_cache shared:SSL:20m;
#     ssl_session_timeout 10m;
#     ssl_session_tickets off;
# 
#     # Optional but recommended if you generated dhparams:
#     # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
# 
#     # Gzip Compression to speed up text/html/json responses
#     gzip on;
#     gzip_proxied any;
#     gzip_comp_level 6;
#     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
# 
#     # --- API Routing (Backend) ---
#     location /api/ {
#         proxy_pass http://127.0.0.1:3500;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection $connection_upgrade;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# 
#     # --- Static Asset Caching (Frontend) ---
#     location /_next/static/ {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_cache NEXT_CACHE;
#         proxy_cache_valid 200 7d;
#         proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
#         add_header X-Cache-Status $upstream_cache_status;
#     }
# 
#     # --- Frontend Routing ---
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection $connection_upgrade;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
```

## 2. Enable the Configuration

Enable the site and restart NGINX:

```bash
sudo ln -s /etc/nginx/sites-available/glanz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 3. Setting Up SSL Certificates

Once the site is running on HTTP (port 80), you can install the free SSL certificates from Let's Encrypt.

### Install Certbot
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificates
Run Certbot to automatically fetch the certificates. (Certbot may offer to automatically edit your NGINX config to add the SSL block, or you can manually uncomment the block above once it finishes).

```bash
sudo certbot --nginx -d glanz.habeeb.qzz.io
```

### Final Step
If Certbot did not automatically update your file, simply edit `/etc/nginx/sites-available/glanz` again, uncomment the `HTTPS SERVER (Port 443)` block, and change the `HTTP SERVER (Port 80)` block to redirect all HTTP traffic to HTTPS like this:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name glanz.habeeb.qzz.io;
    return 301 https://$host$request_uri;
}
```

Then test and restart NGINX:
```bash
sudo nginx -t
sudo systemctl reload nginx
```
