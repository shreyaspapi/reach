# Reach Backend

Backend service for the Reach dashboard that listens for Farcaster casts from connected users via Neynar webhooks.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory with:
```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
PORT=3001
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Neynar Webhook Configuration

To receive cast events from Neynar, you need to configure a webhook in the [Neynar Developer Portal](https://dev.neynar.com):

1. **Create a webhook** with the following settings:
   - **URL**: `https://your-domain.com/webhooks/neynar` (use ngrok for local testing)
   - **Event Type**: `cast.created`
   - **Subscription**: You can subscribe to:
     - **Authors**: Specific FIDs (the backend will filter these automatically)
     - **Mentions**: When specific users get mentioned
     - **Channels**: Specific channels

2. **For local development**, use [ngrok](https://ngrok.com/) to expose your local server:
```bash
ngrok http 3001
```
Then use the ngrok URL (e.g., `https://abc123.ngrok.io/webhooks/neynar`) in the Neynar webhook configuration.

## How It Works

1. The backend fetches all users from Privy who have connected their Farcaster accounts
2. It extracts their Farcaster IDs (FIDs) and maintains a list
3. When Neynar sends a webhook for a new cast, the backend checks if the author's FID is in the connected users list
4. If matched, it logs the cast and can trigger reward logic (e.g., Superfluid streams)

## Endpoints

- `POST /webhooks/neynar` - Receives webhook events from Neynar
- `GET /health` - Health check endpoint that shows connected user count and FIDs

