/**
 * OAuth Callback Handler
 * Processes the authorization code and retrieves person data
 */

import { NextResponse, NextRequest } from 'next/server';
import { exchangeToken, getPersonData, decryptAndVerifyPersonData } from '@/lib/myinfo/service';
import { getSession, deleteSession } from '@/lib/myinfo/session';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Get the base URL from environment variable
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.qemura.xyz';
    
    // Build absolute redirect URL
    const redirectUrl = new URL('/', baseUrl);
    
    // Handle error response
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      console.error('OAuth error:', error, errorDescription);
      redirectUrl.searchParams.set('error', error);
      redirectUrl.searchParams.set('error_description', errorDescription);
      return NextResponse.redirect(redirectUrl.toString());
    }
    
    // Validate required parameters
    if (!code || !state) {
      redirectUrl.searchParams.set('error', 'missing_parameters');
      return NextResponse.redirect(redirectUrl.toString());
    }
    
    // Retrieve session data
    const sessionData = getSession(state);
    if (!sessionData) {
      redirectUrl.searchParams.set('error', 'invalid_session');
      return NextResponse.redirect(redirectUrl.toString());
    }
    
    try {
      // Exchange authorization code for access token
      const tokenResponse = await exchangeToken(code, state, sessionData);
      
      // Retrieve person data (pass token type for adaptive authorization)
      const encryptedData = await getPersonData(
        tokenResponse.access_token,
        sessionData.ephemeralKeyPair,
        tokenResponse.token_type
      );
      
      // Decrypt and verify person data
      const personData = await decryptAndVerifyPersonData(encryptedData);
      
      // Clean up session
      deleteSession(state);
      
      // Redirect to home with person data
      const name = personData.person_info?.name?.value || personData.name?.value || personData.name || 'Unknown';
      redirectUrl.searchParams.set('name', name);
      return NextResponse.redirect(redirectUrl.toString());
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      deleteSession(state);
      redirectUrl.searchParams.set('error', 'token_exchange_failed');
      return NextResponse.redirect(redirectUrl.toString());
    }
  } catch (error) {
    console.error('Error processing callback:', error);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.qemura.xyz';
    const redirectUrl = new URL('/', baseUrl);
    redirectUrl.searchParams.set('error', 'callback_processing_failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
