# Quick Start - Neynar Authentication

Get up and running with the new Neynar authentication in 5 minutes.

## Step 1: Environment Setup (2 minutes)

1. Copy the example environment file:
```bash
cp env.example.txt .env.local
```

2. Get your Neynar credentials from [Neynar Dashboard](https://dev.neynar.com/):
   - Create an account if you don't have one
   - Create a new app
   - Copy your API Key and Client ID

3. Update `.env.local`:
```bash
NEYNAR_API_KEY=your_actual_api_key_here
NEYNAR_CLIENT_ID=your_actual_client_id_here
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_actual_client_id_here
```

## Step 2: Install & Run (1 minute)

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

## Step 3: Test Authentication (2 minutes)

### Web Browser Test

1. Open http://localhost:3000
2. Click "Sign In with Neynar"
3. Sign in with your Farcaster account in the popup
4. You should be redirected to `/dashboard`

✅ **Success:** You see your profile and dashboard data

### Mini App Test (Optional)

1. Deploy to a public URL (Vercel recommended)
2. Create a Farcaster Frame pointing to your URL
3. Open in Warpcast
4. Click "Sign In with Farcaster"
5. You should be automatically authenticated

✅ **Success:** You see your dashboard without a popup

## Troubleshooting

### "Authentication failed"
- Check that your `NEYNAR_API_KEY` is correct
- Verify `NEXT_PUBLIC_NEYNAR_CLIENT_ID` matches your Neynar app

### Popup blocked
- Allow popups for localhost in your browser
- Try again

### User data not loading
- Check browser console for errors
- Verify your Neynar API key has the correct permissions
- Check that you have a valid Farcaster account

### CORS errors
- The middleware should handle this automatically
- If you see CORS errors, check that `middleware.ts` exists
- Restart your dev server

## What's Next?

- Read `NEYNAR_AUTH_MIGRATION.md` for detailed architecture
- See `TESTING_GUIDE.md` for comprehensive testing
- Check `MIGRATION_SUMMARY.md` for all changes

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Key Files to Know

- `contexts/neynar-context.tsx` - Authentication state
- `components/neynar-auth.tsx` - Sign in component
- `app/api/auth/verify/route.ts` - Verification endpoint
- `middleware.ts` - CORS handling

## Getting Help

1. Check the browser console for errors
2. Check the terminal for server errors
3. Review the documentation files
4. Check Neynar's status page: https://status.neynar.com/

## Success Checklist

- [ ] Environment variables set
- [ ] Development server running
- [ ] Can sign in via web browser
- [ ] Profile data loads correctly
- [ ] Dashboard displays properly
- [ ] Can sign out successfully

Once all items are checked, you're ready to develop!

## Optional: Clean Up Old Dependencies

If you want to remove the old Farcaster Auth Kit dependencies:

```bash
npm uninstall @farcaster/auth-kit @farcaster/auth-client @farcaster/quick-auth
```

**Note:** Keep `@farcaster/miniapp-sdk` - it's still needed for Mini App support.

---

**That's it!** You're now using Neynar authentication with full Mini App support and CORS handling. 🎉

