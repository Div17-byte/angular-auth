import { User } from "./users";

export interface OAuthClient {
  id: string;
  secret: string;
  grants: string[];
  redirectUris: string[];
}

export interface OAuthToken {
  accessToken: string;
  accessTokenExpiresAt?: Date;
  refreshToken: string;
  refreshTokenExpiresAt?: Date;
  client: OAuthClient;
  user: User;
  scope?: string;
}

const oauthClient: OAuthClient = {
  id: "angular-app",
  secret: "angular-secret",
  grants: ["authorization_code", "refresh_token", "password"],
  redirectUris: ["http://localhost:4200/oauth/callback"]
};

let oauthTokens: OAuthToken[] = [];

// Find token by access token
export function getAccessToken(token: string): OAuthToken | undefined {
  return oauthTokens.find((t) => t.accessToken === token);
}

// Find token by refresh token
export function getRefreshToken(token: string): OAuthToken | undefined {
  return oauthTokens.find((t) => t.refreshToken === token);
}

// Save OAuth token
export function saveToken(token: OAuthToken): void {
  oauthTokens.push(token);
}

// Delete token
export function deleteToken(token: string): void {
  oauthTokens = oauthTokens.filter((t) => t.accessToken !== token);
}

// Get OAuth client
export function getClient(clientId: string, clientSecret: string): OAuthClient | null {
  if (oauthClient.id === clientId && oauthClient.secret === clientSecret) {
    return oauthClient;
  }
  return null;
}

// Generate new access token
export function generateAccessToken(): string {
  return require("crypto").randomBytes(64).toString("hex");
}

// Generate new refresh token
export function generateRefreshToken(): string {
  return require("crypto").randomBytes(64).toString("hex");
}

export { oauthClient };

