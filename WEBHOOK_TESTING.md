# Webhook Testing with ngrok

This guide will help you test the Neynar webhooks locally using ngrok.

## Prerequisites

✅ ngrok is installed (via Homebrew)

## Setup Steps

### 1. Start Your Next.js Development Server

```bash
npm run dev
```

This will start your server on `http://localhost:3000`

### 2. Start ngrok Tunnel

In a **new terminal window**, run:

```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       [Your Account]
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://xxxx-xx-xx-xxx-xxx.ngrok-free.app -> http://localhost:3000
```

### 3. Copy Your ngrok URL

Copy the `https://xxxx-xx-xx-xxx-xxx.ngrok-free.app` URL from the ngrok output.

### 4. Configure Neynar Webhook

Go to your Neynar dashboard and add the webhook URL:

```
https://your-ngrok-url.ngrok-free.app/api/webhooks/neynar
```

**Example:**
```
https://abc123-45-67-890-123.ngrok-free.app/api/webhooks/neynar
```

### 5. Test the Webhook

You can test the webhook by:

1. **Health Check**: Visit `https://your-ngrok-url.ngrok-free.app/api/health` in your browser
   - Should return: `{"status":"ok","connectedUsers":0,"fids":[],"timestamp":"..."}`

2. **Manual Test**: Use curl to send a test webhook:
   ```bash
   curl -X POST https://your-ngrok-url.ngrok-free.app/api/webhooks/neynar \
     -H "Content-Type: application/json" \
     -d '{
       "type": "cast.created",
       "data": {
         "author": {
           "fid": 12345,
           "username": "testuser"
         },
         "text": "Test cast",
         "hash": "0xtest123",
         "timestamp": "2025-11-22T12:00:00Z"
       }
     }'
   ```

3. **Live Test**: Create a cast on Farcaster with a connected account and watch your terminal logs

## What to Look For

### In Your Terminal (where `npm run dev` is running):

When a webhook is received, you should see:
```
---------------------------------------------------
🔔 CAST DETECTED from Connected User (FID: 12345)
User: @testuser
Text: Test cast
Hash: 0xtest123
Timestamp: 2025-11-22T12:00:00Z
---------------------------------------------------
```

### In ngrok Web Interface:

Visit `http://localhost:4040` to see:
- All HTTP requests to your tunnel
- Request/response details
- Replay requests for debugging

## Important Notes

⚠️ **ngrok Free Tier**: 
- URL changes every time you restart ngrok
- You'll need to update the webhook URL in Neynar dashboard each time
- Consider upgrading to ngrok paid plan for a static domain

⚠️ **Environment Variables**:
Make sure your `.env` file has:
```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## Troubleshooting

### Webhook not receiving events?
1. Check ngrok is running: `http://localhost:4040`
2. Verify the webhook URL in Neynar dashboard
3. Check your terminal logs for errors
4. Test with curl command above

### "User not found" in logs?
- The user must be connected via Privy first
- Check `/api/health` to see connected FIDs
- The sync runs every 5 minutes automatically

### ngrok connection refused?
- Make sure Next.js dev server is running on port 3000
- Try restarting ngrok

## Quick Start Script

You can also create a script to start everything:

```bash
# Start dev server in background
npm run dev &

# Wait for server to start
sleep 5

# Start ngrok
ngrok http 3000
```

## Next Steps

Once testing is complete and you deploy to production:
1. Deploy to Vercel/Azure
2. Update Neynar webhook URL to your production URL
3. No need for ngrok in production!

