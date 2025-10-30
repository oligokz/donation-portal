# MyInfo Integration Setup Guide

## Build Error - FIXED ✓

The TypeScript compilation error has been resolved. The build now completes successfully.

## Environment Variable Configuration

Your application expects `MYINFO_*` variable names, but your current `.env` uses `SINGPASS_*` names.

### Quick Fix: Create `.env.local`

Create a file named `.env.local` in the project root with these variables:

```env
MYINFO_ENV=staging
MYINFO_CLIENT_ID=KD5ZMr8WS2jFmJuMeE3K0wX71jXheqQV
MYINFO_REDIRECT_URI=https://test.qemura.xyz/redirect
MYINFO_JWKS_URI=https://test.qemura.xyz/.well-known/jwks
MYINFO_SCOPES=openid name
MYINFO_SIGNING_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END EC PRIVATE KEY-----\n"
MYINFO_ENCRYPTION_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END EC PRIVATE KEY-----\n"
```

### Key Differences:

| Your .env Variable | Required Variable | Notes |
|-------------------|-------------------|-------|
| `SINGPASS_CLIENT_ID` | `MYINFO_CLIENT_ID` | ✓ Same value |
| `SINGPASS_REDIRECT_URI` | `MYINFO_REDIRECT_URI` | ⚠️ Your value: `/.auth/callback`, app uses `/redirect` |
| `SINGPASS_JWKS_URL` | `MYINFO_JWKS_URI` | ✓ Same value |
| `SINGPASS_PRIVATE_KEY` | `MYINFO_SIGNING_PRIVATE_KEY` | ✓ Your EC private key (supports SEC1 & PKCS8) |
| `SINGPASS_ENC_PRIVATE_KEY` | `MYINFO_ENCRYPTION_PRIVATE_KEY` | ✓ Your EC private key (supports SEC1 & PKCS8) |

### Key Format Support

The application now supports both SEC1 and PKCS8 private key formats:

**SEC1 Format (EC Private Key):**
```
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIOJ5...
-----END EC PRIVATE KEY-----
```

**PKCS8 Format (Private Key):**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

The application will automatically detect and convert between formats as needed.

### ⚠️ Important: Redirect URI Mismatch

- Your `.env`: `https://test.qemura.xyz/.auth/callback`
- App route: `https://test.qemura.xyz/redirect`

**Options:**
1. Update Singpass Developer Portal to use `/redirect` (recommended)
2. OR create a redirect from `.auth/callback` to `/redirect` in your Next.js app

### Variables NOT Used

These variables from your `.env` are NOT needed for MyInfo v5 integration:
- `MYINFO_API_BASE_URL` (v3/v4 API)
- `MYINFO_PERSON_URL` (v3/v4 API)
- `MYINFO_PURPOSE_ID` (v3/v4 API)
- `MYINFO_USE_FULL_SCOPES` (not used)
- `NEXTAUTH_SECRET` (NextAuth not used)
- All `SINGPASS_*_URL` variables (hardcoded in app)

## Next Steps

1. ✅ Build error fixed
2. Create `.env.local` with `MYINFO_*` variables
3. Replace key placeholders with actual EC private keys in PEM format
4. Verify redirect URI matches between `.env.local` and Singpass portal
5. Deploy to `https://test.qemura.xyz`
6. Test the integration

## Testing

Once configured, you can test by:
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Login with Singpass"
4. Use Singpass staging test credentials
5. View retrieved name data

