/**
 * TypeScript types for MyInfo v5 integration
 */

export interface MyInfoConfig {
  environment: 'staging' | 'production';
  clientId: string;
  redirectUri: string;
  jwksUri: string;
  signingPrivateKey: string;
  encryptionPrivateKey: string;
  scopes: string;
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

export interface PersonName {
  value: string;
}

export interface PersonInfo {
  name: PersonName;
  uinfin?: string;
}

export interface MyInfoPersonData {
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  person_info?: PersonInfo;
  // Allow additional properties for flexibility with actual API response
  [key: string]: any;
}

export interface EphemeralKeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicJwk: JsonWebKey;
  thumbprint: string;
}

export interface AuthSessionData {
  codeVerifier: string;
  state: string;
  ephemeralKeyPair: EphemeralKeyPair;
}

export interface MyInfoError {
  error: string;
  error_description?: string;
  code?: number;
  message?: string;
}

