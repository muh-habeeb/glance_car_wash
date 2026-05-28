FROM node:22-alpine

WORKDIR /app

# Copy explicitly from the backend folder in case Dokploy context is set to root (/)
COPY backend/package*.json ./

RUN apk add --no-cache openssl
RUN npm install

COPY backend/ ./

RUN npm run build

EXPOSE 3500

CMD ["npm", "start"]
