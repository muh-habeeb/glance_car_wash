# Glanz Premium Car Wash - Authentication & User API Reference

This document provides a comprehensive guide to the authentication and user profile APIs for the **Glanz Premium Car Wash** application. 

The backend uses **Better Auth v1.6.11** for secure, session-based authentication (managing scrypt hashing, secure cookies, and CSRF protection) alongside custom Express routes for profile management.

---

## 🔐 Core Authentication Concepts

### 1. Secure Sessions & Cookies (Recommended for Web)
When a user signs in, Better Auth sets HTTP-only, secure, same-site session cookies automatically. 
* **Handling:** Modern web browsers automatically capture, store, and send these cookies with every subsequent request. You do not need to manually read or attach them in the frontend client.

### 2. Bearer / Authorization Header (For Mobile / Testing Clients)
External clients (like Flutter, React Native, or testing applications) can fetch and pass the session token manually.
* Pass the session token in the request headers:
  ```http
  Authorization: Bearer <your_session_token>
  ```

### ⚠️ IMPORTANT: The `MISSING_OR_NULL_ORIGIN` CSRF Guard
Better Auth has native **CSRF protection** enabled. By default, it requires that any write requests (`POST`, `PATCH`, `DELETE`) carry a valid `Origin` header that matches one of its registered trusted origins (configured in the backend `.env` under `CORS_ORIGIN`).

When testing endpoints from **Postman**, **Thunder Client**, or **curl**, you must manually add the `Origin` header to avoid a `403 Forbidden` error:
* **Header Key:** `Origin`
* **Header Value:** `http://localhost:3000` *(or your registered frontend URL)*

---

## 🛣️ API Endpoints Directory

### 🚪 Authentication Routes (`/api/auth/*`)
All authentication endpoints are managed natively by Better Auth, running on top of Express.

### 👤 Profile Routes (`/api/users/*`)
All custom user profile interactions are prefixed with `/api/users`.

---

## 🔑 Authentication Endpoints Reference & JSON Payloads

### 1. Sign Up (Email & Password)
Registers a new user account. Due to project validation constraints, a valid **phone number** is strictly required during credentials signup.

* **Method:** `POST`
* **Endpoint:** `/api/auth/sign-up/email`
* **Headers:** 
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000` (required for testing clients)
* **Request JSON:**
```json
{
  "name": "Habeeb Rahman",
  "email": "habeeb@example.com",
  "password": "SuperSecurePassword123!",
  "phone": "+971501234567",
  "whatsapp": "+971501234568",
  "callbackURL": "/dashboard"
}
```
* **Success Response (200 OK):**
```json
{
  "token": "session_token_here",
  "user": {
    "id": "user_uuid_here",
    "name": "Habeeb Rahman",
    "email": "habeeb@example.com",
    "emailVerified": false,
    "phone": "+971501234567",
    "whatsapp": "+971501234568",
    "role": "USER",
    "is_active": true,
    "createdAt": "2026-05-26T13:00:00.000Z",
    "updatedAt": "2026-05-26T13:00:00.000Z"
  }
}
```
* **Notes:** This triggers a background verification email to the user.

---

### 2. Sign In (Email & Password)
Authenticates a user and starts a secure session.

* **Method:** `POST`
* **Endpoint:** `/api/auth/sign-in/email`
* **Headers:** 
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "email": "habeeb@example.com",
  "password": "SuperSecurePassword123!"
}
```
* **Success Response (200 OK):**
```json
{
  "token": "session_token_here",
  "user": {
    "id": "user_uuid_here",
    "name": "Habeeb Rahman",
    "email": "habeeb@example.com",
    "emailVerified": false,
    "phone": "+971501234567",
    "whatsapp": "+971501234568",
    "role": "USER",
    "is_active": true
  }
}
```

---

### 3. Get Active Session & User Info
Retrieves details of the currently logged-in session.

* **Method:** `GET`
* **Endpoint:** `/api/auth/get-session`
* **Headers:** 
  * `Authorization: Bearer <session_token>` *(or use automatically sent cookies)*
* **Success Response (200 OK):**
```json
{
  "session": {
    "id": "session_id_here",
    "userId": "user_uuid_here",
    "expiresAt": "2026-06-02T13:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "PostmanRuntime/7.40.0"
  },
  "user": {
    "id": "user_uuid_here",
    "name": "Habeeb Rahman",
    "email": "habeeb@example.com",
    "emailVerified": false,
    "phone": "+971501234567",
    "whatsapp": "+971501234568",
    "role": "USER",
    "is_active": true
  }
}
```

---

### 4. Request Password Reset (Forgot Password)
Sends a password reset email containing a secure token.

* **Method:** `POST`
* **Endpoint:** `/api/auth/request-password-reset`
* **Headers:** 
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "email": "habeeb@example.com",
  "redirectTo": "http://localhost:3000/reset-password"
}
```
* **Success Response (200 OK):**
```json
{
  "status": true
}
```
* **Notes:** Generates a custom black-and-gold themed reset email using Glanz Premium styling.

---

### 5. Reset Password (Using Reset Token)
Performs the password reset using the token obtained from the email link.

* **Method:** `POST`
* **Endpoint:** `/api/auth/reset-password`
* **Headers:** 
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "newPassword": "MyBrandNewSuperPassword456!",
  "token": "token_string_extracted_from_email_url"
}
```
* **Success Response (200 OK):**
```json
{
  "status": true
}
```

