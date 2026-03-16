/**
 * Development mode utilities
 * Only works in development environment
 */

export const DEV_TOKEN_PREFIX = "dev-token-";
export const DEV_USER_EMAIL = "dev@example.com";

export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isDevToken(token: string | undefined): boolean {
  return token?.startsWith(DEV_TOKEN_PREFIX) ?? false;
}

