# OnchainKit API Key Setup

## Why You Need This

The **Base Name resolution** feature (e.g., `shreyaspapi.base.eth` → `0x123...`) requires an OnchainKit API key from Coinbase Developer Platform.

Without this key, users will see "Base Name not found" when entering Base Names.

## How to Get Your API Key

### Step 1: Visit Coinbase Developer Platform
Go to: **https://portal.cdp.coinbase.com/**

### Step 2: Sign In or Create Account
- Sign in with your Coinbase account
- Or create a new developer account

### Step 3: Create a New Project
1. Click **"Create Project"** or **"New Project"**
2. Give it a name (e.g., "Luno Wrapped")
3. Select **"OnchainKit"** or **"Base"** as the product

### Step 4: Get Your API Key
1. Navigate to your project settings or API keys section
2. Copy your **API Key** (sometimes called "Project ID" or "Public API Key")
3. This will be a string like: `abc123def456...`

### Step 5: Add to Your `.env` File
Add this line to your `.env` or `.env.local` file:

```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_actual_api_key_here
```

**Important:** 
- The key MUST start with `NEXT_PUBLIC_` for Next.js to expose it to the client
- Replace `your_actual_api_key_here` with your actual key
- Restart your dev server after adding the key

### Step 6: Verify It Works
1. Restart your dev server: `npm run dev`
2. Go to `/wrapped` page
3. Enter a Base Name like `shreyaspapi.base.eth`
4. You should now see "Resolves to: 0x..." instead of "Base Name not found"

## Troubleshooting

### Still seeing "Base Name not found"?

1. **Check the key is correct:**
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_ONCHAINKIT_API_KEY
   ```

2. **Verify the key is in `.env` file:**
   ```bash
   cat .env | grep ONCHAINKIT
   ```

3. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

4. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for OnchainKit or API key related errors

### Rate Limits

- The free tier typically includes sufficient requests for development
- For production, consider upgrading your Coinbase Developer Platform plan

## More Information

- OnchainKit Documentation: https://docs.base.org/onchainkit
- Coinbase Developer Platform: https://portal.cdp.coinbase.com/
- Base Names Guide: https://docs.base.org/base-names
