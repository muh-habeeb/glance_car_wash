# Better Auth Routes

This document outlines the authentication endpoints provided automatically by **Better Auth**.

Since we migrated to Better Auth, the standard Express controllers (`/login`, `/register`, `/logout`) have been replaced by Better Auth's native handlers, providing maximum security (scrypt hashing, secure sessions, rate limiting).

Base URL for Auth: `POST /api/auth/*`

## 1. Sign Up (Email & Password)
**Endpoint:** `POST /api/auth/sign-up/email`

**Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "strongpassword123",
  "phone": "+1234567890",
  "whatsapp": "+1234567890", // optional
  "callbackURL": "/dashboard" // optional
}
```
*Note: `phone` is required by our custom schema. `name`, `email`, and `password` are standard Better Auth fields.*

## 2. Sign In (Email & Password)
**Endpoint:** `POST /api/auth/sign-in/email`

**Payload:**
```json
{
  "email": "john@example.com",
  "password": "strongpassword123",
  "callbackURL": "/dashboard" // optional
}
```
*Note: Returns secure HTTP-only cookies managing the session lifecycle.*

## 3. Social Sign In
**Endpoint:** `POST /api/auth/sign-in/social`

**Payload:**
```json
{
  "provider": "google", // or "facebook"
  "callbackURL": "/dashboard"
}
```

## 4. Sign Out
**Endpoint:** `POST /api/auth/sign-out`

**Payload:**
```json
{}
```
*Note: Invalidates the current session and clears the cookies.*

## 5. Get Session
**Endpoint:** `GET /api/auth/get-session`

**Response:**
Returns the currently authenticated user session.

```json
{
  "session": {
    "id": "...",
    "userId": "...",
    "expiresAt": "...",
    "ipAddress": "..."
  },
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "phone": "+1234567890",
    "whatsapp": "+1234567890",
    "role": "USER",
    "is_active": true
  }
}
```

## 6. Change Password
**Endpoint:** `POST /api/auth/change-password`

**Payload:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "revokeOtherSessions": true
}
```

## 7. OAuth (Google & Facebook) Configuration & Redirect Setup

To ensure social login triggers successfully without a `redirect_uri_mismatch` or `403 Forbidden` error, you must configure the following:

### Redirect URIs
Better Auth automatically structures and sends redirect callbacks under the backend URL: `[BETTER_AUTH_URL]/api/auth/callback/[provider]`.

Register the following exact Callback URIs in your developer consoles:

* **Google Cloud Console:**
  ```text
  http://localhost:3500/api/auth/callback/google
  ```
  *(Go to Credentials > OAuth 2.0 Client IDs > Authorized Redirect URIs and add the link above)*

* **Facebook Developer Portal:**
  ```text
  http://localhost:3500/api/auth/callback/facebook
  ```
  *(Go to Facebook Login > Settings > Valid OAuth Redirect URIs and add the link above)*

### CSRF & Trusted Origins
Since the frontend operates on a different port (`http://localhost:3000`), the backend `auth.ts` options must define the frontend URL as a trusted origin to satisfy CSRF verification:

```ts
trustedOrigins: env.CORS_ORIGIN, // e.g. ["http://localhost:3000"]
```

---

*Note: For the exact frontend client usage, see `frontend/lib/auth-client.ts`. Better Auth automatically generates a strongly typed React client (`authClient`) to interact with these endpoints seamlessly.*
