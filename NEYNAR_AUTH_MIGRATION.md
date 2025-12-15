# Neynar Authentication Migration Guide

This document describes the migration from Farcaster Auth Kit to Neynar authentication for the Luno app, with full support for both web browsers and Farcaster Mini Apps.

## Overview

The app now uses Neynar's authentication system for both web and mini app contexts. This provides:

- ✅ Full Farcaster authentication via Neynar
- ✅ Mini App support using Farcaster Mini App SDK
- ✅ CORS support for all API routes
- ✅ Unified authentication context across the app
- ✅ User data fetching from Neynar API

## Architecture

### 1. Neynar Context Provider (`contexts/neynar-context.tsx`)

The central authentication state management system that:
- Detects if running in a Mini App context
- Manages user authentication state
- Provides user data across the app
- Handles sign-in/sign-out operations

**Usage:**
```typescript
import { useNeynar } from '@/contexts/neynar-context'

function MyComponent() {
  const { user, isAuthenticated, loading, isMiniApp, signOut, refreshUser } = useNeynar()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Welcome {user.display_name}!</div>
}
```

### 2. Authentication Component (`components/neynar-auth.tsx`)

Handles authentication for both contexts:

**Web Browser:**
- Opens Neynar's authentication popup
- Listens for authentication success messages
- Stores user data in localStorage

**Mini App:**
- Uses Farcaster Mini App SDK to get user context
- Authenticates directly with the user's FID
- Fetches user data from Neynar API

### 3. API Routes

#### `/api/auth/verify` (POST)
Verifies and creates/updates user in the database.

**Request formats:**

Mini App:
```json
{
  "fid": 12345,
  "mini_app": true
}
```

Web Browser (Neynar SIWN):
```json
{
  "fid": 12345,
  "signer_uuid": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "fid": 12345,
  "username": "username",
  "display_name": "Display Name",
  "pfp_url": "https://...",
  "custody_address": "0x...",
  "verifications": ["0x..."],
  "follower_count": 100,
  "following_count": 50
}
```

#### `/api/user/neynar/[fid]` (GET)
Fetches user data from Neynar API by FID.

**Response:**
```json
{
  "fid": 12345,
  "username": "username",
  "display_name": "Display Name",
  "pfp_url": "https://...",
  "custody_address": "0x...",
  "verifications": ["0x..."],
  "follower_count": 100,
  "following_count": 50
}
```

### 4. CORS Middleware (`middleware.ts`)

Handles CORS for all API routes:
- Responds to OPTIONS preflight requests
- Adds CORS headers to all API responses
- Allows requests from any origin (configurable)

### 5. Updated Components

All components now use the Neynar context instead of Farcaster Auth Kit:

- `app/dashboard/page.tsx` - Dashboard page
- `components/connected-accounts.tsx` - Connected accounts display
- `components/engagement-history.tsx` - User engagement history
- `hooks/use-reach-stream.ts` - Superfluid stream data hook

## Environment Variables

Make sure you have these environment variables set:

```bash
# Neynar Configuration
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_CLIENT_ID=your_neynar_client_id
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

### Testing in Web Browser

1. Navigate to the app in a web browser
2. Click "Sign In with Neynar"
3. Complete authentication in the popup
4. You should be redirected to the dashboard

### Testing in Mini App

1. Open the app in Warpcast as a Mini App
2. Click "Sign In with Farcaster"
3. The app will automatically authenticate using your Farcaster context
4. You should be redirected to the dashboard

## Migration Checklist

- [x] Created Neynar context provider
- [x] Updated authentication component for both web and mini app
- [x] Added CORS support to all API routes
- [x] Updated all components to use Neynar context
- [x] Removed Farcaster Auth Kit dependencies
- [x] Updated Next.js config to transpile Neynar packages
- [x] Created API route for fetching user data from Neynar
- [x] Updated middleware for CORS handling

## Troubleshooting

### Authentication not working in Mini App

1. Check that the Mini App SDK is properly initialized
2. Verify that the user context is available in the Mini App
3. Check browser console for errors
4. Ensure NEYNAR_API_KEY is set correctly

### CORS errors

1. Verify middleware is properly configured
2. Check that API routes are returning CORS headers
3. Ensure the middleware matcher includes your API route

### User data not loading

1. Check that NEYNAR_API_KEY is valid
2. Verify the FID is correct
3. Check Neynar API rate limits
4. Look for errors in server logs

## API Documentation

For more information on Neynar's API, see:
- [Neynar API Documentation](https://docs.neynar.com/)
- [Neynar Node.js SDK](https://github.com/neynarxyz/nodejs-sdk)

## Support

For issues or questions:
1. Check the Neynar documentation
2. Review the code comments in the authentication files
3. Check the browser console and server logs for errors

