/**
 * MyInfo Login Initiation
 * Redirects user to Singpass for authentication
 */

import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { generatePKCE, generateEphemeralKeyPair } from '@/lib/myinfo/crypto';
import { storeSession } from '@/lib/myinfo/session';
import type { AuthSessionData } from '@/lib/myinfo/types';

export async function GET() {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();
    
    // Generate ephemeral key pair for DPoP
    const ephemeralKeyPair = await generateEphemeralKeyPair();
    
    // Create session data
    const sessionData: AuthSessionData = {
      codeVerifier,
      state,
      ephemeralKeyPair,
    };
    
    // Store session data
    storeSession(state, sessionData);
    
    // Construct authorization URL
    const endpoints = {
      staging: 'https://stg-id.singpass.gov.sg/auth',
      production: 'https://id.singpass.gov.sg/auth',
    };
    const env = (process.env.MYINFO_ENV || 'staging') as 'staging' | 'production';
    
    const config = {
      clientId: process.env.MYINFO_CLIENT_ID!,
      scopes: process.env.MYINFO_SCOPES || 'openid name',
      redirectUri: process.env.MYINFO_REDIRECT_URI!,
    };
    
    // Generate nonce for ID token validation
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      scope: config.scopes,
      redirect_uri: config.redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    });
    
    const authUrl = `${endpoints[env]}?${params.toString()}`;
    
    // Redirect to Singpass
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating login:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}

