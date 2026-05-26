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

## 8. Delete Account (Soft Delete)
**Endpoint:** `DELETE /api/users/profile`

**Access:** Private (Requires Token/Session authentication)

**Description:** Requests permanent account deletion. The account is immediately deactivated and the user is logged out. The account will be permanently deleted after a 7-day grace period. If the user logs back in during this 7-day window, the deletion request is cancelled and the account is restored.

**Payload:**
```json
{
  "password": "yourpassword123"
}
```
*(Requires confirming your current password to process the deletion safely)*

---

## ⚠️ Troubleshooting: `MISSING_OR_NULL_ORIGIN` Error

If you call any Better Auth route (`/api/auth/*`) and receive this error:
```json
{
  "message": "Missing or null Origin",
  "code": "MISSING_OR_NULL_ORIGIN"
}
```

### Why it happens:
Better Auth has native **CSRF protection** enabled. Security-wise, it strictly requires the incoming request to carry a valid `Origin` header mapping to one of its `trustedOrigins`. 
Testing clients like **Postman**, **Thunder Client**, or mobile app libraries (like `curl`) do not attach an `Origin` header by default, causing Better Auth to reject them with a 403 status.

### How to resolve it:
When testing/hitting Better Auth endpoints from external clients, manually add the following **header** to your request:
* **Key:** `Origin`
* **Value:** `http://localhost:3000` *(or whichever trusted frontend domain is registered in `CORS_ORIGIN`)*

---

*Note: For the exact frontend client usage, see `frontend/lib/auth-client.ts`. Better Auth automatically generates a strongly typed React client (`authClient`) to interact with these endpoints seamlessly.*
