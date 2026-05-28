# Base image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy explicitly from the frontend folder in case Dokploy context is set to root (/)
COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build

# Production runner image
FROM node:22-alpine AS runner

WORKDIR /app

# Copy necessary files from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port (3001 as configured in package.json)
EXPOSE 3001

CMD ["npm", "start"]
