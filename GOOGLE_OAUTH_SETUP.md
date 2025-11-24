# Google OAuth 2.0 Login Setup

This guide explains how to set up Google OAuth 2.0 login for your Angular authentication app.

## Features

- ✅ Google Sign-In button on login page
- ✅ Automatic user registration on first Google login
- ✅ JWT token generation for authenticated users
- ✅ Redirect flow with OAuth 2.0
- ✅ Secure session management with Passport.js

## Prerequisites

1. A Google Cloud Project
2. OAuth 2.0 credentials (Client ID and Client Secret)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Identity Platform API)

## Step 2: Create OAuth 2.0 Credentials

1. In the Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure the consent screen if prompted
5. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
6. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:4000/api/auth/google/callback
JWT_SECRET=your-jwt-secret-key
TOKEN_EXPIRES_IN=15m
PORT=4000
SESSION_SECRET=your-session-secret
```

**Important**: Add `.env` to `.gitignore` and never commit your secrets!

## Step 4: Install Dependencies

Dependencies are already installed:

- `passport`
- `passport-google-oauth20`
- `express-session`

## Step 5: How It Works

### Server Flow

1. User clicks "Sign in with Google" button
2. Angular redirects to `/api/auth/google`
3. Server redirects to Google's OAuth consent screen
4. User authorizes the application
5. Google redirects back to `/api/auth/google/callback`
6. Server:
   - Verifies the user's Google account
   - Checks if user exists in database
   - Creates user if doesn't exist
   - Generates JWT access token and refresh token
   - Redirects to Angular app with tokens in query params

### Angular Flow

1. Angular receives tokens via `auth/callback` route
2. Tokens are stored in localStorage
3. User is redirected to dashboard
4. JWT token is used for authenticated API calls

## Step 6: Testing

### Start the Server

```bash
cd server
npm run dev
```

Server will start on `http://localhost:4000`

### Start the Angular App

```bash
npm start
```

App will start on `http://localhost:4200`

### Test the Flow

1. Navigate to `http://localhost:4200/google-login`
2. Click "Sign in with Google"
3. Select your Google account
4. Authorize the application
5. You'll be redirected back to the dashboard
6. Verify authentication by checking the console for tokens

## API Endpoints

### Google OAuth Endpoints

- `GET /api/auth/google` - Initiates Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout endpoint

### Regular Auth Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/dashboard` - Protected resource

## File Structure

### Server

```
server/
├── routes/
│   └── google-auth.ts        # Google OAuth routes
├── middleware/
│   └── authenticate.ts        # JWT authentication
├── store/
│   ├── users.ts              # User storage
│   └── refreshTokens.ts      # Token storage
└── index.ts                  # App initialization
```

### Angular

```
src/app/
├── components/
│   ├── google-login/         # Google login component
│   │   ├── google-login.component.ts
│   │   ├── google-login.component.html
│   │   └── google-login.component.scss
│   └── login/                # Regular login component
├── services/
│   └── auth.service.ts       # Authentication service
└── app.routes.ts             # Routes configuration
```

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for OAuth redirects in production
2. **State Parameter**: Implement CSRF protection with state parameter
3. **Token Security**: Store tokens securely (consider httpOnly cookies)
4. **Session Security**: Use secure session configuration in production
5. **Environment Variables**: Never commit secrets to version control

## Customization

### Change Scopes

Edit `server/routes/google-auth.ts`:

```typescript
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "openid"], // Add more scopes here
  })
);
```

### Change Redirect URLs

Update environment variables:

```env
CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:4200
```

### Add User Profile Information

In `google-auth.ts`, you can access additional profile data:

```typescript
const displayName = profile.displayName;
const photo = profile.photos?.[0]?.value;
const googleId = profile.id;
```

## Troubleshooting

### Error: "redirect_uri_mismatch"

- Ensure your redirect URI in Google Console exactly matches `CALLBACK_URL`
- Check for trailing slashes and protocol (http vs https)

### Error: "Error 400: redirect_uri_mismatch"

- Verify the redirect URI is added to authorized redirect URIs in Google Console
- Make sure you're using the correct Client ID

### Error: "Cannot connect to server"

- Check if the server is running on port 4000
- Verify CORS configuration allows requests from localhost:4200

### Google Login Opens but Doesn't Redirect

- Check browser console for errors
- Verify the callback URL is correctly configured
- Ensure tokens are being generated on the server

## Production Deployment

1. Update environment variables for production URLs
2. Use environment-specific Client IDs
3. Configure proper CORS settings
4. Enable HTTPS
5. Set secure session configuration
6. Update authorized redirect URIs in Google Console

## Next Steps

- [ ] Add Facebook login
- [ ] Add GitHub login
- [ ] Add LinkedIn login
- [ ] Implement profile management
- [ ] Add account linking (Google + email)
- [ ] Add logout functionality
- [ ] Implement token refresh with Google tokens
