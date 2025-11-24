export interface RefreshToken {
  token: string;
  userId: number;
  expiresAt: Date;
}

let refreshTokens: RefreshToken[] = [];

export function saveRefreshToken(token: string, userId: number, expiresInDays: number = 7): void {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  refreshTokens.push({
    token,
    userId,
    expiresAt,
  });
}

export function findRefreshToken(token: string): RefreshToken | undefined {
  const refreshToken = refreshTokens.find((rt) => rt.token === token);

  // Check if token is expired
  if (refreshToken && refreshToken.expiresAt < new Date()) {
    deleteRefreshToken(token);
    return undefined;
  }

  return refreshToken;
}

export function deleteRefreshToken(token: string): void {
  refreshTokens = refreshTokens.filter((rt) => rt.token !== token);
}

export function deleteAllUserTokens(userId: number): void {
  refreshTokens = refreshTokens.filter((rt) => rt.userId !== userId);
}

// Clean up expired tokens periodically
export function cleanupExpiredTokens(): void {
  refreshTokens = refreshTokens.filter((rt) => rt.expiresAt >= new Date());
}

