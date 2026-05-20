# VPS Deployment Guide

## Project Structure Overview

This is a **monorepo** structure using `pnpm` and `Turbo`:
- **`apps/web`** → Next.js frontend
- **`apps/server`** → Backend server
- **`packages/`** → Shared code (database, API, UI components, env config)
- **`pnpm-workspace.yaml`** → Monorepo manager
- **`turbo.json`** → Build orchestration

## Prerequisites

- VPS running Ubuntu/Debian
- Root or sudo access
- Domain name (optional but recommended for SSL)

## Step 1: Prepare Your VPS

SSH into your VPS:
```bash
ssh root@your_vps_ip
```

Update system packages:
```bash
apt update && apt upgrade -y
```

Install Node.js (v20 recommended):
```bash
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install nodejs -y
```

Install pnpm:
```bash
npm install -g pnpm
```

Install PM2 (process manager):
```bash
npm install -g pm2
```

## Step 2: Deploy Your Code

### Option A: Clone from Git
```bash
git clone <your-repo-url> /opt/app
cd /opt/app
```

### Option B: Upload via SCP
```bash
scp -r ./glance_car_wash root@your_vps_ip:/opt/app
```

## Step 3: Install Dependencies & Build

Navigate to project directory:
```bash
cd /opt/app
```

Install all dependencies:
```bash
pnpm install
```

Build the entire monorepo (Turbo handles build order):
```bash
pnpm build
```

## Step 4: Environment Configuration

Create environment files in the project root and respective apps:

**Root `.env` (if needed):**
```bash
NODE_ENV=production
```

**`apps/server/.env`:**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url
# Add other server env variables
```

**`apps/web/.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://your_domain/api
# Add other frontend env variables
```

Update environment variables in `packages/env/` files accordingly.

## Step 5: Start Services with PM2

Start the backend server:
```bash
pm2 start "pnpm -F @repo/server start" --name "backend"
```

Start the frontend (Next.js):
```bash
pm2 start "pnpm -F @repo/web start" --name "frontend"
```

Make PM2 startup on reboot:
```bash
pm2 startup
pm2 save
```

Check running processes:
```bash
pm2 list
```

View logs:
```bash
pm2 logs backend
pm2 logs frontend
```

## Step 6: Setup Nginx Reverse Proxy

Install Nginx:
```bash
apt install nginx -y
```

Edit `/etc/nginx/sites-available/default`:
```bash
sudo nano /etc/nginx/sites-available/default
```

Add configuration:
```nginx
# Frontend
server {
    listen 80;
    server_name your_domain www.your_domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend (optional separate domain or path)
server {
    listen 80;
    server_name api.your_domain;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Test Nginx configuration:
```bash
sudo nginx -t
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

## Step 7: SSL Certificate (Recommended)

Install Certbot:
```bash
apt install certbot python3-certbot-nginx -y
```

Get SSL certificate:
```bash
sudo certbot --nginx -d your_domain -d www.your_domain
```

Auto-renewal is configured automatically. Verify:
```bash
sudo certbot renew --dry-run
```

## Step 8: Database Setup

If using a database:
- Update connection strings in `packages/db/` and `.env` files
- Run migrations:
  ```bash
  pnpm -F @repo/db migrate
  ```
- For production, consider using managed services (AWS RDS, MongoDB Atlas, etc.)

## Maintenance Commands

### View logs
```bash
pm2 logs
pm2 logs backend
pm2 logs frontend
```

### Restart services
```bash
pm2 restart backend
pm2 restart frontend
pm2 restart all
```

### Deploy updates
```bash
cd /opt/app
git pull origin main
pnpm install
pnpm build
pm2 restart all
```

### Monitor performance
```bash
pm2 monit
```

## Troubleshooting

**Ports already in use:**
```bash
lsof -i :3000
lsof -i :5000
kill -9 <PID>
```

**Check Nginx logs:**
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

**Check system resources:**
```bash
free -h
df -h
top
```

## Security Tips

1. Enable firewall:
   ```bash
   ufw enable
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ```

2. Disable root SSH (after setup):
   - Add sudo user and use that instead

3. Use strong passwords and SSH keys

4. Keep system updated regularly:
   ```bash
   apt update && apt upgrade -y
   ```

5. Configure backups for your database

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Production Guide](https://nextjs.org/docs/deployment)
- [Certbot Documentation](https://certbot.eff.org/)
