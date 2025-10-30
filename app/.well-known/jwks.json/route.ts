/**
 * JWKS Endpoint
 * Serves the public keys in JWKS format for MyInfo to encrypt data
 */

import { NextResponse } from 'next/server';
import * as jose from 'jose';
import * as crypto from 'crypto';
import { getConfig } from '@/lib/myinfo/config';
import { importPrivateKey } from '@/lib/myinfo/crypto';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const config = getConfig();
    
    // Import private keys as CryptoKey
    const signingPrivateKey = await importPrivateKey(config.signingPrivateKey, 'ES256', { extractable: true });
    const encryptionPrivateKey = await importPrivateKey(config.encryptionPrivateKey, 'ECDH-ES+A256KW', { extractable: true });
    
    // Export private keys as JWK (which includes both private and public components)
    const signingJwkFull = await jose.exportJWK(signingPrivateKey);
    const encryptionJwkFull = await jose.exportJWK(encryptionPrivateKey);
    
    // Strip private key component (d) to create public-only JWK
    const signingJwk = {
      kty: signingJwkFull.kty,
      crv: signingJwkFull.crv,
      x: signingJwkFull.x,
      y: signingJwkFull.y,
      kid: signingJwkFull.kid,
      use: signingJwkFull.use,
      alg: signingJwkFull.alg,
    };
    
    const encryptionJwk = {
      kty: encryptionJwkFull.kty,
      crv: encryptionJwkFull.crv,
      x: encryptionJwkFull.x,
      y: encryptionJwkFull.y,
      kid: encryptionJwkFull.kid,
      use: encryptionJwkFull.use,
      alg: encryptionJwkFull.alg,
    };
    
    // Ensure proper key IDs and usage
    signingJwk.kid = 'sig-key-1';
    signingJwk.use = 'sig';
    signingJwk.alg = 'ES256';
    
    encryptionJwk.kid = 'enc-key-1';
    encryptionJwk.use = 'enc';
    encryptionJwk.alg = 'ECDH-ES+A256KW';
    
    const jwks = {
      keys: [signingJwk, encryptionJwk],
    };
    
    return NextResponse.json(jwks, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating JWKS:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { error: 'Failed to generate JWKS', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
