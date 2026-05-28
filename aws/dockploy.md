# Setting up Automated Deployments (CI/CD) on your VPS

You have two main options for setting up CI/CD to deploy your app automatically when you push to GitHub. 

## Option A: GitHub Actions + Docker Hub (The Hard Way)
In this method, you write a `.github/workflows/deploy.yml` file. When you push to GitHub:
1. GitHub Actions spins up a runner.
2. It builds the Docker images for your Frontend and Backend.
3. It pushes those images to Docker Hub.
4. It SSHs into your AWS VPS.
5. It runs `docker pull` and `docker compose up -d` to restart your app.

*While this is the industry standard for large enterprises, it requires managing Docker Hub credentials, GitHub Secrets, SSH keys, and writing a complex Docker Compose file.*

---

## Option B: Using a Self-Hosted PaaS like Dockploy / Coolify / Dokku (The Easy Way!)
**Yes, using a tool like Dockploy or Coolify makes CI/CD 100x easier!** 

A self-hosted PaaS (Platform as a Service) is like having your own personal Vercel or Heroku running on your AWS VPS. 

### Why is it easier?
- **No GitHub Actions needed:** You just connect your GitHub repository directly to the Dockploy dashboard.
- **No Docker Hub needed:** The VPS pulls the raw code from GitHub and builds the Docker image *locally* on the VPS. 
- **Auto-Deploy:** Every time you push to the `main` branch, Dockploy sees it, builds the new version, and safely swaps it out with zero downtime.
- **Environment Variables:** You paste your `.env.production` directly into their beautiful Web UI instead of managing GitHub Secrets.

---

### Step-by-step Guide to Setting up Dockploy/Coolify

#### 1. Setup the Subdomain (DNS)
Yes! You need to create a subdomain for your deployment dashboard.
- Go to your Domain Registrar (where you bought `habeebrahman.tech`).
- Add an **A Record**:
  - **Host / Name:** `deploy`
  - **Value / IP Address:** `[Your AWS VPS Public IP]`
- This will make `deploy.habeebrahman.tech` point to your VPS.

#### 2. Clean up your VPS (CRITICAL!)
Because Coolify runs its own reverse proxy (Traefik) and handles process management via Docker, it **must** have full control over ports 80 and 443. If you have NGINX and PM2 currently running, they will conflict and break the installation!

**SSH into your VPS and run these commands to clean up:**

1. **Stop and remove PM2 apps:**
```bash
pm2 stop all
pm2 delete all
pm2 save
npm uninstall -g pm2
```

2. **Stop and disable NGINX:**
```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```
*(Optional: If you want to completely remove NGINX to be safe)*
```bash
sudo apt-get purge nginx nginx-common -y
sudo apt-get autoremove -y
```

#### 3. Install the PaaS on your VPS
Now that ports 80 and 443 are completely free, run the installation script for your chosen PaaS. *(Dokploy is currently one of the most lightweight and powerful modern open-source PaaS).*

**To install Dokploy:**
```bash
curl -sSL https://dokploy.com/install.sh | sudo sh
```
*(This script will automatically install Docker and set everything up).*

#### 3. Access the Dashboard
Once the installation finishes, open your browser and go to:
`http://<YOUR_AWS_VPS_IP>:3000`

- Create your admin account.
- In the settings, you can change the URL to `https://deploy.habeebrahman.tech` (Dokploy will automatically generate the SSL certificate for you using Let's Encrypt!).

#### 4. Connect GitHub & Deploy
1. In the Dokploy dashboard, click **Add New Resource** -> **Git Repository**.
2. Connect your GitHub account (it will ask you to install a GitHub App for permissions).
3. Select your `glance_car_wash` repository.
4. **Deploy the Backend:**
   - Set the Build Pack to **Dockerfile**.
   - Set the Build Path to `/backend`.
   - Add your Backend Environment Variables.
5. **Deploy the Frontend:**
   - Set the Build Pack to **Dockerfile**.
   - Set the Build Path to `/frontend`.
   - Set the port to `3001`.
   - Add your Frontend Environment Variables.
6. Click **Deploy!**

### What about NGINX?
When you use Dokploy, **you don't even need to configure NGINX manually!** 
The PaaS comes with a built-in reverse proxy (Traefik). You simply type `https://glanz.habeebrahman.tech` into the frontend configuration box inside the Dokploy dashboard, and it automatically routes the traffic, generates the SSL certs, and handles everything!

### Summary Recommendation
If you want the easiest, most visual, and least stressful CI/CD experience, **use Dokploy**. It completely replaces the need for Docker Hub, GitHub Actions, and manual NGINX configurations!

---

## Expanding Server Storage Space (AWS EBS)

If you ever need to increase your server's storage space (for example, if Docker images fill up your disk), you first upgrade the EBS Volume size in your AWS Console. Once that is done, you **must** expand the partition inside the EC2 instance so Ubuntu recognizes the new space.

⚠️ **Step 2: Expand partition inside EC2**

SSH into your server and run the following commands:

**1. Check current disk partitions**
```bash
lsblk
```
*You will see something like this, showing your main disk (`nvme0n1`) and its partition (`nvme0n1p1`):*
```text
nvme0n1
 └─nvme0n1p1
```

**2. Grow the partition**
*This tells the OS to expand partition `1` on disk `nvme0n1` to fill the new space.*
```bash
sudo growpart /dev/nvme0n1 1
```

**3. Resize the filesystem**
*Assuming Ubuntu uses `ext4` (which is the default and most common), run this to resize the actual file system:*
```bash
sudo resize2fs /dev/nvme0n1p1
```

**4. Verify the new size**
```bash
df -h
```
*Now you should see your new larger size (20GB or more) available on the main mount!*