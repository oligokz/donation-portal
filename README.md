# MyInfo v5 Test Integration

A production-ready Next.js application implementing MyInfo (Singpass) v5 integration with full OAuth2.1/OIDC FAPI 2.0 compliance.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Singpass Developer Portal Setup](#singpass-developer-portal-setup)
  - [Environment Variables](#environment-variables)
  - [Key Generation](#key-generation)
- [Deployment](#deployment)
  - [Docker Deployment](#docker-deployment)
  - [Vercel/Railway Deployment](#vercelrailway-deployment)
- [Testing](#testing)
- [Architecture](#architecture)
- [API Routes](#api-routes)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Production Checklist](#production-checklist)

---

## Overview

This application demonstrates a complete MyInfo v5 integration following the OAuth2.1 Authorization Code Flow with PKCE, DPoP (Demonstration of Proof-of-Possession), and JWT-based client authentication. It retrieves user data from Singapore's MyInfo service after Singpass authentication.

**Key Standards Implemented:**
- OAuth 2.1 (RFC 6749 + enhancements)
- OpenID Connect (OIDC)
- FAPI 2.0 (Financial-grade API)
- PKCE (RFC 7636)
- DPoP (RFC 9449)
- JWT Client Authentication (RFC 7523)

---

## Features

✅ **Complete OAuth2.1/OIDC Flow**
- Authorization with PKCE (Proof Key for Code Exchange)
- JWT-based client assertion (no static secrets)
- DPoP token binding for enhanced security
- Adaptive Bearer/DPoP authorization (staging compatibility)

✅ **Secure Data Handling**
- JWE (JSON Web Encryption) for data encryption
- JWS (JSON Web Signature) for data integrity
- Ephemeral key generation per session
- Secure session management

✅ **Production Ready**
- TypeScript for type safety
- Docker support with Docker Compose
- Environment-based configuration
- Comprehensive error handling
- JWKS endpoint for public key distribution

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** 18.x or higher
2. **npm** or **yarn** package manager
3. **Docker** and **Docker Compose** (for Docker deployment)
4. **Singpass Developer Portal Account** ([Register here](https://www.developer.tech.gov.sg/))
5. **OpenSSL** (for key generation)
6. **A publicly accessible domain** with HTTPS (required for Singpass)

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd myinfo-test
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `axios` - HTTP client
- `jose` - JOSE (JWT/JWE/JWS) library
- TypeScript and related types

---

## Configuration

### Singpass Developer Portal Setup

#### Step 1: Create a New App

1. Log in to the [Singpass Developer Portal](https://www.developer.tech.gov.sg/)
2. Navigate to **My Apps** → **Create New App**
3. Fill in the app details:
   - **App Name**: `test-app` (or your preferred name)
   - **Industry**: Select your industry
   - **App Category**: General
   - **Description**: Brief description of your app

#### Step 2: Configure App Settings

Navigate to your app's configuration page and set:

**General Settings:**
- **Profile Type**: UUID only (or UUID + NRIC based on your needs)
- **Authentication Type**: 1FA (or 2FA for production)
- **Site URL(s)**: `https://yourdomain.com`
- **Redirect URL(s)**: `https://yourdomain.com/redirect`
  - ⚠️ **Must be HTTPS** (except localhost for development)
  - Must match exactly what you use in the authorization request
- **JWKS Endpoint**: `https://yourdomain.com/.well-known/jwks.json`
  - This is where you'll serve your public keys
  - Must be publicly accessible (no authentication required)
  - Must be on port 443 (HTTPS)

**Scopes Selection:**
- Select the data attributes you need (e.g., `name`, `email`, `mobileno`)
- For this test app: `openid`, `name`

**App Purpose:**
- **Purpose Description**: "Test MyInfo integration" (or your actual purpose)
- This is shown to users during consent

**Security:**
- **Assurance Level**: 2 (standard for most apps)

#### Step 3: Note Your Credentials

After creating the app, you'll receive:
- **App ID (Client ID)**: e.g., `KD5ZM*************************heqQV`
- This is your `MYINFO_CLIENT_ID`

---

### Key Generation

MyInfo v5 requires two ECDSA P-256 key pairs:
1. **Signing Key**: For client assertion JWTs
2. **Encryption Key**: For decrypting MyInfo data

#### Generate Keys with OpenSSL

```bash
# Generate signing key pair (PKCS8 format for private key)
openssl ecparam -name prime256v1 -genkey -noout -out signing-private.pem
openssl pkcs8 -topk8 -nocrypt -in signing-private.pem -out signing-private-pkcs8.pem
openssl ec -in signing-private-pkcs8.pem -pubout -out signing-public.pem

# Generate encryption key pair (PKCS8 format)
openssl ecparam -name prime256v1 -genkey -noout -out encryption-private.pem
openssl pkcs8 -topk8 -nocrypt -in encryption-private.pem -out encryption-private-pkcs8.pem
openssl ec -in encryption-private-pkcs8.pem -pubout -out encryption-public.pem
```

**Alternative: Use SEC1 Format (also supported)**

```bash
# If you already have SEC1 format keys, they work too
openssl ecparam -name prime256v1 -genkey -noout -out signing-private-sec1.pem
openssl ec -in signing-private-sec1.pem -pubout -out signing-public.pem
```

#### Important Notes:

- ⚠️ **Keep private keys secure**: Never commit them to version control
- 🔄 **Use different keys for staging and production**
- 📝 **PKCS8 format is recommended** but SEC1 format also works
- 🔑 **The public keys will be served via your JWKS endpoint**

---

### Environment Variables

#### Create `.env` file

Create a `.env` file in the project root (for Docker) or `.env.local` (for local development):

```bash
# MyInfo Configuration
MYINFO_ENV=staging
MYINFO_CLIENT_ID=your_client_id_from_portal
MYINFO_REDIRECT_URI=https://yourdomain.com/redirect
MYINFO_JWKS_URI=https://yourdomain.com/.well-known/jwks.json
MYINFO_SCOPES=openid name

# Private Keys (PKCS8 or SEC1 format)
MYINFO_SIGNING_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n******\n-----END EC PRIVATE KEY-----"

MYINFO_ENCRYPTION_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n******\n-----END EC PRIVATE KEY-----"

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### For Production Deployment

If using PKCS8 format (recommended):

```bash
MYINFO_SIGNING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n******\n-----END PRIVATE KEY-----"
```

#### Important Environment Variable Notes:

1. **Multi-line Keys**: 
   - Wrap the entire key (including headers) in quotes
   - Use actual newlines or `\n` characters
   - Docker/Next.js will handle both formats

2. **MYINFO_REDIRECT_URI**:
   - Must match exactly what's in the Singpass portal
   - Must be HTTPS (except localhost)
   - No trailing slash

3. **MYINFO_JWKS_URI**:
   - Must be publicly accessible
   - Must return your public keys in JWKS format
   - Will be accessed by Singpass servers

4. **NEXT_PUBLIC_SITE_URL**:
   - Used for OAuth redirects
   - Must be your public domain
   - Required for Docker deployments behind reverse proxy

---

## Deployment

### Docker Deployment

This is the recommended deployment method for production.

#### 1. Build the Docker Image

```bash
docker-compose build
```

#### 2. Start the Application

```bash
docker-compose up -d
```

The app will be available on port 3000 (configure your reverse proxy to forward to it).

#### 3. Configure Reverse Proxy (e.g., Traefik, Nginx)

**Example Traefik labels in `docker-compose.yml`:**

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.myinfo.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.myinfo.entrypoints=websecure"
  - "traefik.http.routers.myinfo.tls.certresolver=letsencrypt"
  - "traefik.http.services.myinfo.loadbalancer.server.port=3000"
```

**Example Nginx configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Verify JWKS Endpoint

After deployment, verify your JWKS endpoint is accessible:

```bash
curl https://yourdomain.com/.well-known/jwks.json
```

Expected response:
```json
{
  "keys": [
    {
      "kty": "EC",
      "x": "...",
      "y": "...",
      "crv": "P-256",
      "kid": "sig-key-1",
      "use": "sig",
      "alg": "ES256"
    },
    {
      "kty": "EC",
      "x": "...",
      "y": "...",
      "crv": "P-256",
      "kid": "enc-key-1",
      "use": "enc",
      "alg": "ECDH-ES+A256KW"
    }
  ]
}
```

⚠️ **Verify that the `d` parameter (private key) is NOT present in the JWKS!**

---

### Vercel/Railway Deployment

#### 1. Set Environment Variables

In your deployment platform's dashboard, add all the environment variables from your `.env` file.

**Important for multi-line keys:**
```bash
# Use literal \n for newlines in the platform UI
MYINFO_SIGNING_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE...\n-----END EC PRIVATE KEY-----"
```

#### 2. Deploy

```bash
# Vercel
vercel --prod

# Railway
railway up
```

#### 3. Configure Custom Domain

Set up your custom domain in the platform's DNS settings and ensure HTTPS is enabled.

---

## Testing

### Testing in Staging Environment

#### 1. Navigate to Your App

```
https://yourdomain.com
```

#### 2. Click "Login with Singpass"

This initiates the OAuth flow and redirects you to Singpass staging.

#### 3. Use Test Credentials

In the Singpass Developer Portal, you'll find test personas with demo credentials:
- Test NRIC numbers
- Demo Singpass passwords
- Various data scenarios

**Example Test Users:**
- NRIC: `S9812381D` (use the test credentials provided in the portal)

#### 4. Grant Consent

After login, you'll see a consent screen showing:
- The data being requested (e.g., name)
- Your app's purpose
- Option to approve or deny

#### 5. View Retrieved Data

After granting consent, you'll be redirected back to your app with the name displayed:

```
Success!
Name retrieved from MyInfo: John Doe
```

### Troubleshooting Test Issues

**If you get "Request parameters invalid" (PX-E1000):**
- Verify your redirect URI matches exactly
- Check that JWKS endpoint is accessible
- Ensure environment variables are loaded

**If you get "Invalid JWKS object" (PX-E0101):**
- Verify JWKS endpoint returns valid JSON
- Check that private keys (`d` parameter) are NOT in the JWKS
- Ensure both signing and encryption keys are present

**If you get 401 on userinfo:**
- This is expected in staging if token_type is "Bearer"
- The app automatically adapts to Bearer tokens in staging

**If name shows "Unknown":**
- Check server logs for decryption errors
- Verify encryption private key is correct
- Ensure MyInfo JWKS is accessible for signature verification

---

## Architecture

### OAuth 2.1 Flow Overview

```
┌─────────┐                                         ┌──────────────┐
│         │  1. Initiate Login                     │              │
│  User   │───────────────────────────────────────>│   Your App   │
│ Browser │                                         │              │
└─────────┘                                         └──────────────┘
     │                                                      │
     │  2. Redirect to Singpass                           │
     │  (with PKCE code_challenge)                        │
     │<───────────────────────────────────────────────────┘
     │                                                      
     │                                              ┌──────────────┐
     │  3. Login & Consent                         │              │
     │─────────────────────────────────────────────>│  Singpass    │
     │                                              │  (MyInfo)    │
     │  4. Redirect back with auth code            │              │
     │<─────────────────────────────────────────────│              │
     │                                              └──────────────┘
     │                                                      
     │                                              ┌──────────────┐
     │  5. Exchange code for token                 │              │
     │  (with code_verifier + client_assertion     │   Your App   │
     │   + DPoP proof)                             │   Backend    │
     │─────────────────────────────────────────────>│              │
     │                                              └──────┬───────┘
     │                                                     │
     │                                                     │ 6. Request person data
     │                                                     │    (with access_token
     │                                              ┌──────▼───────┐  + DPoP proof)
     │                                              │              │
     │                                              │  Singpass    │◄────┐
     │                                              │  (MyInfo)    │     │
     │                                              │              │─────┘
     │                                              └──────┬───────┘
     │                                                     │
     │  7. Display data                            ┌──────▼───────┐
     │<─────────────────────────────────────────────│   Your App   │
     │                                              │              │
     │                                              └──────────────┘
```

### Detailed Flow Steps

#### Step 1: Authorization Request

**Route**: `/api/auth/myinfo`

1. Generate ephemeral ECDSA P-256 key pair (for DPoP)
2. Generate PKCE code_verifier and code_challenge
3. Store session data (code_verifier, state, ephemeral keys)
4. Redirect to Singpass `/auth` endpoint with:
   - `client_id`: Your App ID
   - `scope`: `openid name` (or other requested scopes)
   - `redirect_uri`: Your callback URL
   - `response_type`: `code`
   - `code_challenge`: SHA-256 hash of code_verifier
   - `code_challenge_method`: `S256`
   - `state`: Random string for CSRF protection
   - `nonce`: Random string for ID token validation

#### Step 2: User Authentication & Consent

User authenticates with Singpass and grants consent to share data.

#### Step 3: Authorization Callback

**Route**: `/redirect`

Singpass redirects back with:
- `code`: Authorization code
- `state`: Your state value (verify it matches)

#### Step 4: Token Exchange

**Internal**: `exchangeToken()` function

1. Generate **Client Assertion JWT**:
   - Signed with your signing private key
   - Contains `cnf.jkt` claim with ephemeral key thumbprint
   - Claims: `iss`, `sub`, `aud`, `iat`, `exp`, `jti`, `cnf`

2. Generate **DPoP Proof JWT** (for token request):
   - Signed with ephemeral private key
   - Contains ephemeral public key in header
   - Claims: `jti`, `htm`, `htu`, `iat`, `exp`

3. POST to `/token` endpoint with:
   - Form data: `grant_type`, `code`, `redirect_uri`, `client_id`, `code_verifier`, `client_assertion_type`, `client_assertion`
   - Header: `DPoP: <dpop_proof_jwt>`

4. Receive:
   - `access_token`: Bearer token (in staging) or DPoP-bound token (in production)
   - `id_token`: Encrypted JWT with user info
   - `token_type`: "Bearer" or "DPoP"

#### Step 5: Person Data Retrieval

**Internal**: `getPersonData()` function

1. Check `token_type`:
   - If "DPoP": Generate new DPoP proof with `ath` claim (access token hash)
   - If "Bearer": Use standard Bearer authorization

2. GET `/userinfo` endpoint with:
   - Header: `Authorization: Bearer <token>` or `Authorization: DPoP <token>`
   - Header (if DPoP): `DPoP: <dpop_proof_jwt>`

3. Receive encrypted response (JWE format)

#### Step 6: Data Decryption & Verification

**Internal**: `decryptAndVerifyPersonData()` function

1. **Decrypt JWE**:
   - Use your encryption private key
   - Extracts the JWS (signed payload)

2. **Verify JWS signature**:
   - Fetch MyInfo's public keys from their JWKS endpoint
   - Verify signature with matching key
   - Extract person data payload

3. **Parse Person Data**:
   - Extract user attributes (name, etc.)
   - Structure: `{ person_info: { name: { value: "..." } } }`

#### Step 7: Display Data

Redirect user to homepage with name in query params:
```
https://yourdomain.com/?name=John+Doe
```

---

## API Routes

### `/api/auth/myinfo` (GET)

Initiates the MyInfo login flow.

**Response**: Redirects to Singpass authorization endpoint

**Query Parameters Generated**:
- `client_id`: Your App ID
- `scope`: Requested scopes
- `redirect_uri`: Callback URL
- `response_type`: `code`
- `code_challenge`: PKCE challenge
- `code_challenge_method`: `S256`
- `state`: CSRF token
- `nonce`: ID token validation token

---

### `/redirect` (GET)

OAuth callback handler. Processes the authorization code and retrieves user data.

**Query Parameters Expected**:
- `code`: Authorization code from Singpass
- `state`: Must match the state sent in authorization request

**Success Response**: Redirects to `/?name=<user_name>`

**Error Responses**: 
- `/?error=invalid_state` - State mismatch (CSRF attack)
- `/?error=invalid_session` - Session not found or expired
- `/?error=token_exchange_failed` - Token exchange failed
- `/?error=callback_processing_failed` - General error

---

### `/.well-known/jwks.json` (GET)

Serves public keys in JWKS format for Singpass to encrypt data.

**Response Example**:
```json
{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "x": "base64url-encoded-x-coordinate",
      "y": "base64url-encoded-y-coordinate",
      "kid": "sig-key-1",
      "use": "sig",
      "alg": "ES256"
    },
    {
      "kty": "EC",
      "crv": "P-256",
      "x": "base64url-encoded-x-coordinate",
      "y": "base64url-encoded-y-coordinate",
      "kid": "enc-key-1",
      "use": "enc",
      "alg": "ECDH-ES+A256KW"
    }
  ]
}
```

**Important**: 
- Must be publicly accessible (no authentication)
- Must NOT contain private key components (`d` parameter)
- Cached by Singpass for up to 1 hour
- Must be HTTPS with valid certificate

---

## Security Features

### PKCE (Proof Key for Code Exchange)

**Purpose**: Prevents authorization code interception attacks

**Implementation**:
1. Generate random `code_verifier` (43-128 characters)
2. Compute `code_challenge` = BASE64URL(SHA256(code_verifier))
3. Send `code_challenge` in authorization request
4. Send `code_verifier` in token request
5. Singpass verifies: SHA256(code_verifier) === code_challenge

**Code Location**: `lib/myinfo/crypto.ts` - `generatePKCE()`

---

### DPoP (Demonstration of Proof-of-Possession)

**Purpose**: Prevents token theft by binding tokens to a specific client-held key

**Implementation**:
1. Generate ephemeral ECDSA P-256 key pair per session
2. Include ephemeral public key thumbprint in client assertion (`cnf.jkt`)
3. Sign each request (token, userinfo) with ephemeral private key
4. Include ephemeral public key in DPoP JWT header
5. Singpass validates that the same key is used throughout the flow

**Code Location**: 
- `lib/myinfo/crypto.ts` - `generateEphemeralKeyPair()`, `generateDpopProof()`
- `lib/myinfo/service.ts` - `exchangeToken()`, `getPersonData()`

---

### JWT Client Authentication

**Purpose**: Eliminates static client secrets, uses asymmetric cryptography

**Implementation**:
1. Sign client assertion JWT with your signing private key
2. Singpass fetches your public key from JWKS endpoint
3. Singpass verifies JWT signature
4. Ensures request comes from legitimate client

**Claims in Client Assertion**:
- `iss`: Your client ID (issuer)
- `sub`: Your client ID (subject)
- `aud`: Token endpoint URL
- `iat`: Issued at timestamp
- `exp`: Expiry timestamp (5 minutes)
- `jti`: Unique JWT ID (prevents replay)
- `cnf.jkt`: Ephemeral DPoP key thumbprint

**Code Location**: `lib/myinfo/crypto.ts` - `generateClientAssertion()`

---

### JWE/JWS Encryption

**Purpose**: End-to-end encryption and data integrity verification

**Flow**:
1. MyInfo signs person data with their private key (JWS)
2. MyInfo encrypts signed data with your public key (JWE)
3. You receive encrypted data
4. You decrypt with your private key (JWE → JWS)
5. You verify signature with MyInfo's public key (JWS → data)

**Algorithms**:
- **JWE**: ECDH-ES+A256KW (Elliptic Curve Diffie-Hellman Ephemeral Static + AES256 Key Wrap)
- **JWS**: ES256 (ECDSA with P-256 curve and SHA-256)

**Code Location**: `lib/myinfo/service.ts` - `decryptAndVerifyPersonData()`

---

### Session Management

**Current Implementation**: In-memory store (suitable for testing)

**Structure**:
```typescript
{
  state: {
    codeVerifier: string,
    state: string,
    ephemeralKeyPair: {
      privateKey: CryptoKey,
      publicKey: CryptoKey,
      publicJwk: JsonWebKey,
      thumbprint: string
    }
  }
}
```

**For Production**: Replace with Redis, database, or encrypted cookies

**Code Location**: `lib/myinfo/session.ts`

---

## Troubleshooting

### Common Issues

#### 1. "Request parameters invalid" (PX-E1000)

**Symptoms**: Error page from Singpass after clicking login

**Causes**:
- Redirect URI mismatch (must match exactly in portal)
- Client ID incorrect or not configured
- PKCE parameters malformed

**Solutions**:
- Verify `MYINFO_REDIRECT_URI` matches portal configuration
- Check `MYINFO_CLIENT_ID` is correct
- Ensure no trailing slashes in URIs

---

#### 2. "Invalid JWKS object" (PX-E0101)

**Symptoms**: Error page from Singpass after clicking login

**Causes**:
- JWKS endpoint not accessible
- JWKS contains private key components
- Invalid JSON format
- Wrong key types or algorithms

**Solutions**:
```bash
# Test JWKS endpoint
curl https://yourdomain.com/.well-known/jwks.json

# Verify response structure
# Should have two keys: sig and enc
# Should NOT have "d" parameter (private key)
```

**Verify JWKS format**:
```javascript
{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "x": "...",  // Public key X coordinate
      "y": "...",  // Public key Y coordinate
      "kid": "sig-key-1",
      "use": "sig",
      "alg": "ES256"
      // NO "d" parameter!
    },
    // ... encryption key
  ]
}
```

---

#### 3. Token Exchange 401 Error

**Symptoms**: `token_exchange_failed` error after Singpass redirect

**Causes**:
- Client assertion signature invalid
- Private key format incorrect
- DPoP proof malformed
- Client assertion thumbprint mismatch

**Solutions**:
- Verify private keys are in PKCS8 or SEC1 format
- Check key file has proper header/footer
- Ensure ephemeral key thumbprint is correct in client assertion
- Review server logs for detailed error messages

---

#### 4. Userinfo 401 Error

**Symptoms**: `token_exchange_failed` error after token is obtained

**Causes**:
- Using DPoP authorization with Bearer token (staging issue)
- Access token expired
- DPoP proof signature invalid

**Solutions**:
- Check that the app uses Bearer scheme when `token_type` is "Bearer"
- Verify adaptive authorization logic is working
- In staging, expect Bearer tokens (not DPoP-bound)

---

#### 5. Name Shows "Unknown"

**Symptoms**: Success page shows "Unknown" instead of actual name

**Causes**:
- Data decryption failed
- JWS signature verification failed
- Person data structure different than expected
- Encryption private key incorrect

**Solutions**:
- Check server logs for decryption errors
- Verify `MYINFO_ENCRYPTION_PRIVATE_KEY` is correct
- Ensure MyInfo JWKS endpoint is accessible
- Check that person data structure matches expected format

**Add temporary logging**:
```javascript
// In app/redirect/route.ts
console.log('Person data:', JSON.stringify(personData, null, 2));
```

---

#### 6. Environment Variables Not Loading

**Symptoms**: `undefined` values in configuration

**For Docker**:
- Verify `.env` file exists in project root
- Check `docker-compose.yml` has `env_file: - .env`
- Rebuild container: `docker-compose up --build`

**For Local Development**:
- Use `.env.local` file (not `.env`)
- Restart dev server: `npm run dev`

**For Vercel/Railway**:
- Set environment variables in platform dashboard
- Use `\n` for newlines in multi-line keys
- Redeploy after updating variables

---

### Debug Mode

To enable detailed logging, uncomment console.log statements in:

- `lib/myinfo/service.ts` - Token exchange and userinfo requests
- `lib/myinfo/crypto.ts` - Key generation and JWT creation
- `app/redirect/route.ts` - Callback processing

**Example**:
```typescript
// Decode access token payload
const accessTokenParts = response.data.access_token.split('.');
const accessTokenPayload = JSON.parse(
  Buffer.from(accessTokenParts[1], 'base64url').toString()
);
console.log('Access Token Payload:', accessTokenPayload);
```

---

## Production Checklist

### Before Going Live

#### 1. Security Audit

- [ ] Private keys secured (not in version control)
- [ ] Different keys for staging and production
- [ ] Environment variables properly configured
- [ ] HTTPS enabled on all endpoints
- [ ] JWKS endpoint publicly accessible
- [ ] No private keys in JWKS response
- [ ] Session storage is secure (not in-memory)

#### 2. Singpass Portal Configuration

- [ ] Production app created and configured
- [ ] Correct production App ID in environment
- [ ] Production redirect URI matches exactly
- [ ] Production JWKS URL configured
- [ ] All required scopes approved
- [ ] App purpose clearly stated
- [ ] Contact emails updated

#### 3. Infrastructure

- [ ] HTTPS certificate valid and not expired
- [ ] Domain DNS configured correctly
- [ ] Reverse proxy configured (if applicable)
- [ ] Load balancer configured (if applicable)
- [ ] Firewall rules allow HTTPS traffic
- [ ] Health check endpoint configured

#### 4. Testing

- [ ] Full OAuth flow tested in production
- [ ] Test with multiple user accounts
- [ ] Error scenarios tested (deny consent, network errors)
- [ ] JWKS endpoint tested from external network
- [ ] Token exchange tested
- [ ] Data decryption tested
- [ ] Performance tested under load

#### 5. Monitoring

- [ ] Error logging configured
- [ ] Application monitoring set up
- [ ] Alerts configured for failures
- [ ] Audit logging for data access
- [ ] Rate limiting configured

#### 6. Compliance

- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Data retention policy defined
- [ ] User consent recorded
- [ ] PDPA compliance verified

#### 7. Production Endpoints

Update environment variables to use production endpoints:

```bash
MYINFO_ENV=production
MYINFO_CLIENT_ID=<production_client_id>
MYINFO_REDIRECT_URI=https://yourdomain.com/redirect
MYINFO_JWKS_URI=https://yourdomain.com/.well-known/jwks.json
```

**Production Singpass endpoints** (automatically used when `MYINFO_ENV=production`):
- Authorization: `https://id.singpass.gov.sg/auth`
- Token: `https://id.singpass.gov.sg/token`
- Userinfo: `https://id.singpass.gov.sg/userinfo`
- JWKS: `https://id.singpass.gov.sg/.well-known/keys`

---

## Additional Resources

### Official Documentation

- [Singpass Developer Portal](https://www.developer.tech.gov.sg/)
- [MyInfo Technical Documentation](https://public.cloud.myinfo.gov.sg/myinfo/api/myinfo-kyc-v4.0.html)
- [FAPI 2.0 Specification](https://openid.net/specs/fapi-2_0.html)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07)
- [DPoP RFC 9449](https://datatracker.ietf.org/doc/html/rfc9449)

### Support

- **Singpass Partner Support**: [partnersupport.singpass.gov.sg](https://partnersupport.singpass.gov.sg/hc/en-sg)
- **Developer Portal**: Check announcements for maintenance windows
- **Technical Issues**: Contact Singpass support with error codes

### Key Specifications

- **PKCE**: RFC 7636
- **JWT**: RFC 7519
- **JWE**: RFC 7516
- **JWS**: RFC 7515
- **DPoP**: RFC 9449
- **Client Authentication**: RFC 7523

---

## License

This project is for demonstration purposes. Ensure compliance with Singpass terms of service and Singapore's PDPA when using MyInfo data.

---

## Contributing

When contributing, ensure:
- No private keys in commits
- TypeScript types properly defined
- Error handling comprehensive
- Security best practices followed
- Documentation updated

---

**Last Updated**: October 2025  
**MyInfo Version**: v5  
**Next.js Version**: 16.0.1
