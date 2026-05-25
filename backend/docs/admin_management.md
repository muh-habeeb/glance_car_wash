# Admin Management API

This document details the Administrative API capabilities within the backend, including pagination, dynamic filtering, intelligent searching, and the secure bulk deletion system.

---

## 1. Get All Users (With Pagination, Filtering, & Search)
**Endpoint:** `GET /api/admin/users`

This powerful endpoint allows admins to fetch users dynamically. By default, it returns the first 10 users.

### Query Parameters
- `page` (number): The page number to fetch (default: 1).
- `limit` (number): The number of users per page (default: 10).
- `role` (string): Filter users strictly by role (`USER`, `STAFF`, `ADMIN`, `SUPERADMIN`).
- `is_active` (boolean): Filter users by their active status (`true` or `false`).
- `search` (string): Intelligently searches through `name`, `email`, and `phone` simultaneously using a dynamic OR query!

### Example Requests:
*Fetch page 2 with 20 users per page:*
`GET /api/admin/users?page=2&limit=20`

*Find all deactivated STAFF members:*
`GET /api/admin/users?role=STAFF&is_active=false`

*Search for any user named "john", or with "john" in their email:*
`GET /api/admin/users?search=john`

*Combine them all!*
`GET /api/admin/users?page=1&limit=5&role=USER&is_active=true&search=john`

---

## 2. Update User Data
**Endpoint:** `PATCH /api/admin/users/:id`

Allows admins to modify specific fields of a target user. 
*Note: A standard ADMIN cannot promote a user to `ADMIN` or `SUPERADMIN`. This action strictly requires a `SUPERADMIN`.*

**Request Body (Optional fields):**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "whatsapp": "+1234567890",
  "role": "STAFF",
  "is_active": true
}
```

---

## 3. Force Delete a User
**Endpoint:** `DELETE /api/admin/users/:id`

Administrators can force a target user into a soft-deleted state, pending a 7-day permanent deletion process.
The database `AccountDeletion` audit log will perfectly capture `forceDelete: true` and exactly which Admin deleted them.

**Security Check:** This endpoint requires the Admin's own password to proceed.

**Request Body:**
```json
{
  "adminPassword": "my-secret-admin-password"
}
```

---

## 4. Bulk Force Delete
**Endpoint:** `POST /api/admin/users/delete-many`

Allows the frontend dashboard to check multiple users and execute a rapid mass-deletion inside a Prisma `$transaction`.

**Security Check:** Like the single deletion, this strictly requires the acting Admin's password.

**Request Body:**
```json
{
  "userIds": [
    "c8a149b5-...",
    "a1b2c3d4-..."
  ],
  "adminPassword": "my-secret-admin-password"
}
```

## 5. View Pending Deletions
**Endpoint:** `GET /api/admin/deleted-users`

Fetch all users currently sitting in the 7-day deletion queue.

**Query Parameters:**
- `page` & `limit` (Standard pagination)
- `forceDelete` (boolean): `true` finds users deleted by an Admin, `false` finds users who deleted themselves.

---

## 6. Restore a Deleted User
**Endpoint:** `POST /api/admin/users/:id/restore`

Allows an Administrator to securely cancel a pending deletion and fully restore the user account.

**Security Requirements:**
1. **Always requires:** The Admin's personal password.
2. **Override Requirement:** If the user deleted *themselves* (i.e., `forceDelete = false`), the system strictly requires the Admin to physically type the target user's email into the `confirmEmail` field to override the user's personal decision.

**Request Body (For Admin-Forced Deletion Recovery):**
```json
{
  "adminPassword": "my-secret-admin-password"
}
```

**Request Body (For Self-Deleted User Recovery):**
```json
{
  "adminPassword": "my-secret-admin-password",
  "confirmEmail": "target.user@example.com"
}
```

---

## Route Security
All of these routes are strictly protected by standard JWT authentication AND a secondary role-based authorization check. Standard users attempting to access these routes will receive a strict `403 Forbidden` rejection.
