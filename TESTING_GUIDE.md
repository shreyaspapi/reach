# Testing Guide - Neynar Authentication

This guide will help you test the new Neynar authentication system in both web and mini app contexts.

## Prerequisites

1. **Neynar API Key**: Get one from [Neynar Dashboard](https://dev.neynar.com/)
2. **Neynar Client ID**: Create an app in the Neynar Dashboard
3. **Farcaster Account**: You'll need a Farcaster account to test

## Setup

1. Copy the environment variables:
```bash
cp env.example.txt .env.local
```

2. Fill in your Neynar credentials in `.env.local`:
```bash
NEYNAR_API_KEY=your_actual_api_key
NEYNAR_CLIENT_ID=your_actual_client_id
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_actual_client_id
```

3. Install dependencies (if not already done):
```bash
npm install
# or
yarn install
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## Testing Scenarios

### 1. Web Browser Authentication

**Steps:**
1. Open http://localhost:3000 in your browser
2. Click "Sign In with Neynar"
3. A popup window should open with Neynar's authentication
4. Sign in with your Farcaster account
5. The popup should close and you should be redirected to /dashboard
6. Verify that your profile information is displayed correctly

**What to check:**
- ✅ User profile loads correctly
- ✅ Connected accounts show your Farcaster profile
- ✅ Wallet address is displayed (if verified)
- ✅ Engagement history loads
- ✅ Active campaigns are displayed

**Common issues:**
- **Popup blocked**: Allow popups for localhost
- **Authentication fails**: Check NEYNAR_API_KEY and CLIENT_ID
- **User data not loading**: Check browser console for API errors

### 2. Mini App Authentication

**Steps:**
1. Deploy your app to a public URL (Vercel, Railway, etc.)
2. Create a Farcaster Frame/Mini App pointing to your URL
3. Open the Mini App in Warpcast
4. Click "Sign In with Farcaster"
5. You should be automatically authenticated using your Warpcast context
6. Verify that you're redirected to /dashboard

**What to check:**
- ✅ Mini App SDK initializes correctly
- ✅ User FID is detected from Mini App context
- ✅ Authentication happens without popup
- ✅ User data loads from Neynar API
- ✅ Dashboard displays correctly in Mini App

**Common issues:**
- **Mini App context not detected**: Check that you're opening in Warpcast
- **FID not found**: Verify Mini App SDK is properly initialized
- **CORS errors**: Check that middleware is properly configured

### 3. Testing CORS

**Using curl:**
```bash
# Test OPTIONS preflight
curl -X OPTIONS http://localhost:3000/api/auth/verify \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Test POST request
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"fid": 12345, "mini_app": true}' \
  -v
```

**What to check:**
- ✅ OPTIONS request returns 200
- ✅ Response includes CORS headers
- ✅ POST request succeeds with CORS headers

### 4. Testing User Data Fetching

**Test the Neynar API route:**
```bash
# Replace 12345 with a real FID
curl http://localhost:3000/api/user/neynar/12345
```

**Expected response:**
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

### 5. Testing Authentication Persistence

**Steps:**
1. Sign in successfully
2. Refresh the page
3. You should remain signed in
4. Open browser DevTools > Application > Local Storage
5. Verify `neynar_user` key exists with your user data

**What to check:**
- ✅ User remains authenticated after refresh
- ✅ User data persists in localStorage
- ✅ Dashboard loads without re-authentication

### 6. Testing Sign Out

**Steps:**
1. Sign in successfully
2. Navigate to /dashboard
3. Click the sign out button (top right)
4. You should be redirected to the home page
5. Verify localStorage is cleared

**What to check:**
- ✅ User is signed out
- ✅ Redirected to home page
- ✅ localStorage `neynar_user` is removed
- ✅ Cannot access /dashboard without signing in again

## Debugging Tips

### Enable Verbose Logging

Add this to your component to see detailed auth flow:
```typescript
useEffect(() => {
  console.log('Auth state:', { user, isAuthenticated, loading, isMiniApp })
}, [user, isAuthenticated, loading, isMiniApp])
```

### Check Network Requests

1. Open browser DevTools > Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to:
   - `/api/auth/verify`
   - `/api/user/neynar/[fid]`
   - `/api/dashboard/*`

### Check Server Logs

Watch the terminal where `npm run dev` is running for:
- Neynar API errors
- Database errors
- CORS issues

### Common Error Messages

**"User not found"**
- The FID doesn't exist or Neynar API can't find it
- Check that the FID is correct

**"Failed to fetch user data from Neynar"**
- NEYNAR_API_KEY is invalid or missing
- Rate limit exceeded
- Network error

**"Missing required parameters"**
- Request body is malformed
- Check that you're sending the correct data format

**CORS errors**
- Middleware not properly configured
- Check that the route is matched by middleware
- Verify CORS headers are being sent

## Performance Testing

### Load Testing Authentication

```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd

# Test auth endpoint
ab -n 100 -c 10 -T 'application/json' \
  -p test-payload.json \
  http://localhost:3000/api/auth/verify
```

Create `test-payload.json`:
```json
{"fid": 12345, "mini_app": true}
```

**What to check:**
- ✅ All requests succeed
- ✅ Average response time < 500ms
- ✅ No rate limiting errors

## Security Testing

### Test Invalid Inputs

```bash
# Test with invalid FID
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"fid": "invalid", "mini_app": true}'

# Test with missing parameters
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{}'

# Test with SQL injection attempt
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"fid": "1; DROP TABLE users;--", "mini_app": true}'
```

**What to check:**
- ✅ Returns appropriate error messages
- ✅ Doesn't crash the server
- ✅ Doesn't leak sensitive information

## Automated Testing

Create a test script `test-auth.sh`:

```bash
#!/bin/bash

echo "Testing Neynar Authentication..."

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://localhost:3000/api/health | jq .

# Test 2: CORS preflight
echo "2. Testing CORS..."
curl -s -X OPTIONS http://localhost:3000/api/auth/verify \
  -H "Origin: http://localhost:3000" \
  -I | grep -i "access-control"

# Test 3: User data fetch
echo "3. Testing user data fetch..."
curl -s http://localhost:3000/api/user/neynar/3 | jq .

echo "Tests complete!"
```

Run with:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

## Troubleshooting Checklist

- [ ] Environment variables are set correctly
- [ ] Neynar API key is valid
- [ ] Development server is running
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] CORS headers are present in responses
- [ ] Mini App SDK is initialized (for mini app testing)
- [ ] User data is being stored in localStorage
- [ ] Database connection is working

## Next Steps

After successful testing:

1. Deploy to production
2. Update Neynar app settings with production URL
3. Test in production environment
4. Monitor error rates and performance
5. Set up analytics for authentication flow

## Support

If you encounter issues:

1. Check this guide first
2. Review the NEYNAR_AUTH_MIGRATION.md documentation
3. Check Neynar API status: https://status.neynar.com/
4. Review Neynar documentation: https://docs.neynar.com/

