# Glanz Car Wash Backend - Deployment Guide

This guide explains how to successfully configure, start, and run the backend server along with its supporting Docker services (GlitchTip, Postgres, Redis).

## 1. Prerequisites
- **Node.js**: Ensure Node.js (v18 or higher) is installed.
- **Docker**: Ensure Docker Desktop (or Docker Engine) is installed and running on your machine.
- **npm**: Used for package management.

## 2. Environment Configuration
Before starting anything, you need to configure your environment variables.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the required variables. 
   - **Important**: Ensure `JWT_SECRET` is set to a secure string.
   - The **Docker Settings** section at the bottom is pre-configured to work perfectly out-of-the-box for local development.

## 3. Sentry Setup (Error Tracking)
Instead of self-hosting, we use [Sentry.io](https://sentry.io) for fully-managed, zero-overhead error tracking.

1. Sign up for a free account at [Sentry.io](https://sentry.io).
2. Create a new project (select **Node.js** or **Express** as the platform).
3. Copy the provided **DSN string**.
4. Paste this string into your `.env` file:
   ```env
   SENTRY_DSN="https://your_sentry_dsn_here@sentry.io/12345"
   ```

## 4. Database Initialization
With your Postgres container running, you need to sync your Prisma schema to the database.

1. Generate the Prisma Client:
   ```bash
   npm run db:generate
   ```
2. Push your schema to the database:
   ```bash
   npm run db:push
   ```
   *(Note: In a true production environment, you should use `npm run db:deploy` with migrations).*

## 5. Starting the Backend Server

### Local Development
To run the server with hot-reloading for development:
```bash
npm install
npm run dev
```

### Production Deployment
To build the server and run the optimized production bundle:
```bash
npm run build
npm run start
```

## Additional Information
- **Logs**: The backend uses Pino for logging. In development mode, logs are printed cleanly to your terminal. In production mode, they are output as structured JSON.
- **Errors**: Any unhandled exceptions will automatically be captured and sent to your local GlitchTip dashboard for review.
- **Security**: The Redis instance is secured behind a password defined by `GLITCHTIP_REDIS_PASSWORD` in your `.env` file.
