import express, { Request, Response } from "express";
import {
  getAccessToken,
  getRefreshToken,
  getClient,
  saveToken,
  generateAccessToken,
  generateRefreshToken
} from "../store/oauth";
import { findUserByEmail } from "../store/users";
import crypto from "crypto";

const router = express.Router();

interface TokenRequest extends Request {
  body: {
    grant_type: string;
    username?: string;
    password?: string;
    refresh_token?: string;
  };
}

// OAuth 2.0 Token Endpoint (Authorization Code & Password Grant)
router.post("/token", async (req: TokenRequest, res: Response): Promise<void> => {
  const { grant_type, username, password, refresh_token } = req.body;

  if (grant_type === "password") {
    // Password Grant (Resource Owner Password Credentials)
    if (!username || !password) {
      res.status(400).json({ error: "invalid_request", error_description: "Username and password required" });
      return;
    }

    const user = findUserByEmail(username);
    if (!user) {
      res.status(401).json({ error: "invalid_grant", error_description: "Invalid credentials" });
      return;
    }

    // For demo purposes, we'll skip password check for OAuth
    // In production, verify password here

    const accessToken = generateAccessToken();
    const refreshToken = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    const token = {
      accessToken,
      accessTokenExpiresAt: expiresAt,
      refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt,
      client: getClient("angular-app", "angular-secret") as any,
      user,
      scope: "read write"
    };

    saveToken(token);

    res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 900, // 15 minutes
      refresh_token: refreshToken,
      scope: "read write"
    });
  } else if (grant_type === "refresh_token") {
    // Refresh Token Grant
    if (!refresh_token) {
      res.status(400).json({ error: "invalid_request", error_description: "Refresh token required" });
      return;
    }

    const oldToken = getRefreshToken(refresh_token);

    if (!oldToken || (oldToken.refreshTokenExpiresAt && oldToken.refreshTokenExpiresAt < new Date())) {
      res.status(401).json({ error: "invalid_grant", error_description: "Invalid refresh token" });
      return;
    }

    const accessToken = generateAccessToken();
    const newRefreshToken = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    // Update token
    oldToken.accessToken = accessToken;
    oldToken.refreshToken = newRefreshToken;
    oldToken.accessTokenExpiresAt = expiresAt;
    oldToken.refreshTokenExpiresAt = refreshExpiresAt;

    res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 900,
      refresh_token: newRefreshToken,
      scope: "read write"
    });
  } else {
    res.status(400).json({ error: "unsupported_grant_type", error_description: "Unsupported grant type" });
  }
});

// OAuth 2.0 Authorization Endpoint
router.get("/authorize", (req: Request, res: Response): void => {
  const { redirect_uri, response_type, state } = req.query;

  if (response_type !== "code") {
    res.status(400).json({ error: "unsupported_response_type" });
    return;
  }

  // For this demo, we'll skip the authorization page and directly return an authorization code
  // In production, you'd show a consent page to the user
  const authCode = crypto.randomBytes(32).toString("hex");

  // Store the auth code temporarily (in production, use a proper store with expiration)
  // For now, we'll just redirect with the code
  const redirect = `${redirect_uri}?code=${authCode}&state=${state}`;
  res.redirect(redirect);
});

// Token info endpoint
router.get("/token/info", (req: Request, res: Response): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({ error: "unauthorized", error_description: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "unauthorized", error_description: "Malformed token" });
    return;
  }

  const oauthToken = getAccessToken(token);

  if (!oauthToken) {
    res.status(401).json({ error: "unauthorized", error_description: "Invalid token" });
    return;
  }

  res.json({
    user_id: oauthToken.user.id,
    email: oauthToken.user.email,
    scope: oauthToken.scope || "read write",
    expires_in: oauthToken.accessTokenExpiresAt
      ? Math.floor((oauthToken.accessTokenExpiresAt.getTime() - Date.now()) / 1000)
      : null
  });
});

export default router;