---

### 6. Change Password (Authenticated Session)
Changes the logged-in user's password.

* **Method:** `POST`
* **Endpoint:** `/api/auth/change-password`
* **Headers:** 
  * `Authorization: Bearer <session_token>`
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "currentPassword": "SuperSecurePassword123!",
  "newPassword": "MyBrandNewSuperPassword456!",
  "revokeOtherSessions": true
}
```
* **Success Response (200 OK):**
```json
{
  "status": true
}
```

---

### 7. Change Email (Authenticated Session)
Initiates an email update. Senders an verification code/email to the new address before completing the swap.

* **Method:** `POST`
* **Endpoint:** `/api/auth/change-email`
* **Headers:** 
  * `Authorization: Bearer <session_token>`
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "newEmail": "habeeb.new@example.com",
  "callbackURL": "/dashboard"
}
```
* **Success Response (200 OK):**
```json
{
  "status": true
}
```

---

### 8. Delete Account (7-Day Soft Delete Guard)
Schedules account deletion. Inactive status is applied immediately, preventing logins. Complete deletion occurs after 7 days, unless aborted by logging back in.

* **Method:** `POST`
* **Endpoint:** `/api/auth/delete-user`
* **Headers:** 
  * `Authorization: Bearer <session_token>`
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "password": "MyBrandNewSuperPassword456!"
}
```
* **Expected Response (400 Bad Request containing JSON error details):**
```json
{
  "message": "Account deletion has been scheduled. Your account will be permanently deleted in 7 days. Log back in before then to cancel.",
  "code": "OK"
}
```
* **Notes:** Under the hood, this intercepts Better Auth's core delete function, flags `is_active = false`, creates an `AccountDeletion` schedule in the database, sends a black/gold email notification, and throws the `OK` error to abort a permanent system-wide deletion until the 7-day period expires.

---

### 9. Sign Out
Terminates the current active session.

* **Method:** `POST`
* **Endpoint:** `/api/auth/sign-out`
* **Headers:** 
  * `Authorization: Bearer <session_token>`
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{}
```
* **Success Response (200 OK):**
```json
{
  "status": true
}
```

---

## 👤 Custom User Profile Endpoints & JSON Payloads

These endpoints handle standard profile information updates.

### 1. Get Profile Details
Fetches public and non-critical profile fields for the authenticated user.

* **Method:** `GET`
* **Endpoint:** `/api/users/profile`
* **Headers:**
  * `Authorization: Bearer <session_token>` *(or session cookie)*
* **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "name": "Habeeb Rahman",
    "email": "habeeb@example.com",
    "phone": "+971501234567",
    "whatsapp": "+971501234568",
    "role": "USER",
    "is_active": true,
    "image": "https://lh3.googleusercontent.com/a/...",
    "emailVerified": true
  }
}
```

---

### 2. Update Profile Details (Name, Phone, WhatsApp)
Allows partial updates to profile fields. Modifying critical fields like `email`, `password`, `role`, or `is_active` via this endpoint is strictly blocked.

* **Method:** `PATCH`
* **Endpoint:** `/api/users/profile`
* **Headers:**
  * `Authorization: Bearer <session_token>`
  * `Content-Type: application/json`
  * `Origin: http://localhost:3000`
* **Request JSON:**
```json
{
  "name": "Habeeb R.",
  "phone": "+971509999999",
  "whatsapp": "+971509999999"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "name": "Habeeb R.",
    "email": "habeeb@example.com",
    "phone": "+971509999999",
    "whatsapp": "+971509999999",
    "is_active": true,
    "image": "https://lh3.googleusercontent.com/a/...",
    "emailVerified": true
  }
}
```

---

## 🧪 Postman & external API Testing Walkthrough

Follow this step-by-step sequence to test your routes inside Postman or Insomnia:

### Step 1: Account Registration
1. Set method to `POST` and enter URL: `http://localhost:3500/api/auth/sign-up/email`
2. Add the `Origin` header: `http://localhost:3000`
3. Add the request JSON (from the Sign Up section) to the body.
4. Send the request. Copy the `token` value returned in the response.

### Step 2: Login to Create Session
1. Set method to `POST` and enter URL: `http://localhost:3500/api/auth/sign-in/email`
2. Add the `Origin` header: `http://localhost:3000`
3. Add your login credentials JSON to the body.
4. Send the request. Copy the new `token` string.

### Step 3: Fetch Profile
1. Set method to `GET` and enter URL: `http://localhost:3500/api/users/profile`
2. Under the **Headers** tab, add a new key:
   * **Key:** `Authorization`
   * **Value:** `Bearer YOUR_COPIED_TOKEN_HERE`
3. Send the request. You should successfully receive the secure profile payload.

### Step 4: Patch Profile Fields
1. Set method to `PATCH` and enter URL: `http://localhost:3500/api/users/profile`
2. Add headers:
   * `Origin: http://localhost:3000`
   * `Authorization: Bearer YOUR_COPIED_TOKEN_HERE`
3. Add the update JSON in the body:
   ```json
   {
     "name": "Tester Name",
     "phone": "+971507777777"
   }
   ```
4. Send the request to verify the successful update response.
