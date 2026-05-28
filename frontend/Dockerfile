# Base image
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

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
