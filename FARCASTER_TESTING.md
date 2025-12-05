# Testing Your Farcaster Mini App

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Your app runs on `http://localhost:3000`

### 2. Expose to Public Internet

#### Option A: Using ngrok (Recommended)
```bash
# In a new terminal
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok-free.app`

#### Option B: Using Cloudflare Tunnel
```bash
# Install (one-time)
brew install cloudflare/cloudflare/cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:3000
```

### 3. Test in Warpcast

#### Web Testing:
1. Go to [warpcast.com](https://warpcast.com)
2. Create a new cast
3. Paste your ngrok/cloudflare URL
4. Warpcast will show a preview - click to open

#### Mobile Testing:
1. Open Warpcast app on your phone
2. Create a cast and paste your public URL
3. Tap the preview to launch your mini app
4. Test the Farcaster sign-in flow

### 4. Frame Validator
Test your Frame metadata at:
- [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)
- Paste your public URL to validate

## 🛠️ Development Tips

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app
```

### Debugging
- Check browser console for errors
- Use Warpcast's developer tools
- Test authentication flow thoroughly

### Common Issues

**ngrok session expired:**
- Free ngrok URLs expire after 2 hours
- Restart ngrok to get a new URL
- Consider ngrok Pro for persistent URLs

**Authentication not working:**
- Ensure your public URL is accessible
- Check Farcaster Auth Kit configuration
- Verify CORS headers are set correctly

## 📱 Production Deployment

Once ready to deploy:

1. **Deploy to Vercel/Netlify:**
   ```bash
   vercel deploy
   # or
   netlify deploy
   ```

2. **Update manifest.json** with production URL

3. **Submit to Farcaster:**
   - Visit [Warpcast Developers](https://warpcast.com/~/developers)
   - Register your mini app
   - Provide your production URL

## 🔗 Useful Links

- [Farcaster Docs](https://docs.farcaster.xyz/)
- [Farcaster Auth Kit](https://docs.farcaster.xyz/auth-kit/introduction)
- [Warpcast Developers](https://warpcast.com/~/developers)
- [Frame Spec](https://docs.farcaster.xyz/reference/frames/spec)

## 🎯 Next Steps

- Test sign-in flow with Farcaster
- Verify dashboard loads correctly
- Test engagement tracking features
- Ensure responsive design on mobile
- Test in both Warpcast web and mobile apps
