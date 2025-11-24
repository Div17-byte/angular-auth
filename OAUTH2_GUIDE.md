# OAuth 2.0 Implementation Guide

This project now supports OAuth 2.0 authentication in addition to the regular JWT-based authentication.

## Features

### Server-Side (Node.js with TypeScript)

- ✅ OAuth 2.0 Token Endpoint (`POST /oauth/token`)
- ✅ OAuth 2.0 Authorization Endpoint (`GET /oauth/authorize`)
- ✅ Token Info Endpoint (`GET /oauth/token/info`)
- ✅ Support for Password Grant flow
- ✅ Support for Refresh Token flow
- ✅ OAuth token store with automatic cleanup

### Client-Side (Angular)

- ✅ Dedicated OAuth 2.0 login component
- ✅ OAuth authentication service methods
- ✅ Token refresh capability
- ✅ Route for OAuth login (`/oauth-login`)

## OAuth 2.0 Flows Implemented

### 1. Password Grant (Resource Owner Password Credentials)

This flow allows clients to exchange username and password directly for an access token.

**Endpoint:** `POST http://localhost:4000/oauth/token`

**Request Body:**

```
grant_type=password
username=user@example.com
password=password123
client_id=angular-app
client_secret=angular-secret
scope=read write
```

**Response:**

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "...",
  "scope": "read write"
}
```

### 2. Refresh Token Grant

This flow allows clients to exchange a refresh token for a new access token.

**Endpoint:** `POST http://localhost:4000/oauth/token`

**Request Body:**

```
grant_type=refresh_token
refresh_token=...
client_id=angular-app
client_secret=angular-secret
```

**Response:**

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "...",
  "scope": "read write"
}
```

### 3. Authorization Code Grant

Currently implemented as a basic authorization endpoint for future use.

**Endpoint:** `GET http://localhost:4000/oauth/authorize`

**Query Parameters:**

- `client_id`: The client identifier
- `redirect_uri`: The URI to redirect to after authorization
- `response_type`: Must be "code"
- `scope`: Requested permissions
- `state`: CSRF protection state

## Configuration

### Server Configuration

The OAuth server is configured with the following defaults:

```typescript
OAuth Client:
- ID: "angular-app"
- Secret: "angular-secret"
- Grants: ["authorization_code", "refresh_token", "password"]
- Redirect URIs: ["http://localhost:4200/oauth/callback"]
```

### Environment Variables

```env
JWT_SECRET=your-secret-key
TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=4000
```

## Usage in Angular

### Using OAuth Login Component

Navigate to `/oauth-login` to use the OAuth 2.0 login flow.

```typescript
// In your component
this.router.navigate(["/oauth-login"]);
```

### Using Auth Service

```typescript
// OAuth Login
this.authService.loginWithOAuth(email, password).subscribe({
  next: (response) => {
    console.log("Access Token:", response.access_token);
    console.log("Refresh Token:", response.refresh_token);
  },
  error: (error) => {
    console.error("OAuth Login failed:", error);
  },
});

// Refresh OAuth Token
this.authService.refreshOAuthToken().subscribe({
  next: (response) => {
    console.log("New Access Token:", response.access_token);
  },
});

// Check if logged in with OAuth
if (this.authService.isOAuthLogin()) {
  console.log("Using OAuth authentication");
}
```

## API Endpoints

### Regular Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/dashboard` - Protected resource

### OAuth 2.0 Authentication

- `POST /oauth/token` - Get access token (Password Grant / Refresh Token)
- `GET /oauth/authorize` - Authorization endpoint
- `GET /oauth/token/info` - Get token information

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for OAuth flows in production
2. **Secure Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
3. **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
4. **Client Secrets**: In production, implement proper client secret validation
5. **Scope Validation**: Implement proper scope-based authorization

## File Structure

### Server

```
server/
├── routes/
│   └── oauth2.ts          # OAuth 2.0 routes
├── store/
│   └── oauth.ts           # OAuth token storage
└── index.ts               # Updated to include OAuth routes
```

### Angular

```
src/app/
├── components/
│   └── oauth-login/       # OAuth login component
│       ├── oauth-login.component.ts
│       ├── oauth-login.component.html
│       └── oauth-login.component.scss
├── services/
│   └── auth.service.ts    # Updated with OAuth methods
└── app.routes.ts          # Added OAuth login route
```

## Testing

### Test Server

```bash
cd server
npm run dev
```

Server will start on `http://localhost:4000`

### Test Angular App

```bash
npm start
```

App will start on `http://localhost:4200`

### Test OAuth Flow

1. Navigate to `http://localhost:4200/oauth-login`
2. Enter credentials (use email that exists in server store)
3. Login with OAuth 2.0
4. Verify redirect to dashboard

## Future Enhancements

- [ ] Implement Authorization Code Grant flow with PKCE
- [ ] Add Implicit Grant flow
- [ ] Implement proper scope-based authorization
- [ ] Add token revocation endpoint
- [ ] Implement OAuth client management UI
- [ ] Add support for third-party OAuth providers (Google, GitHub, etc.)
- [ ] Store tokens in database instead of memory
- [ ] Add rate limiting for OAuth endpoints
