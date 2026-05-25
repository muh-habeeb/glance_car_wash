# Glance Car Wash - Authentication & User API Documentation

## 🔐 Authentication Strategies
The API supports an industry-standard dual-authentication strategy, allowing flexibility for both web browsers and mobile applications.

### 1. HTTP-Only Cookies (Best for Web Browsers)
When a user logs in, the server automatically sets two secure, HTTP-only cookies (`accessToken` and `refreshToken`). 
- **Advantage:** Browsers handle these automatically. You do not need to manually attach tokens to your requests. They are immune to XSS attacks.

### 2. Bearer Tokens (Best for Mobile Apps)
The login and refresh endpoints also return the raw `accessToken` and `refreshToken` in the JSON payload.
- **Advantage:** Mobile apps (Flutter, React Native) can securely store these tokens (e.g., in SecureStorage) and manually attach them to API requests using the `Authorization: Bearer <token>` header.
- The server automatically checks cookies first, and gracefully falls back to checking the Bearer header if no cookies are found.

---

## 🛣️ API Routes

All user routes are prefixed with `/api/users`.

### 1. Register User
- **Method:** `POST`
- **Endpoint:** `/api/users/`
- **Access:** Public
- **Description:** Creates a new user account.

**Payload:**
| Field      | Type   | Status     | Validation Rules |
|------------|--------|------------|------------------|
| `name`     | String | **Required** | Minimum 2 characters |
| `email`    | String | **Required** | Valid email format |
| `password` | String | **Required** | Minimum 6 characters |
| `phone`    | String | **Required** | International format (e.g., `+971501234567`) |
| `whatsapp` | String | Optional   | International format (e.g., `+971501234567`) |

### 2. Login User
- **Method:** `POST`
- **Endpoint:** `/api/users/login`
- **Access:** Public
- **Description:** Authenticates a user and issues JWT tokens.

**Payload:**
| Field      | Type   | Status     | Validation Rules |
|------------|--------|------------|------------------|
| `email`    | String | **Required** | Valid email format |
| `password` | String | **Required** | Must not be empty |

**Response:** Sets secure cookies and returns tokens in JSON format.

### 3. Get Profile
- **Method:** `GET`
- **Endpoint:** `/api/users/`
- **Access:** Private (Requires Token)
- **Description:** Retrieves the logged-in user's safe profile details.

### 4. Update Profile
- **Method:** `PATCH`
- **Endpoint:** `/api/users/`
- **Access:** Private (Requires Token)
- **Description:** Updates the logged-in user's profile. Strict Row-Level Security prevents editing other users. Cannot update restricted fields (`role`, `is_active`, `id`, `email`).

**Payload (All fields are optional, send only what you want to update):**
| Field             | Type   | Status       | Validation Rules |
|-------------------|--------|--------------|------------------|
| `name`            | String | Optional     | Minimum 2 characters |
| `phone`           | String | Optional*    | International format (`+971...`) |
| `whatsapp`        | String | Optional     | International format (`+971...`) |
| `password`        | String | Optional**   | Minimum 6 characters |
| `confirmPassword` | String | Required**   | Must match `password` exactly |
| `currentPassword` | String | Required**   | Must match DB password |

*\* Note: Even though `phone` is required during registration, you do not need to send it during a PATCH request unless you are actively changing it.*
*\*\* Note: If you choose to update your `password`, the `currentPassword` and `confirmPassword` fields instantly become **strictly required**.*

### 5. Refresh Token
- **Method:** `POST`
- **Endpoint:** `/api/users/refresh`
- **Access:** Public (Requires valid Refresh Token)
- **Description:** Generates a new 7-minute `accessToken` using the long-lived 7-day `refreshToken`.

### 6. Delete Account (Soft Delete)
- **Method:** `DELETE`
- **Endpoint:** `/api/users/`
- **Access:** Private (Requires Token)
- **Description:** Requests a permanent account deletion. The account is immediately deactivated and the user is logged out. The account will be permanently deleted after a 7-day grace period. If the user logs back in during this 7-day window, the deletion request is cancelled and the account is restored.

**Payload:**
| Field      | Type   | Status     | Validation Rules |
|------------|--------|------------|------------------|
| `password` | String | **Required** | Must match current password to confirm deletion |

### 7. Logout
- **Method:** `POST`
- **Endpoint:** `/api/users/logout`
- **Access:** Public
- **Description:** Clears the secure authentication cookies.

---

## 🧪 Testing Guide (Postman / Insomnia)

### Testing via Cookies (Automated)
1. Hit `POST /api/users/login` with your credentials.
2. Ensure your testing client is configured to "Save Cookies" automatically.
3. Hit `GET /api/users/` - it will succeed because the client automatically attached the secure cookie.

### Testing via Bearer Token (Manual)
1. Hit `POST /api/users/login` with your credentials.
2. Look at the JSON response body and copy the `accessToken` string.
3. Open a new request to `GET /api/users/`.
4. Go to the **Headers** tab (or Auth tab).
5. Add `Authorization` as the key, and `Bearer YOUR_COPIED_TOKEN_HERE` as the value.
6. Send the request. It will succeed!

---

## 📱 Mobile App Integration Guide (Flutter / React Native)

Mobile applications do not handle HTTP-Only cookies automatically like web browsers do. For mobile apps, you must use the **Bearer Token** architecture to maintain high security.

### 1. Secure Storage
When a user logs in via `POST /api/users/login`, you will receive the tokens in the JSON response:
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJh...",
  "refreshToken": "eyJh..."
}
```
**CRITICAL:** Immediately store both tokens in a secure vault (e.g., `flutter_secure_storage` in Flutter or `Keychain`/`EncryptedSharedPreferences` in React Native). Do not store them in plain text storage like `SharedPreferences`.

### 2. Making Authenticated Requests
For every API call to a private endpoint (like `GET /api/users/`), you must manually attach the short-lived `accessToken` to the HTTP headers:
```http
Authorization: Bearer <your_stored_access_token>
```
Our backend will instantly detect this header, validate the token, and process the request.

### 3. Handling Token Expiration (The Refresh Flow)
Because the `accessToken` expires every 7 minutes, you must handle the silent refresh flow:
1. Make your standard API request using the `accessToken`.
2. If the server responds with a `401 Unauthorized` status code, intercept the error.
3. Secretly pause the user's action and send a request to `POST /api/users/refresh`. Since you are on mobile, you can send the refresh token in the body (if configured) or cookies. *Note: If your mobile HTTP client doesn't automatically pass cookies, you may need to manually extract the Set-Cookie header or we can update the refresh endpoint to accept it via Bearer or Body.*
4. Retrieve the fresh `accessToken` and `refreshToken` from the response.
5. Save the new tokens back to Secure Storage.
6. Automatically retry the original failed request with the new `accessToken`. The user will never know it happened!
