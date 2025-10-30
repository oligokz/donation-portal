/**
 * MyInfo Service
 * Handles OAuth flow, token exchange, and person data retrieval
 */

import axios from 'axios';
import * as jose from 'jose';
import { getConfig, getEndpoints } from './config';
import { generatePKCE, generateEphemeralKeyPair, generateClientAssertion, generateDpopProof, importPrivateKey, computeJwkThumbprint } from './crypto';
import type { MyInfoPersonData, TokenResponse, EphemeralKeyPair, AuthSessionData } from './types';

const ENDPOINTS = getEndpoints();

// Note: getAuthorizationUrl function removed - logic moved to route handler

/**
 * Exchange authorization code for access token
 */
export async function exchangeToken(
  code: string,
  state: string,
  sessionData: AuthSessionData
): Promise<TokenResponse> {
  const config = getConfig();
  const privateSigningKey = await importPrivateKey(config.signingPrivateKey, 'ES256');

  // Generate client assertion
  // Note: According to MyInfo v5 docs, cnf.jkt should be the ephemeral DPoP key thumbprint
  const clientAssertion = await generateClientAssertion(
    config.clientId,
    ENDPOINTS.token,
    sessionData.ephemeralKeyPair.thumbprint,
    privateSigningKey
  );

  // Generate DPoP proof for token request
  const dpopProof = await generateDpopProof(
    ENDPOINTS.token,
    'POST',
    sessionData.ephemeralKeyPair
  );

  const data = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: sessionData.codeVerifier,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: clientAssertion,
  });


  try {
    const response = await axios.post<TokenResponse>(ENDPOINTS.token, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'DPoP': dpopProof,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Token exchange failed:');
    if (axios.isAxiosError(error) && error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Response Data:', error.response.data);
      console.error('  Response Headers:', error.response.headers);
    } else if (axios.isAxiosError(error)) {
      console.error('  Message:', error.message);
      console.error('  Config:', error.config);
    } else {
      console.error('  Error:', error);
    }
    throw error;
  }
}

/**
 * Retrieve person data from MyInfo userinfo endpoint
 */
export async function getPersonData(
  accessToken: string,
  ephemeralKeyPair: EphemeralKeyPair,
  tokenType: string = 'DPoP'
): Promise<string> {
  // Prepare headers based on token type
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (tokenType.toLowerCase() === 'dpop') {
    // DPoP flow: include DPoP proof and use DPoP authorization scheme
    const dpopProof = await generateDpopProof(
      ENDPOINTS.userinfo,
      'GET',
      ephemeralKeyPair,
      accessToken
    );

    headers['Authorization'] = `DPoP ${accessToken}`;
    headers['DPoP'] = dpopProof;
  } else {
    // Bearer flow: standard Bearer token (fallback for staging)
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.get(ENDPOINTS.userinfo, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Userinfo request failed:');
    if (axios.isAxiosError(error) && error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Response Data:', error.response.data);
    } else if (axios.isAxiosError(error)) {
      console.error('  Message:', error.message);
    } else {
      console.error('  Error:', error);
    }
    throw error;
  }
}

/**
 * Decrypt JWE and verify JWS signature
 */
export async function decryptAndVerifyPersonData(encryptedData: string): Promise<MyInfoPersonData> {
  try {
    const config = getConfig();

    // Import encryption private key
    const encryptionKey = await importPrivateKey(config.encryptionPrivateKey, 'ECDH-ES+A256KW');

    // Decrypt the JWE
    const decrypted = await jose.compactDecrypt(encryptedData, encryptionKey);
    const jws = new TextDecoder().decode(decrypted.plaintext);

    // Fetch MyInfo public keys for verification
    const jwksUrl = ENDPOINTS.jwks;
    const JWKS = jose.createRemoteJWKSet(new URL(jwksUrl));

    // Verify and decode the JWS
    const { payload } = await jose.jwtVerify(jws, JWKS);

    return payload as unknown as MyInfoPersonData;
  } catch (error) {
    console.error('Error decrypting/verifying person data:', error);
    throw error;
  }
}

/**
 * Fetch MyInfo's public JWKS
 */
export async function getMyInfoJWKS() {
  const response = await axios.get(ENDPOINTS.jwks);
  return response.data;
}

