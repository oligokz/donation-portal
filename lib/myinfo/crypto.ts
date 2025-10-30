/**
 * Crypto utilities for MyInfo v5 integration
 * Handles PKCE, DPoP keys, JWK thumbprints, and JWT signing
 */

import * as crypto from 'crypto';
import * as jose from 'jose';
import { EphemeralKeyPair } from './types';

/**
 * Base64URL encode a buffer
 */
export function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Base64URL decode a string
 */
export function base64UrlDecode(str: string): Buffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  return Buffer.from(padded, 'base64');
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge };
}

/**
 * Compute JWK thumbprint (SHA-256)
 */
export async function computeJwkThumbprint(jwk: JsonWebKey): Promise<string> {
  // JWK thumbprint calculation according to RFC 7638
  const sortedJwk = {
    crv: jwk.crv,
    kty: jwk.kty,
    x: jwk.x,
    y: jwk.y,
  };
  const json = JSON.stringify(sortedJwk);
  const hash = crypto.createHash('sha256').update(json).digest();
  return base64UrlEncode(hash);
}

/**
 * Generate ephemeral DPoP key pair (ECDSA P-256)
 */
export async function generateEphemeralKeyPair(): Promise<EphemeralKeyPair> {
  // Generate ECDSA P-256 key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  // Import keys as JWK format
  const privateJwk = await jose.importPKCS8(privateKey, 'ES256');
  const publicJwk = await jose.importSPKI(publicKey, 'ES256');
  
  // Convert to JSON format
  const publicJwkJson = await jose.exportJWK(publicJwk);
  
  // Compute thumbprint
  const thumbprint = await computeJwkThumbprint(publicJwkJson);

  return {
    privateKey: privateJwk,
    publicKey: publicJwk,
    publicJwk: publicJwkJson,
    thumbprint,
  };
}

/**
 * Compute access token hash (ath) for DPoP
 */
export function computeAth(accessToken: string): string {
  const hash = crypto.createHash('sha256').update(accessToken).digest();
  return base64UrlEncode(hash);
}

/**
 * Normalize PEM key string (handle escaped newlines)
 */
function normalizePemKey(pemKey: string): string {
  // Replace escaped newlines with actual newlines
  return pemKey.replace(/\\n/g, '\n');
}

/**
 * Import private key from PEM string (supports both SEC1 and PKCS8)
 */
export async function importPrivateKey(pemKey: string, algorithm: string = 'ES256', options?: { extractable?: boolean }): Promise<CryptoKey> {
  // Normalize the key string
  const normalizedKey = normalizePemKey(pemKey);
  
  // First, try to detect and handle the key using Node.js crypto (which handles both formats)
  try {
    const keyObject = crypto.createPrivateKey(normalizedKey);
    const pkcs8Pem = keyObject.export({ type: 'pkcs8', format: 'pem' }) as string;
    return await jose.importPKCS8(pkcs8Pem, algorithm, options);
  } catch (nodeError) {
    // If that fails, try direct PKCS8 import
    try {
      return await jose.importPKCS8(normalizedKey, algorithm, options);
    } catch (pkcs8Error) {
      throw new Error(`Failed to import private key. Tried Node.js conversion and direct PKCS8. Errors: Node=${String(nodeError)}, PKCS8=${String(pkcs8Error)}`);
    }
  }
}

/**
 * Import public key from PEM string (supports both SPKI and SEC1)
 */
export async function importPublicKey(pemKey: string, algorithm: string = 'ES256'): Promise<CryptoKey> {
  // Normalize the key string
  const normalizedKey = normalizePemKey(pemKey);
  
  // First, try to detect and handle the key using Node.js crypto (which handles both formats)
  try {
    const keyObject = crypto.createPublicKey(normalizedKey);
    const spkiPem = keyObject.export({ type: 'spki', format: 'pem' }) as string;
    return await jose.importSPKI(spkiPem, algorithm);
  } catch (nodeError) {
    // If that fails, try direct SPKI import
    try {
      return await jose.importSPKI(normalizedKey, algorithm);
    } catch (spkiError) {
      throw new Error(`Failed to import public key. Tried Node.js conversion and direct SPKI. Errors: Node=${String(nodeError)}, SPKI=${String(spkiError)}`);
    }
  }
}

/**
 * Generate client assertion JWT
 */
export async function generateClientAssertion(
  clientId: string,
  tokenUrl: string,
  jwkThumbprint: string,
  privateKey: CryptoKey
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    sub: clientId,
    iss: clientId,
    aud: tokenUrl,
    iat: now,
    exp: now + 300, // 5 minutes expiry
    jti: crypto.randomBytes(20).toString('hex'),
    cnf: { jkt: jwkThumbprint },
  };

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .sign(privateKey);

  return jwt;
}

/**
 * Generate DPoP proof JWT
 */
export async function generateDpopProof(
  url: string,
  method: string,
  ephemeralKeyPair: EphemeralKeyPair,
  accessToken?: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload: Record<string, any> = {
    jti: crypto.randomBytes(20).toString('hex'),
    htu: url,
    htm: method.toUpperCase(),
    iat: now,
    exp: now + 120, // 2 minutes expiry
  };

  // Include access token hash for resource requests
  if (accessToken) {
    payload.ath = computeAth(accessToken);
  }

  const jwkCopy = { ...ephemeralKeyPair.publicJwk };
  jwkCopy.alg = 'ES256';
  jwkCopy.use = 'sig';

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ 
      alg: 'ES256',
      typ: 'dpop+jwt',
      jwk: jwkCopy 
    })
    .sign(ephemeralKeyPair.privateKey);

  return jwt;
}
