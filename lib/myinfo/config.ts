/**
 * MyInfo v5 Configuration
 * Loads configuration from environment variables
 */

import { MyInfoConfig } from './types';

// Staging endpoints
const STAGING_BASE_URL = 'https://stg-id.singpass.gov.sg';
const PRODUCTION_BASE_URL = 'https://id.singpass.gov.sg';

export const ENDPOINTS = {
  staging: {
    auth: `${STAGING_BASE_URL}/auth`,
    token: `${STAGING_BASE_URL}/token`,
    userinfo: `${STAGING_BASE_URL}/userinfo`,
    jwks: `${STAGING_BASE_URL}/.well-known/keys`,
  },
  production: {
    auth: `${PRODUCTION_BASE_URL}/auth`,
    token: `${PRODUCTION_BASE_URL}/token`,
    userinfo: `${PRODUCTION_BASE_URL}/userinfo`,
    jwks: `${PRODUCTION_BASE_URL}/.well-known/keys`,
  },
};

export function getConfig(): MyInfoConfig {
  const environment = (process.env.MYINFO_ENV || 'staging') as 'staging' | 'production';
  
  const clientId = process.env.MYINFO_CLIENT_ID;
  if (!clientId) {
    throw new Error('MYINFO_CLIENT_ID environment variable is required');
  }

  const redirectUri = process.env.MYINFO_REDIRECT_URI;
  if (!redirectUri) {
    throw new Error('MYINFO_REDIRECT_URI environment variable is required');
  }

  const jwksUri = process.env.MYINFO_JWKS_URI;
  if (!jwksUri) {
    throw new Error('MYINFO_JWKS_URI environment variable is required');
  }

  const signingPrivateKey = process.env.MYINFO_SIGNING_PRIVATE_KEY;
  if (!signingPrivateKey) {
    throw new Error('MYINFO_SIGNING_PRIVATE_KEY environment variable is required');
  }

  const encryptionPrivateKey = process.env.MYINFO_ENCRYPTION_PRIVATE_KEY;
  if (!encryptionPrivateKey) {
    throw new Error('MYINFO_ENCRYPTION_PRIVATE_KEY environment variable is required');
  }

  const scopes = process.env.MYINFO_SCOPES || 'openid name';

  return {
    environment,
    clientId,
    redirectUri,
    jwksUri,
    signingPrivateKey,
    encryptionPrivateKey,
    scopes,
  };
}

export function getEndpoints() {
  const env = (process.env.MYINFO_ENV || 'staging') as 'staging' | 'production';
  return ENDPOINTS[env];
}

