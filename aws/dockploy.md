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

#### 2. Install the PaaS on your VPS
SSH into your AWS VPS and run the installation script for your chosen PaaS. *(Coolify is currently the most popular and powerful modern open-source PaaS).*

**To install Coolify:**
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
*(This script will automatically install Docker and set everything up).*

#### 3. Access the Dashboard
Once the installation finishes, open your browser and go to:
`http://<YOUR_AWS_VPS_IP>:8000`

- Create your admin account.
- In the settings, you can change the URL to `https://deploy.habeebrahman.tech` (Coolify will automatically generate the SSL certificate for you using Let's Encrypt!).

#### 4. Connect GitHub & Deploy
1. In the Coolify/Dockploy dashboard, click **Add New Resource** -> **Git Repository**.
2. Connect your GitHub account (it will ask you to install a GitHub App for permissions).
3. Select your `glance_car_wash` repository.
4. **Deploy the Backend:**
   - Set the Build Pack to **Nixpacks** or **Dockerfile**.
   - Set the start command to `npm run start`.
   - Set the port to `3500`.
   - Add your Backend Environment Variables.
5. **Deploy the Frontend:**
   - Set the Build Pack to **Next.js**.
   - Set the port to `3000`.
   - Add your Frontend Environment Variables.
6. Click **Deploy!**

### What about NGINX?
When you use Dockploy or Coolify, **you don't even need to configure NGINX manually!** 
The PaaS comes with a built-in reverse proxy (like Traefik or Caddy). You simply type `https://glanz.habeebrahman.tech` into the frontend configuration box inside the Coolify dashboard, and it automatically routes the traffic, generates the SSL certs, and handles everything!

### Summary Recommendation
If you want the easiest, most visual, and least stressful CI/CD experience, **use Coolify**. It completely replaces the need for Docker Hub, GitHub Actions, and manual NGINX configurations!
