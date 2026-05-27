
 sudo apt-get update && sudo apt-get install docker.io -y && sudo systemctl start docker && sudo chmod 666 /var/run/docker.sock && sudo systemctl enable docker && docker --version


 

 npm run start

then use PM2 like this:

pm2 start npm --name "project-backend" -- run start

For development mode (npm run dev):

pm2 start npm --name "project-backend" -- run dev

Useful PM2 commands:

pm2 list
pm2 logs project-backend
pm2 restart project-backend
pm2 stop project-backend
pm2 delete project-backend

To auto-start after EC2 reboot:

pm2 save
pm2 startup